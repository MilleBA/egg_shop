"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// Genererer en QR-kode som peker til en side (standard: forsiden),
// og lar deg laste den ned som PNG for utskrift.
export default function QrCode({
  path = "",
  filename = "qr.png",
  caption = "Skriv ut og heng opp.",
}: {
  path?: string;
  filename?: string;
  caption?: string;
}) {
  const [url, setUrl] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(window.location.origin + path);
  }, [path]);

  function downloadPng() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
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
          size={200}
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
      <p className="mt-2 text-center text-xs text-stone-400">{caption}</p>
    </div>
  );
}
