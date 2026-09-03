import { useNavigate } from "react-router-dom";

// import Navbar from "../../components/Navbar";
import AuthCard from "../../components/auth/AuthCard";
import AuthProgress from "../../components/auth/AuthProgress";

import bg from "../../assets/bg1.png";

function VerifyAccount() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    navigate("/create-password");
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% auto",
      }}
    >
      {/* <Navbar /> */}

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 sm:px-6">

        <AuthCard>

          <AuthProgress currentStep={2} />

          <h1 className="text-center font-itim text-3xl sm:text-4xl">
            Check Your Email
          </h1>

          <p className="inter mt-3 text-center text-sm leading-relaxed text-gray-700 sm:text-base">
            We've sent a verification code to your email address.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 flex flex-col gap-4"
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter your magic code"
              className="
                w-full
                rounded-xl
                bg-[#F0E4F1]
                px-4
                py-3
                text-center
                tracking-[0.4em]
                outline-none
                focus:ring-2
                focus:ring-[#AAB7DA]
              "
            />

            <p className="text-center text-xs text-gray-600 sm:text-sm">
              Your verification code will expire after a limited time.
            </p>

            <button
              type="submit"
              className="
                w-full
                rounded-xl
                bg-[#AAB7DA]
                py-3
                font-itim
                text-lg
                transition
                hover:bg-[#97A7D2]
                sm:text-xl
              "
            >
              Verify Code
            </button>

            <button
              type="button"
              className="self-center text-sm italic text-blue-600 hover:underline"
            >
              Didn't receive the code?
            </button>
          </form>

        </AuthCard>

      </main>
    </div>
  );
}

export default VerifyAccount;