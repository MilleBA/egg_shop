import Link from "next/link";

// Persistent merkevare-topbar (Telemark-rød) med rosemaling-bord under.
export default function TopBar() {
  return (
    <header>
      <div className="bg-red">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="font-display text-[19px] tracking-[.04em] text-goldtext"
          >
            🌾 Amundsen
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[.16em] text-tan">
            Homestead
          </span>
        </div>
      </div>

      {/* Rosemaling-bord (dekorativ stripe med gull-hårstreker).
          Bytt gjerne ut med ekte rosemaling-ranke senere. */}
      <div
        className="h-[10px] border-y border-gold"
        style={{
          background:
            "repeating-linear-gradient(45deg, #9c3232, #9c3232 8px, #872a2a 8px, #872a2a 16px)",
        }}
      />
    </header>
  );
}
