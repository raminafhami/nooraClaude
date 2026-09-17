export function extractNumbers(str: string): string {
  const s = str.replace(/\D/g, "");
  return s;
}
