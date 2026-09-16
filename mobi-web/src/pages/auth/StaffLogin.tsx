import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import mobiLogo from "../../assets/mobiLogo.png";

import {
  requestStaffLoginCode,
  verifyStaffOtp,
} from "../../services/auth/staffAuthApi";

import {
  supabaseAuth,
} from "../../config/supabaseAuth";

const StaffLogin = () => {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    code,
    setCode,
  ] =
    useState("");

  const [
    isVerifying,
    setIsVerifying,
  ] =
    useState(false);

  const [
    isRequesting,
    setIsRequesting,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState<{
      type:
        | "success"
        | "error";
      text: string;
    } | null>(
      null,
    );

  const handleVerify =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !email.trim() ||
        !code.trim()
      ) {
        setMessage({
          type:
            "error",
          text:
            "Enter your email and temporary access code.",
        });
        return;
      }

      try {
        setIsVerifying(
          true,
        );

        setMessage(null);

        const result =
          await verifyStaffOtp(
            email.trim(),
            code.trim(),
          );

        /*
          The backend verified the OTP securely.
          We now place the returned user session into the normal
          browser Supabase client so it can persist and auto-refresh.
        */
        const {
          error:
            sessionError,
        } =
          await supabaseAuth.auth.setSession({
            access_token:
              result.session.access_token,

            refresh_token:
              result.session.refresh_token,
          });

        if (
          sessionError
        ) {
          throw sessionError;
        }

        localStorage.setItem(
          "mobi_staff_role",
          result.role,
        );

        localStorage.setItem(
          "mobi_staff_profile_id",
          result.doctor.id,
        );

        navigate(
          "/doctor/DocDashboardScreen",
          {
            replace: true,
          },
        );
      } catch (error: any) {
        setMessage({
          type:
            "error",
          text:
            error?.response
              ?.data?.message ||
            error?.message ||
            "Unable to log in.",
        });
      } finally {
        setIsVerifying(
          false,
        );
      }
    };

  const handleRequestCode =
    async () => {
      if (!email.trim()) {
        setMessage({
          type:
            "error",
          text:
            "Enter your staff email first.",
        });
        return;
      }

      try {
        setIsRequesting(
          true,
        );

        setMessage(null);

        const result =
          await requestStaffLoginCode(
            email.trim(),
          );

        setMessage({
          type:
            "success",
          text:
            result.message,
        });
      } catch (error: any) {
        setMessage({
          type:
            "error",
          text:
            error?.response
              ?.data?.message ||
            error?.message ||
            "Unable to request a new code.",
        });
      } finally {
        setIsRequesting(
          false,
        );
      }
    };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-4 py-8 font-professional">
      <div className="w-full max-w-[430px]">
        <div className="mb-5 flex items-center justify-center gap-3">
          <img
            src={mobiLogo}
            alt="MOBI"
            className="h-12 w-12 object-contain"
          />

          <div>
            <p className="text-[16px] font-bold text-[#202027]">
              MOBI
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8e8592]">
              Staff Access
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-[18px] border border-[#e5dce7] bg-white shadow-[0_18px_50px_rgba(45,34,48,0.08)]">
          <div className="border-b border-[#eee8ef] px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-[#f3eff8] text-[#7456a3]">
              <ShieldCheck
                size={21}
              />
            </div>

            <h1 className="mt-4 text-[23px] font-bold tracking-[-0.02em] text-[#202027]">
              Staff Login
            </h1>

            <p className="mt-2 text-[12px] leading-6 text-[#757580]">
              Enter the email registered by your therapy center and the temporary code sent to your inbox.
            </p>
          </div>

          <form
            onSubmit={
              handleVerify
            }
            className="px-6 py-6"
          >
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-[#444049]">
                Email Address
              </span>

              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98919c]"
                />

                <input
                  type="email"
                  value={
                    email
                  }
                  onChange={(
                    event,
                  ) =>
                    setEmail(
                      event
                        .target
                        .value,
                    )
                  }
                  className="h-11 w-full rounded-[10px] border border-[#e2dae4] bg-[#fbfafc] pl-10 pr-3 text-[13px] outline-none transition focus:border-[#b993b7] focus:bg-white focus:ring-4 focus:ring-[#a86f9f]/10"
                  placeholder="staff@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-[11px] font-semibold text-[#444049]">
                Temporary Access Code
              </span>

              <div className="relative">
                <KeyRound
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98919c]"
                />

                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    code
                  }
                  onChange={(
                    event,
                  ) =>
                    setCode(
                      event
                        .target
                        .value
                        .replace(
                          /\D/g,
                          "",
                        )
                        .slice(
                          0,
                          10,
                        ),
                    )
                  }
                  className="h-11 w-full rounded-[10px] border border-[#e2dae4] bg-[#fbfafc] pl-10 pr-3 text-[15px] font-semibold tracking-[0.18em] outline-none transition focus:border-[#b993b7] focus:bg-white focus:ring-4 focus:ring-[#a86f9f]/10"
                  placeholder="Enter code"
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <p className="mt-2 text-[10px] leading-4 text-[#98919c]">
                Codes are one-time use and expire after the period configured by MOBI.
              </p>
            </label>

            {message && (
              <div
                className={`mt-5 rounded-[10px] border px-3.5 py-3 text-[11px] font-medium leading-5 ${
                  message.type ===
                  "success"
                    ? "border-[#cfe4d6] bg-[#f4fbf6] text-[#4f9467]"
                    : "border-[#edcece] bg-[#fff7f7] text-[#a75555]"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isVerifying
              }
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#7456a3] text-[12px] font-semibold text-white transition hover:bg-[#62458e] disabled:cursor-wait disabled:opacity-60"
            >
              {isVerifying
                ? "Verifying..."
                : "Log In"}

              {!isVerifying && (
                <ArrowRight
                  size={15}
                />
              )}
            </button>

            <div className="mt-5 border-t border-[#eee8ef] pt-5 text-center">
              <p className="text-[10px] leading-5 text-[#85808a]">
                Code expired or you signed out?
              </p>

              <button
                type="button"
                disabled={
                  isRequesting
                }
                onClick={() =>
                  void handleRequestCode()
                }
                className="mt-1 text-[11px] font-semibold text-[#7456a3] transition hover:text-[#62458e] disabled:opacity-50"
              >
                {isRequesting
                  ? "Sending..."
                  : "Send a new code to my email"}
              </button>
            </div>
          </form>
        </section>

        <p className="mt-4 text-center text-[9px] leading-4 text-[#98919c]">
          Access is limited to staff accounts created by an authorized MOBI center.
        </p>
      </div>
    </main>
  );
};

export default StaffLogin;
