import {
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import bg from "../assets/bg1.png";
import {
  loginUser,
} from "../services/auth";

function Login() {
  const navigate = useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleLogin = async () => {
    if (loading) {
      return;
    }

    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter your email and password.",
      );
      return;
    }

    setLoading(true);

    try {
      const user = await loginUser({
        email,
        password,
      });

      navigate(user.defaultWebRoute, {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to log in.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleLogin();
    }
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
      <Navbar />

      <main
        className="
          flex
          min-h-[calc(100vh-80px)]
          flex-col
          items-center
          justify-center
          px-4
          py-10
          sm:px-6
        "
      >
        {/* LOGIN CARD */}
        <div
          className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-gray-300
            bg-white
            p-5
            shadow-xl
            sm:p-8
          "
        >
          <h1 className="text-center font-itim text-3xl sm:text-4xl">
            LOG IN
          </h1>

          <p
            className="
              inter
              mt-2
              text-center
              text-sm
              leading-relaxed
              text-gray-700
            "
          >
            MOBI is happy to see you again!
            <br />
            Continue learning with us!
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <label htmlFor="username" className="sr-only">
              Username
            </label>

            <input
              id="username"
              type="email"
              autoComplete="username"
              placeholder="Please enter email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              onKeyDown={handleKeyDown}
              className="
                w-full
                rounded-xl
                bg-[#F0E4F1]
                px-4
                py-3
                text-center
                italic
                outline-none
                focus:ring-2
                focus:ring-[#AAB7DA]
                sm:px-6
              "
            />

            <label htmlFor="password" className="sr-only">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Please enter password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              onKeyDown={handleKeyDown}
              className="
                w-full
                rounded-xl
                bg-[#F0E4F1]
                px-4
                py-3
                text-center
                italic
                outline-none
                focus:ring-2
                focus:ring-[#AAB7DA]
                sm:px-6
              "
            />

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-[#AAB7DA]
                py-3
                text-lg
                transition
                hover:bg-[#97A7D2]
                disabled:cursor-not-allowed
                disabled:opacity-70
                sm:text-xl
              "
            >
              {loading ? "LOGGING IN..." : "LOG IN"}
            </button>

            {error && (
              <p className="text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              className="
                self-center
                text-sm
                italic
                text-blue-600
                hover:underline
                sm:text-base
              "
            >
              Forgot password?
            </button>
          </div>

          <div className="mt-5 border-t border-gray-400 pt-5 sm:mt-6 sm:pt-6">
            <p
              className="
                inter
                text-center
                text-xs
                italic
                leading-relaxed
                text-gray-700
                sm:text-sm
              "
            >
              MOBI — MOdernized Bridge Intervention in every step for
              empowering children with autism to grow in communication,
              confidence, and connection through fun, adaptive learning
              experiences. Join us and start the journey today!
            </p>
          </div>
        </div>

        {/* REGISTER TEXT */}
        <div className="mt-6 px-4 text-center">
          <p className="font-itim text-lg sm:text-xl">
            No account yet? Start here :)
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
