import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import bg from "../../assets/bg1.png";
import { supabaseAuth } from "../../config/supabaseAuth";
import {
  recordPasswordUpdate,
  type StaffRole,
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function verifyRecoverySession() {
      const recovery = localStorage.getItem(
        "mobi_password_recovery",
      );
      const role = localStorage.getItem(
        "mobi_staff_role",
      );
      const profileId = localStorage.getItem(
        "mobi_staff_profile_id",
      );
      const {
        data: { session },
      } = await supabaseAuth.auth.getSession();

      if (
        recovery !== "true" ||
        !role ||
        !profileId ||
        !session
      ) {
        navigate("/login", { replace: true });
      }
    }

    void verifyRecoverySession();
  }, [navigate]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage("");

    const ruleError = validatePassword(password);
    if (ruleError) {
      setErrorMessage(ruleError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    const role = localStorage.getItem(
      "mobi_staff_role",
    ) as StaffRole | null;
    const profileId = localStorage.getItem(
      "mobi_staff_profile_id",
    );

    if (!role || !profileId) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setSaving(true);

      const {
        error: updateError,
      } = await supabaseAuth.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      const {
        data: { session },
      } = await supabaseAuth.auth.getSession();

      if (!session) {
        throw new Error(
          "Your password-reset session expired. Request a new verification code.",
        );
      }

      await recordPasswordUpdate(
        role,
        profileId,
        "recovery",
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
            "Password reset successfully. Sign in using your new password.",
        },
      });
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to reset your password.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F8F5F9] px-4 py-8"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% auto",
      }}
    >
      <div className="w-full max-w-lg rounded-[24px] border border-[#E7DCE9] bg-white p-7 shadow-[0_20px_55px_rgba(68,48,74,0.13)] sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EAF4] text-[#82548C]">
          <ShieldCheck size={22} />
        </div>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#82548C]">
          Verified password recovery
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Set a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your email verification code was accepted. Choose a new permanent password for your MOBI professional account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <PasswordInput
            label="New password"
            value={password}
            onChange={setPassword}
            visible={showPassword}
            setVisible={setShowPassword}
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showPassword}
            setVisible={setShowPassword}
          />

          <div className="rounded-xl bg-[#FAF7FB] p-3.5 text-[11px] leading-5 text-slate-500">
            10+ characters with uppercase, lowercase, number, and symbol.
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#82548C] text-sm font-semibold text-white transition hover:bg-[#704678] disabled:opacity-60"
          >
            {saving ? "Updating password..." : "Reset password"}
            {!saving && <CheckCircle2 size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  setVisible,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
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
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
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
