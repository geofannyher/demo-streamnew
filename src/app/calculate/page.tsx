"use client";
import { useState } from "react";

function TimeConverter() {
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [convertedStart, setConvertedStart] = useState("");
  const [convertedEnd, setConvertedEnd] = useState("");

  // Fungsi untuk mengonversi durasi
  const convertDuration = (duration: any) => {
    const [hours, minutes, seconds] = duration.split(":");
    const hoursInSeconds = parseInt(hours) * 3600;
    const minutesInSeconds = parseInt(minutes) * 60;
    const secondsFloat = parseFloat(seconds);
    const totalSeconds = hoursInSeconds + minutesInSeconds + secondsFloat;
    return totalSeconds.toFixed(3);
  };

  // Fungsi yang dipanggil saat submit
  const handleSubmit = (e: any) => {
    e.preventDefault();

    // Mengonversi durasi timeStart dan timeEnd
    const convertedStartValue = convertDuration(timeStart);
    const convertedEndValue = convertDuration(timeEnd);

    // Menyimpan hasil konversi ke state
    setConvertedStart(convertedStartValue);
    setConvertedEnd(convertedEndValue);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="timeStart">Time Start:</label>
          <input
            type="text"
            id="timeStart"
            value={timeStart}
            onChange={(e) => setTimeStart(e.target.value)}
            placeholder="HH:MM:SS.SS"
          />
        </div>
        <div>
          <label htmlFor="timeEnd">Time End:</label>
          <input
            type="text"
            id="timeEnd"
            value={timeEnd}
            onChange={(e) => setTimeEnd(e.target.value)}
            placeholder="HH:MM:SS.SS"
          />
        </div>
        <button type="submit">Convert</button>
      </form>

      {convertedStart && (
        <div>
          <p>Converted Time Start: {convertedStart} seconds</p>
        </div>
      )}
      {convertedEnd && (
        <div>
          <p>Converted Time End: {convertedEnd} seconds</p>
        </div>
      )}
    </div>
  );
}

export default TimeConverter;
