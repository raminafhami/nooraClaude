// Value stored in a FILE-type answer (one entry per uploaded file).
type FormAnswerFile = {
	id: string;
	name: string;
	size?: number;
	mimetype?: string;
};

export type { FormAnswerFile };
