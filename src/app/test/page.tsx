"use client";
import React, { useState } from "react";

interface Month {
  value: number;
  label: string;
}

const WetonCalculator: React.FC = () => {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const months: Month[] = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const calculateWeton = (year: string, month: string, day: string): string => {
    const birthDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );

    const hitunghari = (_tanggal: Date): string => {
      const hari = _tanggal.getDay();
      switch (hari) {
        case 0:
          return "Minggu";
        case 1:
          return "Senin";
        case 2:
          return "Selasa";
        case 3:
          return "Rabu";
        case 4:
          return "Kamis";
        case 5:
          return "Jumat";
        case 6:
          return "Sabtu";
        default:
          return "";
      }
    };

    const hitungpasaran = (_tanggal: Date): string => {
      const awal = new Date(1970, 0, 2);
      const pembagian =
        (_tanggal.getTime() - awal.getTime() + 86400000) / 432000000;
      const sisa = Math.round((pembagian - Math.floor(pembagian)) * 10) / 2;
      switch (sisa) {
        case 0:
          return "Wage";
        case 1:
          return "Kliwon";
        case 2:
          return "Legi";
        case 3:
          return "Pahing";
        case 4:
          return "Pon";
        default:
          return "";
      }
    };

    const hari = hitunghari(birthDate);
    const pasaran = hitungpasaran(birthDate);
    return `${hari} ${pasaran}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const weton = calculateWeton(year, month, day);
    setResult(weton);
  };

  return (
    <div>
      <h1>Hitung Weton</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Tanggal"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          required
        />
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        >
          <option value="">Pilih Bulan</option>
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Tahun"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <button type="submit">Hitung</button>
      </form>
      {result && <h2>Hasil: {result}</h2>}
    </div>
  );
};

export default WetonCalculator;
