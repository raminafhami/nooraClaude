export type EmailType = {
	uid: number;
	subject: string;
	from: [{ address: string; name: string }];
	date: string;
	html: string;
	text: string;
	isUnread: boolean;
	attachments?: [
		{
			filename: string;
			contentType: string;
			size: number;
		},
	];
};
export interface EmailResponse {
	message: string;
	result: {
		data: EmailType[];
		count: number;
	};
	statusCode: number;
}
