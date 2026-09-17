import { Metadata } from "next";

import { LoginWidget } from "./_components/LoginWidget";

const metadata: Metadata = {
	title: "Login",
};

function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-12">
			<h4 className="text-2xl font-bold">ورود به حساب کاربری</h4>

			<LoginWidget />

			{/* <div className="mt-3 px-12">
        <Link href="/register">ثبت نام</Link>
      </div> */}
		</div>
	);
}

export { metadata };
export default LoginPage;
