function allowEnglishChars(
  input: { target: { value: string } } | string,
  previous: string | undefined = "",
): string {
  const value = typeof input === "object" ? input.target.value : input;
  const regex = /^[a-zA-Z0-9\s!@#$%^&*(),.?":{}|<>[\]\\\/'`~\-_=+×]*$/;
  return regex.test(value) ? value : previous;
}

export { allowEnglishChars };
