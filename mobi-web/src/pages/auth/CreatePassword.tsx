import { useNavigate } from "react-router-dom";

// import Navbar from "../../components/Navbar";
import AuthCard from "../../components/auth/AuthCard";
import AuthProgress from "../../components/auth/AuthProgress";
import AuthInput from "../../components/auth/AuthInput";

import bg from "../../assets/bg1.png";

function CreatePassword() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    navigate("/account-created");
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

          <AuthProgress currentStep={3} />

          <h1 className="text-center font-itim text-3xl sm:text-4xl">
            Create Your Password
          </h1>

          <p className="inter mt-3 text-center text-sm leading-relaxed text-gray-700 sm:text-base">
            Create a password to secure your MOBI account.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 flex flex-col gap-4"
          >
            <AuthInput
              id="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              required
            />

            <AuthInput
              id="confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              required
            />

            <p className="text-xs text-gray-600 sm:text-sm">
              Your password should meet MOBI's security requirements.
            </p>

            <button
              type="submit"
              className="
                mt-2
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
              Create Account
            </button>
          </form>

        </AuthCard>

      </main>
    </div>
  );
}

export default CreatePassword;