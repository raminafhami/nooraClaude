import { Metadata } from "next";

import { LoginWidget } from "./_components/LoginWidget";

const metadata: Metadata = {
	title: "Login",
};

function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-10 text-white lg:gap-14">
			<p className="text-center text-base md:text-lg xl:text-xl">
				به سامانه یکپارچه آتیه پژوهان کیفیت خوش آمدید.
			</p>

			<div className="flex flex-col items-center gap-6">
				<h1 className="text-sm font-normal md:text-base">ورود به حساب کاربری</h1>

				<LoginWidget />
			</div>

			{/* <div className="mt-3 px-12">
        <Link href="/register">ثبت نام</Link>
      </div> */}
		</div>
	);
}

export { metadata };
export default LoginPage;
