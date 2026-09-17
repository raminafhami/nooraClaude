const messages = {
	validation: {
		invalid: (name: string) => `${name} وارد شده نامعتبر است.`,
		required: "پر نمودن این فیلد الزامی است.",
		requiredFn: (name: string) => `پر نمودن فیلد ${name} الزامی است.`,
		min: (name: string, count: number) =>
			`حداقل طول ${name} ${count} کاراکتر است.`,
		types: {
			email: "پست الکترونیک وارد شده صحیح نیست.",
			phoneNo: {
				common: "شماره تماس وارد شده صحیح نیست.",
				landline: "شماره ثابت وارد شده صحیح نیست.",
				mobile: "شماره همراه وارد شده صحیح نیست.",
			},
			postalCode: "کدپستی وارد شده صحیح نیست.",
			nationalCode: {
				common: "شماره ملی / شناسه ملی وارد شده صحیح نیست.",
				legal: "شناسه ملی وارد شده صحیح نیست.",
				natural: "شماره ملی وارد شده صحیح نیست.",
			},
		},
	},
} as const;

export { messages };
