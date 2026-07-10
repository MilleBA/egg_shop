// Lager en URL-vennlig slug fra en tittel (håndterer æ/ø/å).
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // fjern aksenter
    .replace(/[^a-z0-9]+/g, "-") // alt annet -> bindestrek
    .replace(/^-+|-+$/g, "") // trim bindestreker
    .slice(0, 60);
}
