import Navbar from "../components/Navbar";
import bg from "../assets/bg1.png";
import childImg from "../assets/child1.png";
import centerLogo from "../assets/centerLogo.png";

function Home() {
  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% auto",
      }}
    >
      <Navbar />

      {/* HERO SECTION */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 md:px-12 lg:px-28 pt-10 lg:pt-20 gap-10">
        
        {/* LEFT */}
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="font-itim text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-6">
            Get children to
            <br />
            learn with MOBI
          </h1>

          <p className="inter text-base sm:text-lg md:text-xl lg:text-2xl mb-10">
            We always believe that every child deserves a voice. With our
            learning center and school partners, you can seek help to empower
            young learners using MOBI.
          </p>

          <button className="font-itim text-base sm:text-lg lg:text-xl bg-gray-200 px-10 py-4 rounded-full hover:bg-gray-300 transition">
            Connect with Us!
          </button>
        </div>

        {/* RIGHT */}
        <div>
          <img
            src={childImg}
            alt="Child"
            className="w-72 sm:w-96 md:w-[500px] lg:w-[900px] object-contain"
          />
        </div>
      </section>

      {/* CENTERS & SCHOOLS BANNER */}
      <section
        className="bg-[#A3B0D3]/70 py-6 sm:py-8 lg:py-10 text-center scroll-mt-28"
      >
        <h2 className="font-itim text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          Our Partner Center
        </h2>

        <p className="inter text-sm sm:text-lg md:text-xl lg:text-3xl mt-2">
          You may use MOBI with:
        </p>
      </section>

      {/* CENTER SECTION */}
        <section className="px-6 md:px-12 lg:px-28 py-16 lg:py-28 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* LEFT */}
        <div className="bg-white border border-gray-500 shadow-lg p-8">
            <div className="border border-gray-400 p-10">
              <img
                src={centerLogo}
                className="w-64 h-64 object-contain"
              />
            </div>

            <p className="font-itim text-3xl text-center mt-6">
              Abled Minds Therapy Center
            </p>
        </div>

        {/* RIGHT */}
        <div className="max-w-3xl text-center lg:text-left">
          <h3 className="font-itim text-2xl sm:text-3xl md:text-4xl lg:text-6xl mb-3">
            Abled Minds Therapy Center
          </h3>

          <p className="inter text-sm sm:text-base md:text-lg lg:text-xl mb-4">
            Located at FCT-Tintay along H. Abellana St. Tintay, Talamban, Cebu
            City, Philippines, 6000
          </p>

          <p className="inter text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
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