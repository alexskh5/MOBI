import Navbar from "../components/Navbar";
import bg from "../assets/bg1.png";
import mobiLogo from "../assets/mobiLogo.png";

function About() {
  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% auto",
      }}
    >
      <Navbar />

      {/* WHAT IS MOBI */}
      <section className="px-28 py-30">
        <div className="flex justify-between items-center">

          {/* LEFT */}
          <div className="max-w-3xl">
            <h1 className="font-itim text-7xl mb-6">
              What is MOBI?
            </h1>

            <p className="inter text-2xl leading-relaxed mb-10">
              MOBI is an AI-Adaptive Speech Training and Early
              Social Readiness System for Minimally Verbal Children
              with Autism that enhances speech development and
              early social communication skills through interactive,
              adaptive, and AI-assisted learning modules.
            </p>

            <button className="bg-gray-200 px-10 py-4 rounded-full font-itim text-xl hover:bg-gray-300 transition">
              Get MOBI app
            </button>
          </div>

          {/* RIGHT POLAROID */}
          <div className="bg-white border border-gray-500 shadow-lg p-8">
            <div className="border border-gray-400 p-10">
              <img
                src={mobiLogo}
                alt="MOBI Logo"
                className="w-64 h-64 object-contain"
              />
            </div>

            <p className="font-itim text-3xl text-center mt-6">
              MOBI - the children app
            </p>
          </div>

        </div>
      </section>

      {/* HOW MOBI HELPS */}
      <section className="bg-[#E28BE5]/70 py-12 mt-10">
        <h2 className="font-itim text-center text-5xl">
          How MOBI Helps
        </h2>
      </section>

      {/* BENEFITS */}
      <section className="px-28 py-30">

        <div className="grid grid-cols-2 gap-x-30 gap-y-16">

          <div className="text-center">
            <h3 className="font-itim text-4xl mb-6">
              Safe and Child-Friendly
              <br />
              Learning Environment
            </h3>

            <div className="bg-[#B8C5E6] rounded-2xl shadow-lg p-8">
              <p className="inter text-xl">
                MOBI provides a secure and distraction-free
                space designed specifically for children.
                Its predictable interface and child-safe
                access help learners stay focused during
                guided activities.
              </p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-itim text-4xl mb-6">
              Engagement
              <br />
              Monitoring
            </h3>

            <div className="bg-[#B8C5E6] rounded-2xl shadow-lg p-8">
              <p className="inter text-xl">
                MOBI uses camera-based presence detection
                to help monitor if the child is interacting with the activity.
                This helps parents and therapists better
                understand attention and engagement.
              </p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-itim text-4xl mb-6">
              Guided Learning
              <br />
              Activities
            </h3>

            <div className="bg-[#B8C5E6] rounded-2xl shadow-lg p-8">
              <p className="inter text-xl">
                MOBI offers structured activities designed
                to support attention, communication, early
                speech development, and social interaction —
                especially for minimally verbal children.
              </p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-itim text-4xl mb-6">
              Adaptive Learning
              <br />
              Support
            </h3>

            <div className="bg-[#B8C5E6] rounded-2xl shadow-lg p-8">
              <p className="inter text-xl">
                MOBI adjusts the difficulty of activities
                based on the child's progress, interaction
                patterns, and communication attempts,
                helping each learner move forward at
                their own pace.
              </p>
            </div>
          </div>

        </div>

        <div className="flex justify-center mt-16">

          <div className="w-2xl text-center">
            <h3 className="font-itim text-4xl mb-6">
              Collaboration Between
              <br />
              Parents & Therapists
            </h3>

            <div className="bg-[#B8C5E6] rounded-2xl shadow-lg p-8">
              <p className="inter text-xl">
                MOBI allows therapists and parents to work
                together by monitoring progress, guiding
                activities, and supporting the child's
                development both in therapy sessions and
                at home.
              </p>
            </div>
          </div>

        </div>

      </section>
    </div>
  );
}

export default About;