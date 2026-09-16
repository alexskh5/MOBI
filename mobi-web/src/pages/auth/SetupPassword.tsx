import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import bg from "../../assets/bg1.png";
import {
  supabaseAuth,
} from "../../config/supabaseAuth";
import {
  getStaffSecurityStatus,
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

function dashboardForRole(role: StaffRole) {
  return role === "doctor"
    ? "/doctor/DocDashboardScreen"
    : "/therapist/dashboard";
}

export default function SetupPassword() {
  const navigate = useNavigate();

  const [emailLabel, setEmailLabel] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSetup() {
      const role = localStorage.getItem(
        "mobi_staff_role",
      ) as StaffRole | null;
      const profileId = localStorage.getItem(
        "mobi_staff_profile_id",
      );

      const {
        data: { session },
      } = await supabaseAuth.auth.getSession();

      if (!role || !profileId || !session) {
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

        setEmailLabel(
          result.security.maskedEmail,
        );

        if (!result.security.requiresPasswordSetup) {
          localStorage.removeItem(
            "mobi_password_setup_required",
          );
          navigate(
            dashboardForRole(role),
            { replace: true },
          );
          return;
        }
      } catch (error: any) {
        if (!mounted) return;
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to verify your account setup session.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void checkSetup();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage("");

    const ruleError =
      validatePassword(password);

    if (ruleError) {
      setErrorMessage(ruleError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match.",
      );
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
        error: passwordError,
      } = await supabaseAuth.auth.updateUser({
        password,
      });

      if (passwordError) {
        throw passwordError;
      }

      const {
        data: { session },
      } = await supabaseAuth.auth.getSession();

      if (!session) {
        throw new Error(
          "Your activation session expired. Please activate your account again.",
        );
      }

      await recordPasswordUpdate(
        role,
        profileId,
        "initial",
        session.access_token,
      );

      localStorage.removeItem(
        "mobi_password_setup_required",
      );

      navigate(
        dashboardForRole(role),
        { replace: true },
      );
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create your password.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F5F9] text-sm font-semibold text-slate-600">
        Verifying account setup...
      </div>
    );
  }

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
          First-time account setup
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Create your permanent password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your invitation code has already confirmed access to your registered email{emailLabel ? ` (${emailLabel})` : ""}. Create a password before entering the MOBI professional portal.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <PasswordInput
            label="New password"
            value={password}
            onChange={setPassword}
            visible={showPassword}
            setVisible={setShowPassword}
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showPassword}
            setVisible={setShowPassword}
            autoComplete="new-password"
          />

          <div className="rounded-xl bg-[#FAF7FB] p-3.5 text-[11px] leading-5 text-slate-500">
            <p className="font-semibold text-slate-700">
              Password requirements
            </p>
            <p>10+ characters, uppercase, lowercase, number, and symbol.</p>
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
            {saving ? "Creating password..." : "Create password and continue"}
            {!saving && <CheckCircle2 size={16} />}
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] leading-4 text-slate-400">
          MOBI never stores your readable password in Doctor or Therapist profile tables. Authentication is handled by Supabase Auth.
        </p>
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
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
          onChange={(event) => onChange(event.target.value)}
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
