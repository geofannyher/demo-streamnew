// Interface untuk model
interface Model {
  video_url: string; // URL video
}

// Interface untuk action
export interface Action {
  model_name: string; // Nama model
  time_start: string; // Waktu mulai
  time_end: string; // Waktu akhir
  model: Model; // Model yang terkait, bisa null jika tidak ada
}
