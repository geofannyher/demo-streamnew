import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();
  try {
    const result = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/xM0TBYBF0vSckov9kDQy",
      {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.95,
          style: 0.15,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          accept: "audio/mpeg",
          "xi-api-key": "17dd999e77442c6c7e1e7733e6dd7af2",
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const audioBuffer = Buffer.from(result.data, "binary");

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
