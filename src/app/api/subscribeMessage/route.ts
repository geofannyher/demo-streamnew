import { NextApiResponse } from "next";
import amqp, { Message } from "amqplib";
import { NextResponse } from "next/server";

let connection: amqp.Connection | any = null;
let channel: amqp.Channel | any = null;

async function setupRabbitMQ() {
  if (!process.env.NEXT_RABBITMQ_URL) {
    throw new Error("RabbitMQ URL is not defined");
  }
  connection = await amqp.connect(process.env.NEXT_RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("audio_queue1", { durable: false });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, res: NextApiResponse) {
  const encoder = new TextEncoder();
  try {
    if (!connection || !channel) {
      await setupRabbitMQ();
    }

    const stream = new ReadableStream({
      start(controller) {
        channel.consume(
          "audio_queue1",
          (msg: Message | null) => {
            if (msg !== null) {
              console.log("Received message:", msg.content.toString());

              console.log(msg);
              // Decode the received message
              const data = JSON.parse(msg.content.toString());

              // Prepare the response data
              const responseData = {
                message: data.message,
                videoUrl: data.videoUrl,
                model_name: data.model_name,
              };

              controller.enqueue(
                encoder.encode("data: " + JSON.stringify(responseData) + "\n\n")
              );
              channel.ack(msg);
            }
          },
          { noAck: false }
        );
      },
    });

    console.log("SSE Connection opened");
    return new NextResponse(stream, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
        "Content-Encoding": "none",
      },
    });
  } catch (error) {
    console.error("Error subscribing to messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Error subscribing to messages" });
  }
}
