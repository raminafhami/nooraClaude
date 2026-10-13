import { Metadata } from "next";

import { LoginWidget } from "./_components/LoginWidget";

const metadata: Metadata = {
	title: "Login",
};

function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-12">
			<div className="flex flex-col items-center gap-2 text-center">
				<p className="text-sm text-gray-500">
					به سامانه یکپارچه آتیه پژوهان خوش آمدید.
				</p>
				<h4 className="text-2xl font-bold">ورود به حساب کاربری</h4>
			</div>

			<LoginWidget />

			{/* <div className="mt-3 px-12">
        <Link href="/register">ثبت نام</Link>
      </div> */}
		</div>
	);
}

export { metadata };
export default LoginPage;
