// Step.tsx

import React from "react";

import { cn } from "@/lib/utils";

interface Step {
	title: string;
	name: string;
}

interface StepsProps {
	steps: Step[];
	currentStep: number;
}

const InstanceStep: React.FC<{
	step: Step;
	isDone: boolean;
	isCurrent: boolean;
	currentStep: number;
}> = ({ step, isDone, isCurrent, currentStep }) => {
	const stepClasses = cn(
		"relative m-4 flex items-center justify-center rounded-full px-6 py-4",
		isDone ? "bg-primary-400 text-white" : "bg-gray-100 text-gray-700",
		isCurrent && "animate-pulse border-4 border-primary-400 transition-all",
	);

	return (
		<div className="flex select-none items-center transition-all">
			<div className={stepClasses}>
				{`${currentStep + 1}`}
				<span className="absolute -bottom-7 text-nowrap !text-black">
					{step?.title}
				</span>
			</div>
			{!isCurrent && (
				<div
					className={`h-px flex-1 bg-gray-200 ${
						isDone ? "bg-primary-400 transition-all" : ""
					}`}
				/>
			)}
		</div>
	);
};

const Stepper: React.FC<StepsProps> = ({ steps, currentStep }) => {
	return (
		<div className="flex items-center">
			{steps.map((step, index) => (
				<React.Fragment key={index}>
					<InstanceStep
						step={step}
						isDone={index < currentStep}
						isCurrent={index === currentStep}
						currentStep={index}
					/>
					{index < steps.length - 1 && (
						<div className="h-px flex-1 bg-gray-200" />
					)}
				</React.Fragment>
			))}
		</div>
	);
};

export default Stepper;
