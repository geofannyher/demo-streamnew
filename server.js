import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  // Supabase setup
  const supabaseUrl = "https://raudgqgetssjclogeaex.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdWRncWdldHNzamNsb2dlYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMxMDIwOTAsImV4cCI6MjAzODY3ODA5MH0.32lHuM9Q_yuFK19HoqhfjX4Urr5xeXy5UVvTdbl8p9o";
  const supabase = createClient(supabaseUrl, supabaseKey);
  const io = new Server(httpServer);
  let isProcessing = false;
  supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
      },
      () => {
        if (!isProcessing) {
          processQueue();
        }
      }
    )
    .subscribe();

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("audio_finished", () => {
      isProcessing = false; // Tandai bahwa audio telah selesai diputar
      processQueue(); // Lanjutkan pemrosesan antrian
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  const processQueue = async () => {
    if (isProcessing) {
      console.log("Audio sedang diputar, menunggu sampai selesai..."); // Jangan proses jika ada pemrosesan yang sedang berjalan
      return; // Keluar dari fungsi untuk menunggu sampai audio selesai
    }

    isProcessing = true; // Tandai bahwa pemrosesan sedang berjalan

    const { data, error } = await supabase.from("queueTable").select("*");

    if (error) {
      console.error("Error fetching data from Supabase:", error);
      isProcessing = false; // Reset flag jika terjadi kesalahan
      return;
    }
    console.log(data);
    if (data.length > 0) {
      console.log(data, "data data ");
      const dataSort = data.sort((a, b) => a.position - b.position);
      const queueItem = dataSort[0];
      const { id, text, time_start, time_end, id_audio } = queueItem;
      if (text === "ready") {
        console.log("Mengirim hanya durasi...");
        io.emit("receive_message", {
          audio_url: "only",
          time_start: Number(time_start),
          time_end: Number(time_end),
        });
        console.log("durasi terkirim");
        await deleteQueueItem(id);
      } else {
        try {
          const res = await axios.post("http://localhost:3000/api/audio", {
            // const res = await axios.post("demostream.mainavatara.com/api/audio", {
            text,
            id_audio,
          });

          console.log(res?.data?.secure_url, "url teks");
          console.log(time_start, time_end, "ini waktu teks dikirim");

          io.emit("receive_message", {
            audio_url: res?.data?.secure_url,
            time_start,
            time_end,
          });
          console.log("url audio terkirim");

          await deleteQueueItem(id);
        } catch (error) {
          console.error("Error uploading audio file to Cloudinary:", error);
        }
      }
      // Setelah selesai mengirim audio, tunggu sinyal `audio_finished` dari klien sebelum melanjutkan.
    } else {
      console.log("No data in queueTable");
      isProcessing = false; // Reset flag jika tidak ada data
    }
  };

  // Fungsi untuk menghapus item dari queueTable
  const deleteQueueItem = async (id) => {
    const { error: deleteError } = await supabase
      .from("queueTable")
      .delete()
      .eq("id", id);
    if (deleteError) {
      console.error("Error deleting data from Supabase:", deleteError);
    }
    console.log("Data processed and deleted successfully");
  };
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
