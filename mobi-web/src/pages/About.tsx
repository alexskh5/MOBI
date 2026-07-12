import Navbar from "../components/Navbar";

import bg from "../assets/bg1.png";
import mobiLogo from "../assets/mobiLogo.png";

interface BenefitCardProps {
  title: React.ReactNode;
  description: string;
}

const BenefitCard = ({
  title,
  description,
}: BenefitCardProps) => {
  return (
    <article className="flex h-full flex-col text-center">
      <h3
        className="
          min-h-0
          font-itim
          text-2xl
          leading-tight
          sm:text-3xl
          lg:min-h-[96px]
          lg:text-4xl
        "
      >
        {title}
      </h3>

      <div
        className="
          mt-5
          flex
          flex-1
          items-center
          rounded-2xl
          bg-[#B8C5E6]
          p-6
          shadow-lg
          sm:p-8
        "
      >
        <p
          className="
            inter
            w-full
            text-base
            leading-relaxed
            sm:text-lg
            lg:text-xl
          "
        >
          {description}
        </p>
      </div>
    </article>
  );
};

function About() {
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

      {/* WHAT IS MOBI */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1600px]
          px-5
          py-14
          sm:px-8
          md:px-12
          lg:px-20
          lg:py-24
          xl:px-28
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            justify-between
            gap-12
            lg:flex-row
            lg:items-center
            lg:gap-16
          "
        >
          {/* LEFT */}
          <div
            className="
              w-full
              max-w-3xl
              text-center
              lg:w-3/5
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
                lg:text-7xl
              "
            >
              What is MOBI?
            </h1>

            <p
              className="
                inter
                mt-6
                text-base
                leading-relaxed
                sm:text-lg
                md:text-xl
                lg:text-2xl
              "
            >
              MOBI is an AI-Adaptive Speech Training and Early Social
              Readiness System for Minimally Verbal Children with Autism that
              enhances speech development and early social communication
              skills through interactive, adaptive, and AI-assisted learning
              modules.
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
                text-lg
                transition
                hover:bg-gray-300
                sm:px-10
                sm:py-4
                lg:mt-10
                lg:text-xl
              "
            >
              Get MOBI app
            </button>
          </div>

          {/* RIGHT POLAROID */}
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
                src={mobiLogo}
                alt="MOBI Logo"
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
              MOBI - the children app
            </p>
          </div>
        </div>
      </section>

      {/* HOW MOBI HELPS */}
      <section className="mt-4 bg-[#E28BE5]/70 px-5 py-10 sm:py-12">
        <h2 className="text-center font-itim text-3xl sm:text-4xl lg:text-5xl">
          How MOBI Helps
        </h2>
      </section>

      {/* BENEFITS */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1600px]
          px-5
          py-14
          sm:px-8
          md:px-12
          lg:px-20
          lg:py-24
          xl:px-28
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-12
            lg:grid-cols-2
            lg:gap-x-14
            lg:gap-y-16
            xl:gap-x-24
          "
        >
          <BenefitCard
            title={
              <>
                Safe and Child-Friendly
                <br className="hidden sm:block" />
                Learning Environment
              </>
            }
            description="MOBI provides a secure and distraction-free space designed specifically for children. Its predictable interface and child-safe access help learners stay focused during guided activities."
          />

          <BenefitCard
            title={
              <>
                Engagement
                <br className="hidden sm:block" />
                Monitoring
              </>
            }
            description="MOBI uses camera-based presence detection to help monitor if the child is interacting with the activity. This helps parents and therapists better understand attention and engagement."
          />

          <BenefitCard
            title={
              <>
                Guided Learning
                <br className="hidden sm:block" />
                Activities
              </>
            }
            description="MOBI offers structured activities designed to support attention, communication, early speech development, and social interaction — especially for minimally verbal children."
          />

          <BenefitCard
            title={
              <>
                Adaptive Learning
                <br className="hidden sm:block" />
                Support
              </>
            }
            description="MOBI adjusts the difficulty of activities based on the child's progress, interaction patterns, and communication attempts, helping each learner move forward at their own pace."
          />
        </div>

        <div className="mx-auto mt-12 w-full max-w-3xl lg:mt-16">
          <BenefitCard
            title={
              <>
                Collaboration Between
                <br className="hidden sm:block" />
                Parents &amp; Therapists
              </>
            }
            description="MOBI allows therapists and parents to work together by monitoring progress, guiding activities, and supporting the child's development both in therapy sessions and at home."
          />
        </div>
      </section>
    </div>
  );
}

export default About;