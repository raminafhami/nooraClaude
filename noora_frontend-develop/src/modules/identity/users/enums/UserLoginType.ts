import { getObjectEntries } from "@/utils/object/getObjectEntries";

enum UserLoginType {
	All = "all",
	Password = "password",
	OTP = "otp",
}

const userLoginTypes: Record<UserLoginType, { title: string }> = {
	[UserLoginType.All]: { title: "هر دو روش" },
	[UserLoginType.Password]: { title: "رمز عبور ثابت" },
	[UserLoginType.OTP]: { title: "رمز یکبار مصرف" },
};

const userLoginTypeOptions = getObjectEntries(userLoginTypes).map(
	([key, { title }]) => ({ value: key, label: title }),
);

export { UserLoginType, userLoginTypes, userLoginTypeOptions };
