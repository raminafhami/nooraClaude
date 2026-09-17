import { Personnel } from "@/hrm/personnel/models/Personnel";

const requiredProperties = [
  "fullname",
  "nationalCode",
  "fatherName",
  "birthCertificateNo",
  "birthDate",
  "birthPlace",
  "address",
  "landlineNo",
  "phoneNo",
  "academics",
  "address",
];

function validatePersonnelInformation(personnel: Personnel): boolean {
  const isValid = requiredProperties.every(
    (x) => !!personnel[x as keyof typeof personnel],
  );

  return isValid;
}

export { validatePersonnelInformation };
