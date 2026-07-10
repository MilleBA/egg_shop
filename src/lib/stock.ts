export type StockKind = "sold" | "low" | "ok";

// Statusregel fra lagerbeholdning (fra designet):
//   0        -> Utsolgt
//   1..3     -> Kun {n} igjen
//   > 3      -> {n} igjen
export function stockStatus(count: number): { text: string; kind: StockKind } {
  if (count <= 0) return { text: "Utsolgt", kind: "sold" };
  if (count <= 3) return { text: `Kun ${count} igjen`, kind: "low" };
  return { text: `${count} igjen`, kind: "ok" };
}

export function priceLabel(price: number | null): string | null {
  return price == null ? null : `${price} kr`;
}
