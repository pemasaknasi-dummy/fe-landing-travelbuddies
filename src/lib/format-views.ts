export function formatViews(num: number | undefined): string {
  if (!num) return "";
  if (num >= 1_000_000_000) return Math.floor(num / 1_000_000_000) + "m";
  if (num >= 1_000_000) return Math.floor(num / 1_000_000) + "jt";
  if (num >= 1_000) return Math.floor(num / 1_000) + "rb";
  return num.toString();
}
