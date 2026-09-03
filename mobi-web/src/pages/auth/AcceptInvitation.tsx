import { useNavigate } from "react-router-dom";

// import Navbar from "../../components/Navbar";
import AuthCard from "../../components/auth/AuthCard";

import bg from "../../assets/bg1.png";
import mobiLogo from "../../assets/mobiLogo.png";

function AcceptInvitation() {
  const navigate = useNavigate();

  const handleContinue = () => {
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

          <img
            src={mobiLogo}
            alt="MOBI Logo"
            className="mx-auto w-24 sm:w-28"
          />

          <h1 className="mt-5 text-center font-itim text-3xl sm:text-4xl">
            You're Invited to MOBI!
          </h1>

          <p className="inter mt-4 text-center text-sm leading-relaxed text-gray-700 sm:text-base">
            Abled Minds Therapy Center has invited you to create a MOBI
            parent account.
          </p>

          <p className="inter mt-4 text-center text-sm leading-relaxed text-gray-700 sm:text-base">
            Your account has already been prepared by the center. Continue
            to verify your account and create your password.
          </p>

          <button
            type="button"
            onClick={handleContinue}
            className="
              mt-7
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
            Accept Invitation
          </button>

        </AuthCard>

      </main>
    </div>
  );
}

export default AcceptInvitation;