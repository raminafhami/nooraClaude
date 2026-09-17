import React from "react";

import Stepper from "./InstanceStep";

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

interface Step {
  title: string;
  name: string;
}

const StepperComponent = ({ currentStep, steps }: StepperProps) => {
  return (
    <div className="p-4">
      <Stepper steps={steps} currentStep={currentStep} />
    </div>
  );
};

export default StepperComponent;
