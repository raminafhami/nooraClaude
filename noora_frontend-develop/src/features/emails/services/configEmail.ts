import apiClient from "@/api/client";

type ConfigEmailDto = {
	user: string;
	password: string;
};

async function configEmail({ user, password }: ConfigEmailDto): Promise<void> {
	await apiClient.post({
		url: "emails/configure",
		body: {
			user: user,
			password: password,
		},
	});
}
export { configEmail };
