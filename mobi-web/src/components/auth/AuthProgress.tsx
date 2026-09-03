interface AuthProgressProps {
  currentStep: number;
}

const steps = [
  "Details",
  "Verify",
  "Password",
  "Done",
];

function AuthProgress({ currentStep }: AuthProgressProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-sm
                  ${
                    isActive
                      ? "bg-[#AAB7DA] text-white"
                      : "bg-gray-200 text-gray-500"
                  }
                `}
              >
                {stepNumber}
              </div>

              <span className="mt-1 text-xs">{step}</span>
            </div>

            {index < steps.length - 1 && (
              <div className="mx-1 h-px w-5 bg-gray-300 sm:mx-2 sm:w-8" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AuthProgress;