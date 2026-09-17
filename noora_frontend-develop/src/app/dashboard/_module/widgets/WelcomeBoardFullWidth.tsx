"use client";

import bg from "/public/images/background-welcomeBoard.png";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";

import { AnalogClock } from "./live-clock/AnalogClock";

const WelcomeBoardFullWidth = () => {
	const user = useLoggedInUser();

	return (
		<div
			className="col-span-full col-start-1 flex min-h-72 flex-col items-center justify-between gap-y-16 rounded-3xl border-e-[6px] border-saffron bg-white px-32 py-12 md:flex-row 2xl:min-h-52"
			style={{
				backgroundImage: `url(${bg.src})`,
				backgroundPosition: "top right",
				backgroundRepeat: "no-repeat",
				backgroundSize: "250px 150px",
			}}
		>
			<div className="col-span-full flex w-fit shrink-0 grow-0 flex-col justify-center gap-y-4 text-nowrap xl:col-span-6">
				<span className="text-2xl font-bold">
					سلام <span>{user.identity.fullname.split(" ")[0]}</span>
					👋
				</span>
				<span className="text-lg font-normal text-gray-700">
					به روال خوش آمدی!
				</span>
			</div>

			<div className="col-span-full flex w-fit shrink-0 grow-0 xl:col-span-6">
				<AnalogClock />
			</div>
		</div>
	);
};

export { WelcomeBoardFullWidth };
