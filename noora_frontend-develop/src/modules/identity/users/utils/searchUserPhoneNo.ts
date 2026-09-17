function searchUserPhoneNo(value: string) {
  return { phoneNo: { $regex: value } };
}

export default searchUserPhoneNo;
