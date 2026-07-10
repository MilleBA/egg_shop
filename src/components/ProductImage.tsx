import Image from "next/image";

// Bilde med folkekunst-ramme. Viser vev-placeholder uten bilde.
// `frame` er box-shadow-strengen (inset rammer). Standard = trippel innramming.
export default function ProductImage({
  src,
  alt,
  heightClass = "h-[250px]",
  radiusClass = "rounded-md",
  frame = "inset 0 0 0 3px #8e2323, inset 0 0 0 6px #f2e7ce, inset 0 0 0 7px rgba(200,145,46,.6)",
  sizes = "(max-width: 672px) 100vw, 672px",
  priority = false,
}: {
  src: string | null;
  alt: string;
  heightClass?: string;
  radiusClass?: string;
  frame?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`weave relative w-full overflow-hidden ${heightClass} ${radiusClass}`}
      style={{ boxShadow: frame }}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      )}
    </div>
  );
}
