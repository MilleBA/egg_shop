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
        className="rounded-md border-[1.5px] border-red bg-white p-4"
      >
        <QRCodeCanvas
          value={url}
          size={200}
          marginSize={2}
          level="M"
          fgColor="#8e2323"
        />
      </div>
      <p className="mt-3 break-all text-center font-mono text-[12px] text-unit">
        {url}
      </p>
      <button
        type="button"
        onClick={downloadPng}
        className="mt-4 rounded-[7px] bg-barn px-5 py-3 font-display text-[15px] text-card shadow-[inset_0_1px_0_rgba(255,255,255,.18)] transition hover:bg-barn-hover active:scale-[.98]"
      >
        ⬇ Last ned QR-kode (PNG)
      </button>
      <p className="mt-2 text-center font-body text-[13px] italic text-muted">
        {caption}
      </p>
    </div>
  );
}
