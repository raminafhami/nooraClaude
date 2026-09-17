import { Personnel, PersonnelApi } from "../models/Personnel";

function parsePersonnel(from: PersonnelApi): Personnel;

function parsePersonnel(from: PersonnelApi[]): Personnel[];

function parsePersonnel(
	from: PersonnelApi | PersonnelApi[],
): Personnel | Personnel[] {
	if (Array.isArray(from)) {
		return from.map((x) => parsePersonnel(x));
	}

	const result: Personnel = {
		id: from.id,
		userId: from.userId,
		username: from.user.username,
		firstname: from.user.name,
		lastname: from.user.lastname,
		fullname: `${from.user.name} ${from.user.lastname}`,
		nationalCode: from.user.nationalCode,
		internalPhoneNo: from.internalPhoneNo,
		phoneNo: from.user.phoneNo,
		email: from.user.email,
		branchId: from.user.branchId,
		fatherName: from.fatherName,
		birthCertificateNo: from.birthCertificateNo,
		birthDate: from.birthDate,
		birthPlace: from.birthPlace,
		address: from.address,
		landlineNo: from.landlineNo,
		academics: from.academics,
		jobs: from.jobs,
		maxManualTime: from.maxManualTime,
		maxExtraTime: from.maxExtraTime,
		maxDayLeave: from.maxDayLeave,
		bankAccountOwner: from.user.bankAccountOwner,
		bankAccountNumber: from.user.bankAccountNumber,
		bankCardNumber: from.user.bankCardNumber,
		bankSheba: from.user.bankSheba,
		bankName: from.user.bankName,
		bankBranch: from.user.bankBranch,

		expertises: from.expertises?.map((expertise) => ({
			id: expertise.id,
			expertiseId: expertise.expertiseId,
			status: expertise.status,
			title: expertise.title,
			type: expertise.type,
			certificate: expertise.data?.certificate,
			certificateId: expertise.data?.certificateId,
		})),
	};

	return result;
}

export { parsePersonnel };
