import { SelectItem } from "@/entities/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum PaymentType {
	Cash = "cash",
	BankDeposit = "bank-deposit",
	ForeignAccount = "foreign-account",
	BankGateway = "bank-gateway",
}

const paymentType: ObjectType<
	PaymentType,
	{ title: string; visible?: boolean }
> = {
	[PaymentType.Cash]: {
		title: "نقدی",
	},
	[PaymentType.BankDeposit]: {
		title: "واریز بانکی",
	},
	[PaymentType.ForeignAccount]: {
		title: "حساب ارزی",
	},
	[PaymentType.BankGateway]: {
		title: "درگاه بانکی",
		visible: false,
	},
};

const paymentTypeOptions: SelectItem<PaymentType>[] = getObjectEntries(
	paymentType,
).map(([key, { title, visible }]) => ({
	value: key,
	label: title,
	visible: visible ?? true,
}));

export { PaymentType, paymentType, paymentTypeOptions };
