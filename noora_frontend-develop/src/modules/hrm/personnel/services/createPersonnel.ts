import apiClient from "@/api/client";

import { PersonnelAcademicDegree } from "../models/PersonnelAcademicDegree";

interface PersonnelCreateModel {
	username: string;
	name: string;
	lastname: string;
	nationalCode: string;
	fatherName: string;
	phoneNo: string;
	email: string;
	password: string;
	birthCertificateNo: string;
	birthDate: string;
	birthPlace: string;
	address: string;
	landlineNo: string;
	branchId: string | null;
	internalPhoneNo?: string | null;
	academics: PersonnelAcademicDegree[];
	groups: string[];
}

interface PersonnelCreateReturn {
	id: string;
	userId: string;
}

interface PersonnelCreateApiModel {
	user: {
		username: string;
		name: string;
		lastname: string;
		nationalCode: string;
		phoneNo: string;
		email: string | null;
		branchId: string | null;
		groups: string[];
		password: string;
	};
	internalPhoneNo?: string | null;
	fatherName: string;
	birthCertificateNo: string;
	birthDate: string;
	birthPlace: string;
	address: string;
	landlineNo: string | null;
	academics: PersonnelAcademicDegree[];
}

interface PersonnelCreateApiReturn {
	id: string;
	userId: string;
}

export async function createPersonnel(
	details: PersonnelCreateModel,
): Promise<PersonnelCreateReturn> {
	const data: PersonnelCreateApiModel = {
		user: {
			username: details.username,
			name: details.name,
			lastname: details.lastname,
			nationalCode: details.nationalCode,
			phoneNo: details.phoneNo,
			email: details.email || null,
			branchId: details.branchId,
			groups: details.groups,
			password: details.password,
		},
		internalPhoneNo: details.internalPhoneNo?.trim() || undefined,
		academics: details.academics,
		fatherName: details.fatherName,
		birthCertificateNo: details.birthCertificateNo,
		birthDate: details.birthDate,
		birthPlace: details.birthPlace,
		address: details.address,
		landlineNo: details.landlineNo || null,
	};

	const response = await apiClient.post<PersonnelCreateApiReturn>({
		url: `/personnel`,
		body: data,
	});

	return ((result) => ({
		id: result.id,
		userId: result.userId,
	}))(response.result);
}
