export enum CaseType {
  Official = "official",
  Unofficial = "unofficial",
}

export const caseType: { [key in CaseType]: string } = {
  [CaseType.Official]: "رسمی",
  [CaseType.Unofficial]: "غیر رسمی",
};

export const caseTypes: { label: string; value: CaseType }[] = (
  Object.keys(caseType) as CaseType[]
).map((k) => {
  return { label: caseType[k], value: k };
});
