export enum BankLetterType {
  Source = "source",
  Destination = "destination",
}

export const bankLetterType: {
  [key in BankLetterType]: string;
} = {
  [BankLetterType.Source]: "مبدأ",
  [BankLetterType.Destination]: "مقصد",
};

export const bankLetterTypes: {
  label: string;
  value: BankLetterType;
}[] = Object.keys(bankLetterType).map((k) => {
  const key = k as BankLetterType;
  return { label: bankLetterType[key], value: key };
});
