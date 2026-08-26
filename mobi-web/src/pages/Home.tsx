import Navbar from "../components/Navbar";

import bg from "../assets/bg1.png";
import childImg from "../assets/child1.png";
import centerLogo from "../assets/centerLogo.png";

function Home() {
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

      {/* HERO SECTION */}
      <section
        className="
          mx-auto
          flex
          w-full
          max-w-[1600px]
          flex-col-reverse
          items-center
          justify-between
          gap-8
          px-5
          pb-12
          pt-10
          sm:px-8
          md:px-12
          lg:flex-row
          lg:gap-12
          lg:px-20
          lg:pb-20
          lg:pt-16
          xl:px-28
        "
      >
        {/* LEFT */}
        <div
          className="
            w-full
            max-w-2xl
            text-center
            lg:w-1/2
            lg:text-left
          "
        >
          <h1
            className="
              font-itim
              text-4xl
              leading-tight
              sm:text-5xl
              md:text-6xl
              lg:text-6xl
              xl:text-7xl
            "
          >
            Get children to
            <br />
            learn with MOBI
          </h1>

          <p
            className="
              inter
              mt-5
              text-base
              leading-relaxed
              sm:text-lg
              md:text-xl
              lg:mt-6
              lg:text-xl
              xl:text-2xl
            "
          >
            We always believe that every child deserves a voice. With our
            learning center and school partners, you can seek help to empower
            young learners using MOBI.
          </p>

          <button
            type="button"
            className="
              mt-8
              rounded-full
              bg-gray-200
              px-8
              py-3
              font-itim
              text-base
              transition
              hover:bg-gray-300
              sm:px-10
              sm:py-4
              sm:text-lg
              lg:mt-10
              lg:text-xl
            "
          >
            Connect with Us!
          </button>
        </div>

        {/* RIGHT */}
        <div
          className="
            flex
            w-full
            items-center
            justify-center
            lg:w-1/2
            lg:justify-end
          "
        >
          <img
            src={childImg}
            alt="Child learning with MOBI"
            className="
              h-auto
              w-full
              max-w-[320px]
              object-contain
              sm:max-w-[430px]
              md:max-w-[520px]
              lg:max-w-[620px]
              xl:max-w-[760px]
            "
          />
        </div>
      </section>

      {/* PARTNER CENTER BANNER */}
      <section
        className="
          scroll-mt-24
          bg-[#A3B0D3]/70
          px-5
          py-7
          text-center
          sm:py-8
          lg:py-10
        "
      >
        <h2 className="font-itim text-3xl sm:text-4xl lg:text-5xl">
          Our Partner Center
        </h2>

        <p className="inter mt-2 text-base sm:text-lg md:text-xl lg:text-2xl">
          You may use MOBI with:
        </p>
      </section>

      {/* CENTER SECTION */}
      <section
        className="
          mx-auto
          flex
          w-full
          max-w-[1600px]
          flex-col
          items-center
          justify-between
          gap-10
          px-5
          py-14
          sm:px-8
          md:px-12
          lg:flex-row
          lg:gap-16
          lg:px-20
          lg:py-24
          xl:px-28
        "
      >
        {/* LEFT */}
        <div
          className="
            w-full
            max-w-[420px]
            shrink-0
            border
            border-gray-500
            bg-white
            p-4
            shadow-lg
            sm:p-6
            lg:w-[380px]
            xl:w-[420px]
          "
        >
          <div
            className="
              flex
              aspect-square
              items-center
              justify-center
              border
              border-gray-400
              p-6
              sm:p-8
            "
          >
            <img
              src={centerLogo}
              alt="Abled Minds Therapy Center logo"
              className="h-full w-full object-contain"
            />
          </div>

          <p
            className="
              mt-5
              text-center
              font-itim
              text-2xl
              sm:text-3xl
            "
          >
            Abled Minds Therapy Center
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="
            w-full
            max-w-3xl
            text-center
            lg:text-left
          "
        >
          <h3
            className="
              font-itim
              text-3xl
              leading-tight
              sm:text-4xl
              lg:text-5xl
              xl:text-6xl
            "
          >
            Abled Minds Therapy Center
          </h3>

          <p
            className="
              inter
              mt-4
              text-sm
              leading-relaxed
              sm:text-base
              md:text-lg
              lg:text-xl
            "
          >
            Located at FCT-Tintay along H. Abellana St. Tintay, Talamban,
            Cebu City, Philippines, 6000
          </p>

          <p
            className="
              inter
              mt-5
              text-base
              leading-relaxed
              sm:text-lg
              md:text-xl
              lg:text-2xl
            "
          >
            Therapists from Abled Minds supported the development of the MOBI
            App by helping validate its features and providing professional
            guidance to ensure it is effective for therapy and learning
            environments.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;