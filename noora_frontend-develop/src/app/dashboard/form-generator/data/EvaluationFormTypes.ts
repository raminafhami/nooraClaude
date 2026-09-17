export interface EvaluatorProps {
	branchId: string | null;
	name: string;
	lastname: string;
	username: string;
	nationalCode: string;
	email: string;
	phoneNo: string;
	type: string;
	groups: string[];
	id: string;
}

export interface GroupDataProps {
	title: string;
	name: string;
	type: string;
	parentId: string;
	id: string;
}

export type Question = {
	title: string;
	questionId: string;
	id: string;
};

export type Evaluation = {
	title: string;
	certificateCode: string;
	formNo: string;
	evaluator: string;
	targetUsers: string[];
	questions: Question[];
	startEvalNumber: number;
	endEvalNumber: number;
	endDate: string;
	createdAt: string;
	updatedAt: string;
	id: string;
};

export type Response = {
	result: Evaluation;
};
