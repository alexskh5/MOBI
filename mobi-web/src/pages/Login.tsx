import Navbar from "../components/Navbar";
import bg from "../assets/bg1.png";
import childImg from "../assets/child1.png";

function Login() {
  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% auto",
      }}
    >
      <Navbar />

      <section className="px-20 pt-10">
        <div className="flex justify-between items-center">

          {/* LOGIN CARD */}
          <div className="bg-white/80 border border-gray-300 shadow-lg rounded-[30px] p-12 w-[700px]">

            <h1 className="font-itim text-6xl text-center mb-6">
              LOG IN
            </h1>

            <p className="inter text-center text-2xl mb-12">
              MOBI is happy to see you again!
              <br />
              Continue learning with us!
            </p>

            <div className="flex flex-col items-center gap-6">

              <input
                type="text"
                placeholder="Please enter username"
                className="w-[420px] bg-[#F0E4F1] px-6 py-4 rounded-xl outline-none text-center italic"
              />

              <input
                type="password"
                placeholder="Please enter magic code"
                className="w-[420px] bg-[#F0E4F1] px-6 py-4 rounded-xl outline-none text-center italic"
              />

              <button className="w-[420px] bg-[#AAB7DA] py-4 rounded-xl text-xl hover:bg-[#97A7D2] transition">
                LOG IN
              </button>

              <button className="text-blue-600 italic hover:underline">
                Forgot magic code?
              </button>

            </div>

            <div className="border-t border-gray-400 mt-10 pt-8">
              <p className="inter italic text-center text-lg text-gray-700 leading-relaxed">
                MOBI — MOdernized Bridge Intervention in every
                step for empowering children with autism to
                grow in communication, confidence, and
                connection through fun, adaptive learning
                experiences. Join us and start the journey today!
              </p>
            </div>

          </div>

          {/* CHILD IMAGE */}
          <div>
            <img
              src={childImg}
              alt="Child"
              className="h-[750px] object-contain"
            />
          </div>

        </div>

        {/* REGISTER TEXT */}
        <div className="mt-8 ml-40">
          <p className="font-itim text-3xl">
            No account yet? Start here :)
          </p>
        </div>

      </section>
    </div>
  );
}

export default Login;