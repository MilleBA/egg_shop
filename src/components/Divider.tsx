// Folkekunst-signatur: gull-rule · gull-diamant · rød prikk · gull-diamant · gull-rule.
export default function Divider({
  rules = true,
  className = "",
}: {
  rules?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`}>
      {rules && <span className="h-px w-[34px] bg-gold" />}
      <span className="h-[9px] w-[9px] rotate-45 bg-gold" />
      <span className="h-[7px] w-[7px] rounded-full bg-barn" />
      <span className="h-[9px] w-[9px] rotate-45 bg-gold" />
      {rules && <span className="h-px w-[34px] bg-gold" />}
    </div>
  );
}
