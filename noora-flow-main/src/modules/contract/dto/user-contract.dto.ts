export class UserContractDto {
  id: string;
  name: string;
  lastname: string;
  username: string;
  nationalCode: string;
  email: string;
  phoneNo: string;
  constructor(data: any) {
    this.id = data?._id;
    this.name = data?.name;
    this.lastname = data?.lastname;
    this.username = data?.username;
    this.nationalCode = data?.nationalCode;
    this.email = data?.email;
    this.phoneNo = data?.phoneNo;
  }
}
