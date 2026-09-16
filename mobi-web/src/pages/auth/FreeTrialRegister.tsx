import { useNavigate } from "react-router-dom";

// import Navbar from "../../components/Navbar";
import AuthCard from "../../components/auth/AuthCard";
import AuthProgress from "../../components/auth/AuthProgress";
import AuthInput from "../../components/auth/AuthInput";

import bg from "../../assets/bg1.png";

function FreeTrialRegister() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    navigate("/verify");
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

          <AuthProgress currentStep={1} />

          <h1 className="text-center font-itim text-3xl sm:text-4xl">
            Create Your Free Trial Account
          </h1>

          <p className="inter mt-3 text-center text-sm leading-relaxed text-gray-700 sm:text-base">
            Enter your details below to get started with MOBI.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 flex flex-col gap-4"
          >
            <AuthInput
              id="first-name"
              label="First Name"
              placeholder="Enter your first name"
              required
            />

            <AuthInput
              id="middle-name"
              label="Middle Name"
              placeholder="Enter your middle name"
            />

            <AuthInput
              id="last-name"
              label="Last Name"
              placeholder="Enter your last name"
              required
            />

            <AuthInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
            />

            <AuthInput
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              required
            />

            <AuthInput
              id="address"
              label="Address"
              placeholder="Enter your address"
              required
            />

            <button
              type="submit"
              className="
                mt-3
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
              Continue
            </button>
          </form>

        </AuthCard>

      </main>
    </div>
  );
}

export default FreeTrialRegister;