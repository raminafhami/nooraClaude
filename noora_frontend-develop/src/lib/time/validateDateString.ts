export function validateDateString(date: string): boolean {
  return /^14\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(date);
}
