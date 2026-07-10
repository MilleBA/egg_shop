"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// Genererer en QR-kode som peker til den offentlige siden,
// og lar deg laste den ned som PNG for utskrift.
export default function QrCode() {
  const [url, setUrl] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Den offentlige forsiden = origin (roten av nettstedet)
    setUrl(window.location.origin);
  }, []);

  function downloadPng() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "egg-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (!url) return null;

  return (
    <div className="flex flex-col items-center">
      <div
        ref={wrapperRef}
        className="rounded-2xl border border-stone-200 bg-white p-4"
      >
        <QRCodeCanvas
          value={url}
          size={220}
          marginSize={2}
          level="M"
          fgColor="#292524"
        />
      </div>
      <p className="mt-3 break-all text-center text-xs text-stone-400">{url}</p>
      <button
        type="button"
        onClick={downloadPng}
        className="mt-4 rounded-2xl bg-stone-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
      >
        ⬇ Last ned QR-kode (PNG)
      </button>
      <p className="mt-2 text-center text-xs text-stone-400">
        Skriv ut og heng på postkassen.
      </p>
    </div>
  );
}
