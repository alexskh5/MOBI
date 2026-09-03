import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";

import bg from "../../assets/bg1.png";
import mobiLogo from "../../assets/mobiLogo.png";
import centerLogo from "../../assets/centerLogo.png";

function FreeTrial() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% auto",
      }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 md:px-12 lg:px-20 lg:py-20">

        {/* INTRODUCTION */}
        <section className="text-center">
          <img
            src={mobiLogo}
            alt="MOBI Logo"
            className="mx-auto h-auto w-32 sm:w-40"
          />

          <h1 className="mt-6 font-itim text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Experience MOBI
          </h1>

          <p className="inter mx-auto mt-5 max-w-3xl text-base leading-relaxed sm:text-lg lg:text-xl">
            Give your child the opportunity to explore interactive speech
            training and early social-readiness activities through MOBI.
          </p>
        </section>

        {/* FREE TRIAL */}
        <section className="mt-12 rounded-3xl bg-white/80 p-6 shadow-lg sm:p-10">
          <h2 className="text-center font-itim text-3xl sm:text-4xl">
            Start with a Free Trial
          </h2>

          <p className="inter mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed sm:text-lg">
            You can create a free trial account even if your child is not
            currently enrolled in a partner center. Explore MOBI and discover
            how it can support your child's learning journey.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/free-trial/register")}
              className="
                rounded-full
                bg-[#AAB7DA]
                px-8
                py-3
                font-itim
                text-lg
                transition
                hover:bg-[#97A7D2]
                sm:px-10
                sm:py-4
                sm:text-xl
              "
            >
              Create Free Trial Account
            </button>
          </div>
        </section>

        {/* PARTNERSHIP */}
        <section className="mt-12">
          <div className="rounded-3xl bg-[#E28BE5]/70 p-6 sm:p-10">
            <h2 className="text-center font-itim text-3xl sm:text-4xl">
              Our Partnership
            </h2>

            <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
              <img
                src={centerLogo}
                alt="Abled Minds Therapy Center"
                className="w-40 sm:w-48"
              />

              <div className="max-w-2xl text-center lg:text-left">
                <h3 className="font-itim text-2xl sm:text-3xl">
                  Abled Minds Therapy Center
                </h3>

                <p className="inter mt-3 text-base leading-relaxed sm:text-lg">
                  MOBI is developed in partnership with Abled Minds Therapy
                  Center to support speech development, communication, and
                  early social readiness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ENROLLMENT INFORMATION */}
        <section className="mt-12 text-center">
          <h2 className="font-itim text-3xl sm:text-4xl">
            Want to Experience More?
          </h2>

          <p className="inter mx-auto mt-4 max-w-3xl text-base leading-relaxed sm:text-lg">
            For parents who want more comprehensive support, you may consider
            enrolling your child at Abled Minds Therapy Center. The center
            currently accepts face-to-face enrollment.
          </p>

          <p className="inter mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-gray-700 sm:text-base">
            Contact the center directly for enrollment information,
            availability, and requirements.
          </p>
        </section>

      </main>
    </div>
  );
}

export default FreeTrial;