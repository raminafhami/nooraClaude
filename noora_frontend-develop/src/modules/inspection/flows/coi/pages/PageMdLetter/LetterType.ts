enum LetterType {
  Md = "md",
  Sd = "sd",
}

const letterType: {
  [key in LetterType]: string;
} = {
  [LetterType.Md]: "انطباق تولیدکننده (MD)",
  [LetterType.Sd]: "انطباق عرضه کننده (SD)",
};

const letterTypeOptions: {
  label: string;
  value: LetterType;
}[] = Object.keys(letterType).map((k) => {
  const key = k as LetterType;
  return { label: letterType[key], value: key };
});

export { LetterType, letterType, letterTypeOptions };
