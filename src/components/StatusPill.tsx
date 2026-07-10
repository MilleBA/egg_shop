import { stockStatus } from "@/lib/stock";

// Flate tint-piller med Telemark-rød kant.
const STYLES: Record<string, string> = {
  ok: "bg-[#e1e6ce] text-[#3e5d42]",
  low: "bg-[#f2e3b6] text-[#8a6212]",
  sold: "bg-[#edd8cc] text-[#8f4032]",
};

export default function StatusPill({
  count,
  size = "sm",
}: {
  count: number;
  size?: "sm" | "lg";
}) {
  const { text, kind } = stockStatus(count);
  const sizeClasses =
    size === "lg"
      ? "text-[12px] px-[10px] py-[4px]"
      : "text-[11px] px-[9px] py-[3px]";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded font-sans font-semibold border border-red ${sizeClasses} ${STYLES[kind]}`}
    >
      {text}
    </span>
  );
}
