import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { supabaseAuth } from "../../config/supabaseAuth";
import {
  getStaffSecurityStatus,
  recordPasswordUpdate,
  type StaffRole,
  type StaffSecurityStatus,
} from "../../services/auth/staffAuthApi";

function validatePassword(
  password: string,
) {
  if (password.length < 10) {
    return "Use at least 10 characters.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Add at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Add at least one lowercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Add at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Add at least one symbol.";
  }
  return null;
}

function profileRoute(role: StaffRole) {
  return role === "doctor"
    ? "/doctor/DocProfileScreen"
    : "/therapist/profile";
}

export default function ProfessionalSecurity() {
  const navigate = useNavigate();

  const [security, setSecurity] =
    useState<StaffSecurityStatus | null>(null);
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [verificationCode, setVerificationCode] =
    useState("");
  const [showPasswords, setShowPasswords] =
    useState(false);
  const [codeSent, setCodeSent] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [working, setWorking] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [infoMessage, setInfoMessage] =
    useState("");

  const role = localStorage.getItem(
    "mobi_staff_role",
  ) as StaffRole | null;
  const profileId = localStorage.getItem(
    "mobi_staff_profile_id",
  );

  useEffect(() => {
    let mounted = true;

    async function loadSecurity() {
      if (!role || !profileId) {
        navigate("/login", { replace: true });
        return;
      }

      const {
        data: { session },
      } = await supabaseAuth.auth.getSession();

      if (!session) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const result = await getStaffSecurityStatus(
          role,
          profileId,
          session.access_token,
        );

        if (!mounted) return;

        if (result.security.requiresPasswordSetup) {
          navigate(
            "/professional/setup-password",
            { replace: true },
          );
          return;
        }

        setSecurity(result.security);
      } catch (error: any) {
        if (!mounted) return;
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load account security.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadSecurity();
    return () => {
      mounted = false;
    };
  }, [navigate, profileId, role]);

  const validateChangeFields = () => {
    if (!currentPassword) {
      return "Enter your current password.";
    }

    const ruleError = validatePassword(newPassword);
    if (ruleError) return ruleError;

    if (newPassword !== confirmPassword) {
      return "The new passwords do not match.";
    }

    if (newPassword === currentPassword) {
      return "Choose a new password that is different from your current password.";
    }

    return null;
  };

  const sendVerificationCode = async () => {
    setErrorMessage("");
    setInfoMessage("");

    if (!security) return;

    const fieldError = validateChangeFields();
    if (fieldError) {
      setErrorMessage(fieldError);
      return;
    }

    try {
      setWorking(true);

      /*
        Confirm the current password before sending a security email.
        This creates a fresh session for the same Supabase user.
      */
      const {
        error: passwordError,
      } = await supabaseAuth.auth.signInWithPassword({
        email: security.email,
        password: currentPassword,
      });

      if (passwordError) {
        throw new Error(
          "Your current password is incorrect.",
        );
      }

      /* Supabase sends the reauthentication nonce to the user's own email. */
      const {
        error: reauthError,
      } = await supabaseAuth.auth.reauthenticate();

      if (reauthError) throw reauthError;

      setCodeSent(true);
      setVerificationCode("");
      setInfoMessage(
        `A verification code was sent to ${security.maskedEmail}.`,
      );
    } catch (error: any) {
      setErrorMessage(
        error?.message ||
          "Unable to send the verification code.",
      );
    } finally {
      setWorking(false);
    }
  };

  const handleChangePassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!role || !profileId || !security) return;

    const fieldError = validateChangeFields();
    if (fieldError) {
      setErrorMessage(fieldError);
      return;
    }

    if (!/^\d{6,8}$/.test(verificationCode)) {
      setErrorMessage(
        "Enter the verification code sent to your registered email.",
      );
      return;
    }

    try {
      setWorking(true);

      const {
        error: updateError,
      } = await supabaseAuth.auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
        nonce: verificationCode,
      });

      if (updateError) throw updateError;

      const {
        data: { session },
      } = await supabaseAuth.auth.getSession();

      if (!session) {
        throw new Error(
          "Your security session expired. Please sign in again.",
        );
      }

      await recordPasswordUpdate(
        role,
        profileId,
        "change",
        session.access_token,
      );

      await supabaseAuth.auth.signOut();
      localStorage.removeItem("mobi_staff_role");
      localStorage.removeItem("mobi_staff_profile_id");
      localStorage.removeItem("mobi_password_recovery");
      localStorage.removeItem("mobi_password_setup_required");

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password changed successfully. For security, please sign in again with your new password.",
        },
      });
    } catch (error: any) {
      setErrorMessage(
        error?.message ||
          "Unable to change your password.",
      );
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F5F9] text-sm font-semibold text-slate-600">
        Loading account security...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F9] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() =>
            role
              ? navigate(profileRoute(role))
              : navigate("/login")
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7456A3] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to My Profile
        </button>

        <div className="rounded-[24px] border border-[#E7DCE9] bg-white p-6 shadow-[0_18px_48px_rgba(68,48,74,0.10)] sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EAF4] text-[#82548C]">
            <ShieldCheck size={22} />
          </div>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#82548C]">
            Account Security
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Change your password
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            MOBI confirms both your current password and access to your registered email before applying a password change.
          </p>

          {security && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Mail size={18} className="mt-0.5 text-[#82548C]" />
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Verification email
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Security codes are sent only to {security.maskedEmail}.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            <PasswordField
              label="Current password"
              value={currentPassword}
              setValue={setCurrentPassword}
              visible={showPasswords}
              setVisible={setShowPasswords}
              autoComplete="current-password"
            />
            <PasswordField
              label="New password"
              value={newPassword}
              setValue={setNewPassword}
              visible={showPasswords}
              setVisible={setShowPasswords}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              setValue={setConfirmPassword}
              visible={showPasswords}
              setVisible={setShowPasswords}
              autoComplete="new-password"
            />

            {!codeSent ? (
              <button
                type="button"
                onClick={() => void sendVerificationCode()}
                disabled={working}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#CDB8D2] bg-[#F8F2F9] text-sm font-semibold text-[#7456A3] transition hover:bg-[#F1E7F3] disabled:opacity-60"
              >
                <Mail size={16} />
                {working ? "Verifying..." : "Confirm current password and send code"}
              </button>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email verification code
                </label>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-[#B690BE] focus-within:ring-4 focus-within:ring-[#F1E7F3]">
                  <KeyRound size={17} className="text-[#9A73A3]" />
                  <input
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 8),
                      )
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter code"
                    className="min-w-0 flex-1 bg-transparent text-sm tracking-[0.14em] outline-none"
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#FAF7FB] p-3.5 text-[11px] leading-5 text-slate-500">
              New passwords require 10+ characters, uppercase, lowercase, a number, and a symbol.
            </div>

            {infoMessage && (
              <div className="rounded-xl border border-[#DECBE3] bg-[#F8F2F9] px-4 py-3 text-xs text-[#6B4773]">
                {infoMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            {codeSent && (
              <button
                type="submit"
                disabled={working}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#82548C] text-sm font-semibold text-white transition hover:bg-[#704678] disabled:opacity-60"
              >
                {working ? "Changing password..." : "Confirm and change password"}
                {!working && <CheckCircle2 size={16} />}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  setValue,
  visible,
  setVisible,
  autoComplete,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </span>
      <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-[#B690BE] focus-within:ring-4 focus-within:ring-[#F1E7F3]">
        <LockKeyhole size={17} className="text-[#9A73A3]" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="text-slate-400 hover:text-[#82548C]"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}
