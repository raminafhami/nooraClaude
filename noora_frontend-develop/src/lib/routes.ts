const routes = {
	app: process.env.NEXT_PUBLIC_APP_URL,
	internalApi: process.env.NEXT_PUBLIC_INTERNAL_API_URL,
	externalApi: process.env.NEXT_PUBLIC_EXTERNAL_API_URL,
} as const;

export { routes };
