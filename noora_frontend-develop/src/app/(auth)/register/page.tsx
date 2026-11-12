import { Metadata } from "next";
import Link from "next/link";

const metadata: Metadata = {
  title: "Register",
};

function RegisterPage() {
  return (
    <>
      <div className="flex min-h-[18rem] py-12 border border-gray-100 rounded-r-4xl bg-white px-8 text-gray-900 items-center justify-center">
        در حال حاضر امکان ثبت نام در سامانه وجود ندارد!
      </div>

      <div className="mt-3 px-12">
        <Link className="text-white" href="/login">ورود</Link>
      </div>
    </>
  );
}

export { metadata };
export default RegisterPage;
