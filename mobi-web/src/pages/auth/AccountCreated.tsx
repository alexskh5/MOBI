// import Navbar from "../../components/Navbar";
import AuthCard from "../../components/auth/AuthCard";
import AuthProgress from "../../components/auth/AuthProgress";

import bg from "../../assets/bg1.png";
import mobiLogo from "../../assets/mobiLogo.png";

function AccountCreated() {
  const handleContinue = () => {
    // Temporary placeholder.
    // Later this will open the MOBI mobile application.
    console.log("Continue to MOBI mobile app");
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

        <AuthCard className="text-center">

          <AuthProgress currentStep={4} />

          <img
            src={mobiLogo}
            alt="MOBI Logo"
            className="mx-auto w-28 sm:w-32"
          />

          <h1 className="mt-5 font-itim text-3xl sm:text-4xl">
            You're All Set!
          </h1>

          <p className="inter mt-4 text-sm leading-relaxed text-gray-700 sm:text-base">
            Your MOBI account has been successfully created.
          </p>

          <p className="inter mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">
            You can now continue to the MOBI mobile app and log in using
            your new account.
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
            Continue to MOBI App
          </button>

        </AuthCard>

      </main>
    </div>
  );
}

export default AccountCreated;