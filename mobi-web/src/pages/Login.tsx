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
  const location = useLocation();

  const [
    mode,
    setMode,
  ] = useState<LoginMode>(
    "password",
  );

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<StaffRole | null>(
    null,
  );

  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [accessCode, setAccessCode] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [showCode, setShowCode] =
    useState(false);
  const [recoveryCodeSent, setRecoveryCodeSent] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [feedback, setFeedback] =
    useState<Feedback>(null);

  useEffect(() => {
    const state = location.state as
      | { message?: string }
      | null;

    if (state?.message) {
      setFeedback({
        type: "success",
        message: state.message,
      });

      window.history.replaceState(
        {},
        document.title,
      );
    }
  }, [location.state]);

  const normalizeAndValidateIdentity = () => {
    if (!selectedRole) {
      setFeedback({
        type: "error",
        message:
          "Please select whether you are signing in as a Doctor or Therapist.",
      });
      return null;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      setFeedback({
        type: "error",
        message:
          "Please enter your registered email address.",
      });
      return null;
    }

    return {
      role: selectedRole,
      email: normalizedEmail,
    };
  };

  const saveAuthenticatedStaff = async (
    result: StaffSessionResponse,
  ) => {
    const {
      error: sessionError,
    } = await supabaseAuth.auth.setSession({
      access_token:
        result.session.access_token,
      refresh_token:
        result.session.refresh_token,
    });

    if (sessionError) {
      throw sessionError;
    }

    if (!result.profile?.id) {
      throw new Error(
        "MOBI could not identify the authenticated professional profile.",
      );
    }

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

  const switchMode = (
    nextMode: LoginMode,
  ) => {
    setMode(nextMode);
    setPassword("");
    setAccessCode("");
    setShowPassword(false);
    setShowCode(false);
    setRecoveryCodeSent(false);
    setFeedback(null);
  };

  const handlePasswordLogin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFeedback(null);

    const identity =
      normalizeAndValidateIdentity();

    if (!identity) return;

    if (!password) {
      setFeedback({
        type: "error",
        message:
          "Please enter your password.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await passwordLogin(
        identity.email,
        password,
        identity.role,
      );

      await saveAuthenticatedStaff(
        result,
      );

      localStorage.removeItem(
        "mobi_password_setup_required",
      );
      localStorage.removeItem(
        "mobi_password_recovery",
      );

      navigate(
        dashboardForRole(result.role),
        { replace: true },
      );
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to sign in. Check your email and password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivation = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFeedback(null);

    const identity =
      normalizeAndValidateIdentity();

    if (!identity) return;

    if (!/^\d{8}$/.test(accessCode)) {
      setFeedback({
        type: "error",
        message:
          "Enter the 8-digit activation code sent to your email.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await verifyStaffOtp(
        identity.email,
        accessCode,
        identity.role,
      );

      await saveAuthenticatedStaff(
        result,
      );

      if (
        result.requiresPasswordSetup !==
        false
      ) {
        localStorage.setItem(
          "mobi_password_setup_required",
          "true",
        );

        navigate(
          "/professional/setup-password",
          { replace: true },
        );
        return;
      }

      /*
        Activation codes are not a permanent alternate login method.
        If the account already has a password, require normal password
        sign-in instead of treating this OTP as a backdoor login.
      */
      await supabaseAuth.auth.signOut();
      localStorage.removeItem(
        "mobi_staff_role",
      );
      localStorage.removeItem(
        "mobi_staff_profile_id",
      );

      switchMode("password");
      setFeedback({
        type: "info",
        message:
          "This account is already activated. Sign in using your password.",
      });
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to verify the activation code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestActivationCode =
    async () => {
      setFeedback(null);

      const identity =
        normalizeAndValidateIdentity();
      if (!identity) return;

      try {
        setIsSubmitting(true);
        const result =
          await requestStaffLoginCode(
            identity.email,
            identity.role,
          );

        setAccessCode("");
        setFeedback({
          type: "info",
          message: result.message,
        });
      } catch (error: any) {
        setFeedback({
          type: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Unable to request an activation code.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleRequestRecoveryCode =
    async () => {
      setFeedback(null);

      const identity =
        normalizeAndValidateIdentity();
      if (!identity) return;

      try {
        setIsSubmitting(true);
        const result =
          await requestPasswordResetCode(
            identity.email,
            identity.role,
          );

        setRecoveryCodeSent(true);
        setAccessCode("");
        setFeedback({
          type: "info",
          message: result.message,
        });
      } catch (error: any) {
        setFeedback({
          type: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Unable to request a password-reset code.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleVerifyRecoveryCode =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();
      setFeedback(null);

      const identity =
        normalizeAndValidateIdentity();
      if (!identity) return;

      if (!/^\d{8}$/.test(accessCode)) {
        setFeedback({
          type: "error",
          message:
            "Enter the 8-digit verification code sent to your email.",
        });
        return;
      }

      try {
        setIsSubmitting(true);

        const result =
          await verifyPasswordResetCode(
            identity.email,
            accessCode,
            identity.role,
          );

        await saveAuthenticatedStaff(
          result,
        );

        localStorage.setItem(
          "mobi_password_recovery",
          "true",
        );

        navigate(
          "/professional/reset-password",
          { replace: true },
        );
      } catch (error: any) {
        setFeedback({
          type: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Unable to verify the password-reset code.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  const modeTitle =
    mode === "password"
      ? "Sign in to MOBI"
      : mode === "activate"
        ? "Activate your account"
        : "Reset your password";

  const modeDescription =
    mode === "password"
      ? "Use the permanent password you created during account activation."
      : mode === "activate"
        ? "First time here? Verify the invitation code sent to your registered email, then create your permanent password."
        : recoveryCodeSent
          ? "Enter the verification code sent to your registered email."
          : "We will send a verification code to your registered professional email.";

  const feedbackClass =
    feedback?.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : feedback?.type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-[#DECBE3] bg-[#F8F2F9] text-[#6B4773]";

  return (
    <div
      className="flex min-h-dvh flex-col bg-[#F8F5F9]"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% auto",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
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

      <main className="flex flex-1 items-center justify-center px-4 py-7 sm:px-6 lg:py-10">
        <div className="w-full max-w-[1020px]">
          <div className="grid overflow-hidden rounded-[26px] border border-[#E7DCE9] bg-white/95 shadow-[0_20px_55px_rgba(68,48,74,0.13)] backdrop-blur-sm lg:grid-cols-[0.86fr_1.14fr]">
            <section className="relative overflow-hidden bg-gradient-to-br from-[#EEE3F1] via-[#F7F0F8] to-[#FBF8FC] px-7 py-9 lg:px-10 lg:py-10">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#D8C2DE]/30 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-[#EADDEE]/70 blur-3xl" />

              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#DFCFE3] bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#82548C] shadow-sm">
                    <ShieldCheck size={14} />
                    Secure professional access
                  </div>

                  <h1 className="mt-5 max-w-sm text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-slate-900">
                    Your MOBI professional account
                  </h1>

                  <p className="mt-3 max-w-sm text-[14px] leading-6 text-slate-600">
                    Doctor and Therapist accounts are invitation-only and protected by a permanent password plus email verification for sensitive account recovery and password changes.
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-white/90 bg-white/75 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-[13px] font-semibold text-slate-800">
                    Security flow
                  </p>
                  <p className="text-[12px] leading-5 text-slate-600">
                    First login: invitation code → create password. Future login: email + password. Password recovery and password changes require confirmation through the registered email.
                  </p>
                </div>
              </div>
            </section>

            <section className="px-7 py-8 sm:px-9 lg:px-11 lg:py-9">
              <div className="mx-auto max-w-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#82548C]">
                  Professional Portal
                </p>

                <h2 className="mt-1.5 text-[27px] font-semibold tracking-[-0.02em] text-slate-900">
                  {modeTitle}
                </h2>

                <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                  {modeDescription}
                </p>

                <div className="mt-5">
                  <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                    I am continuing as
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    {([
                      {
                        role: "doctor" as const,
                        label: "Doctor",
                        helper: "Clinical monitoring",
                        icon: <Stethoscope size={16} />,
                      },
                      {
                        role: "therapist" as const,
                        label: "Therapist",
                        helper: "Learner support",
                        icon: <UsersRound size={16} />,
                      },
                    ]).map((option) => (
                      <button
                        key={option.role}
                        type="button"
                        aria-pressed={selectedRole === option.role}
                        onClick={() => {
                          setSelectedRole(option.role);
                          setFeedback(null);
                          setAccessCode("");
                          setRecoveryCodeSent(false);
                        }}
                        className={`flex min-h-[58px] items-center gap-2.5 rounded-xl border px-3.5 text-left transition ${
                          selectedRole === option.role
                            ? "border-[#9A73A3] bg-[#F6EFF8] text-[#704678] shadow-sm ring-2 ring-[#E9DCEC]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-[#D8C5DD] hover:bg-[#FCF9FC]"
                        }`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#82548C]">
                          {option.icon}
                        </span>
                        <span>
                          <span className="block text-[12px] font-semibold">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
                            {option.helper}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={
                    mode === "password"
                      ? handlePasswordLogin
                      : mode === "activate"
                        ? handleActivation
                        : handleVerifyRecoveryCode
                  }
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                      Registered email
                    </label>
                    <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm focus-within:border-[#B690BE] focus-within:ring-4 focus-within:ring-[#F1E7F3]">
                      <Mail size={17} className="text-[#9A73A3]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setFeedback(null);
                          if (mode === "forgot") {
                            setRecoveryCodeSent(false);
                          }
                        }}
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {mode === "password" && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-[13px] font-semibold text-slate-700">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-[11px] font-semibold text-[#82548C] hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm focus-within:border-[#B690BE] focus-within:ring-4 focus-within:ring-[#F1E7F3]">
                        <LockKeyhole size={17} className="text-[#9A73A3]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-[#F7F1F8] hover:text-[#82548C]"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "activate" && (
                    <CodeField
                      value={accessCode}
                      setValue={setAccessCode}
                      showCode={showCode}
                      setShowCode={setShowCode}
                      label="Activation code"
                    />
                  )}

                  {mode === "forgot" && recoveryCodeSent && (
                    <CodeField
                      value={accessCode}
                      setValue={setAccessCode}
                      showCode={showCode}
                      setShowCode={setShowCode}
                      label="Verification code"
                    />
                  )}

                  {feedback && (
                    <div className={`rounded-xl border px-3.5 py-2.5 text-[12px] leading-5 ${feedbackClass}`}>
                      {feedback.message}
                    </div>
                  )}

                  {mode === "forgot" && !recoveryCodeSent ? (
                    <button
                      type="button"
                      onClick={() => void handleRequestRecoveryCode()}
                      disabled={isSubmitting}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#704678] disabled:opacity-60"
                    >
                      {isSubmitting ? "Sending..." : "Send verification code"}
                      {!isSubmitting && <Mail size={16} />}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#704678] disabled:opacity-60"
                    >
                      {isSubmitting
                        ? "Please wait..."
                        : mode === "password"
                          ? "Sign in"
                          : mode === "activate"
                            ? "Verify and continue"
                            : "Verify reset code"}
                      {!isSubmitting && <ArrowRight size={16} />}
                    </button>
                  )}
                </form>

                {mode === "activate" && (
                  <div className="mt-3 text-center text-[11px] text-slate-500">
                    Need a fresh activation code?{" "}
                    <button
                      type="button"
                      onClick={() => void handleRequestActivationCode()}
                      disabled={isSubmitting}
                      className="font-semibold text-[#82548C] hover:underline disabled:opacity-60"
                    >
                      Request new code
                    </button>
                  </div>
                )}

                {mode === "forgot" && recoveryCodeSent && (
                  <div className="mt-3 text-center text-[11px] text-slate-500">
                    Didn't receive it?{" "}
                    <button
                      type="button"
                      onClick={() => void handleRequestRecoveryCode()}
                      disabled={isSubmitting}
                      className="font-semibold text-[#82548C] hover:underline disabled:opacity-60"
                    >
                      Send another code
                    </button>
                  </div>
                )}

                <div className="my-5 border-t border-slate-200" />

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
                  {mode !== "password" && (
                    <button
                      type="button"
                      onClick={() => switchMode("password")}
                      className="font-semibold text-[#82548C] hover:underline"
                    >
                      Back to sign in
                    </button>
                  )}

                  {mode !== "activate" && (
                    <button
                      type="button"
                      onClick={() => switchMode("activate")}
                      className="font-semibold text-[#82548C] hover:underline"
                    >
                      First time? Activate account
                    </button>
                  )}
                </div>

                <p className="mt-5 text-center text-[10px] leading-4 text-slate-400">
                  Security codes are sent only to the registered email address on the professional account.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
