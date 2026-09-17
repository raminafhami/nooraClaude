import moment from "jalali-moment";
import { useEffect, useState } from "react";

const AnalogClock = () => {
	const [time, setTime] = useState(new Date());
	const hours = time.getHours();
	const minutes = time.getMinutes().toString().padStart(2, "0");
	const todayDate = moment().locale("fa").format("jD");
	const todayMonth = moment().locale("fa").format("jMMMM");
	const today = moment().locale("fa").format("dddd");

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const secondsRatio = time.getSeconds() / 60;
	const minutesRatio = (secondsRatio + time.getMinutes()) / 60;
	const hoursRatio = (minutesRatio + time.getHours()) / 12;

	return (
		<div className="flex flex-col items-center gap-6">
			{/* Hour hand */}
			<div className="relative flex size-16 flex-col items-center justify-center">
				<div
					className="absolute z-10 h-6 w-[1.5px] rounded-full bg-gray-800"
					style={{
						transform: `rotate(${hoursRatio * 360}deg)`,
						transformOrigin: "bottom center",
						bottom: "50%",
						marginRight: "0.3rem",
					}}
				/>
				{/* Minute hand */}
				<div
					className="absolute z-20 h-8 w-[1.5px] rounded-full bg-gray-700"
					style={{
						transform: `rotate(${minutesRatio * 360}deg)`,
						transformOrigin: "bottom center",
						marginRight: "0.3rem",
						bottom: "50%",
					}}
				/>

				{/* Second hand */}
				<div
					className="absolute z-30 h-8 w-[1.5px] rounded-full bg-red-500"
					style={{
						transform: `rotate(${secondsRatio * 360}deg)`,
						transformOrigin: "bottom center",
						bottom: "50%",
						marginRight: "0.3rem",
					}}
				/>

				{/* Center dot */}
				<div className="z-40 ms-1 h-2 w-2 rounded-full bg-gray-800" />
			</div>

			<div className="flex flex-col items-center justify-center">
				<span className="text-2xl text-gray-900">
					{hours}:{minutes}
				</span>
				<div className="mt-1 text-base font-normal text-gray-700">
					<span>{today} , </span>
					<span
						className="px-2 text-white"
						style={{
							background: "orange",
							clipPath:
								"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
						}}
					>
						{todayDate}
					</span>
					<span> {todayMonth}</span>
				</div>
			</div>
		</div>
	);
};

export { AnalogClock };
