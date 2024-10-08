import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text, id_audio } = await req.json();

  try {
    // Request the audio from ElevenLabs API
    const result = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${id_audio}`,
      {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.95,
          style: 0,
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

    // Prepare to upload the audio to Cloudinary
    const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/dcd1jeldi/auto/upload`;

    const mainAudioBlob = new Blob([result?.data], { type: "audio/mpeg" });
    const formData = new FormData();
    formData.append("file", mainAudioBlob, "audio.mp3");
    formData.append("upload_preset", "kantor");

    // Upload the audio file to Cloudinary
    const cloudinaryResponse = await axios.post(cloudinaryUploadUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const secureUrl = cloudinaryResponse.data.secure_url;
    return NextResponse.json({ secure_url: secureUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
