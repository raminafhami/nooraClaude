function searchUserNationalCode(value: string) {
  return { nationalCode: { $regex: value } };
}

export default searchUserNationalCode;
