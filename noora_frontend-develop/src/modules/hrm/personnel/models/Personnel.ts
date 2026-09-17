import { AcademicDegree } from "@/hrm/shared/models/AcademicDegree";
import { TimeString } from "@/time/TimeString";

import {
	PersonnelExpertise,
	PersonnelExpertiseApi,
} from "./PersonnelExpertise";
import { PersonnelJob } from "./PersonnelJob";

type Personnel = {
	id: string;
	userId: string;
	username: string;
	firstname: string;
	lastname: string;
	fullname: string;
	nationalCode: string;
	fatherName: string;
	birthCertificateNo: string;
	birthDate: string;
	birthPlace: string;
	address: string;
	landlineNo: string;
	phoneNo: string;
	email: string;
	branchId: string | null;
	internalPhoneNo: string | null;
	academics: AcademicDegree[];
	jobs: PersonnelJob[] | string[];
	expertises?: PersonnelExpertise[];
	maxDayLeave: number;
	maxExtraTime: TimeString;
	maxManualTime: number;
	bankAccountNumber?: string;
	bankCardNumber?: string;
	bankSheba?: string;
	bankAccountOwner?: string;
	bankName?: string;
	bankBranch?: string;
};

type PersonnelApi = {
	id: string;
	userId: string;
	user: {
		name: string;
		lastname: string;
		username: string;
		nationalCode: string;
		phoneNo: string;
		email: string;
		branchId: string | null;
		bankAccountNumber?: string;
		bankCardNumber?: string;
		bankSheba?: string;
		bankAccountOwner?: string;
		bankName?: string;
		bankBranch?: string;
	};
	internalPhoneNo: string | null;
	fatherName: string;
	birthCertificateNo: string;
	birthDate: string;
	birthPlace: string;
	address: string;
	landlineNo: string;
	academics: AcademicDegree[];
	jobs: PersonnelJob[] | string[];
	expertises?: PersonnelExpertiseApi[];
	maxDayLeave: number;
	maxExtraTime: TimeString;
	maxManualTime: number;
};

type PersonnelDb = Omit<PersonnelApi, "id"> & {
	_id: string;
};

export type { Personnel, PersonnelApi, PersonnelDb };
