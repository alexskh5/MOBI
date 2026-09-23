import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthCard from "../../components/auth/AuthCard";
import AuthProgress from "../../components/auth/AuthProgress";

import bg from "../../assets/bg1.png";
import mobiLogo from "../../assets/mobiLogo.png";
import {
  completeCenterInvitation,
  getCenterInvitation,
} from "../../services/super_admin/superAdminApi";

type InvitationDetails = {
  magicCode: string;
  centerEmail: string;
  centerName: string;
  centerOwnerName?: string | null;
  centerOwnerPhone?: string | null;
  centerOwnerEmail?: string | null;
  contactPersonName?: string | null;
  contactPersonPhone?: string | null;
  contactPersonEmail?: string | null;
  expiresAt: string;
};

type SetupForm = {
  magicCode: string;
  centerName: string;
  centerEmail: string;
  centerOwnerName: string;
  centerOwnerPhone: string;
  centerOwnerEmail: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  centerPhone: string;
  centerWebsite: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  about: string;
  password: string;
  confirmPassword: string;
};

const emptyForm: SetupForm = {
  magicCode: "",
  centerName: "",
  centerEmail: "",
  centerOwnerName: "",
  centerOwnerPhone: "",
  centerOwnerEmail: "",
  contactPersonName: "",
  contactPersonPhone: "",
  contactPersonEmail: "",
  centerPhone: "",
  centerWebsite: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  about: "",
  password: "",
  confirmPassword: "",
};

function AcceptInvitation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<SetupForm>({
    ...emptyForm,
    magicCode: searchParams.get("code") || "",
  });
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      return;
    }

    async function loadInvitation() {
      try {
        setLoading(true);
        setError("");

        const result = await getCenterInvitation(code || "");
        const data: InvitationDetails = result.data;

        setInvitation(data);
        setForm((prev) => ({
          ...prev,
          magicCode: data.magicCode,
          centerName: data.centerName || "",
          centerEmail: data.centerEmail || "",
          centerOwnerName: data.centerOwnerName || "",
          centerOwnerPhone: data.centerOwnerPhone || "",
          centerOwnerEmail: data.centerOwnerEmail || "",
          contactPersonName: data.contactPersonName || "",
          contactPersonPhone: data.contactPersonPhone || "",
          contactPersonEmail: data.contactPersonEmail || "",
        }));
      } catch (loadError: any) {
        setError(
          loadError?.response?.data?.message ||
            loadError?.message ||
            "Unable to load this invitation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [searchParams]);

  const updateField = (field: keyof SetupForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getCenterInvitation(form.magicCode);
      const data: InvitationDetails = result.data;

      setInvitation(data);
      setForm((prev) => ({
        ...prev,
        magicCode: data.magicCode,
        centerName: data.centerName || "",
        centerEmail: data.centerEmail || "",
        centerOwnerName: data.centerOwnerName || "",
        centerOwnerPhone: data.centerOwnerPhone || "",
        centerOwnerEmail: data.centerOwnerEmail || "",
        contactPersonName: data.contactPersonName || "",
        contactPersonPhone: data.contactPersonPhone || "",
        contactPersonEmail: data.contactPersonEmail || "",
      }));
    } catch (verifyError: any) {
      setInvitation(null);
      setError(
        verifyError?.response?.data?.message ||
          verifyError?.message ||
          "Unable to verify this magic code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await completeCenterInvitation(form);

      setSuccess("Center account created. You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (submitError: any) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Unable to create the center account."
      );
    } finally {
      setSubmitting(false);
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
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 sm:px-6">
        <AuthCard className="max-w-4xl">
          <AuthProgress currentStep={2} />

          <img src={mobiLogo} alt="MOBI Logo" className="mx-auto w-24 sm:w-28" />

          <h1 className="mt-5 text-center font-itim text-3xl sm:text-4xl">
            Create Center Account
          </h1>

          <p className="inter mt-3 text-center text-sm leading-relaxed text-gray-700 sm:text-base">
            Enter the magic code sent by MOBI, complete the center profile, and
            create the center admin password.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              value={form.magicCode}
              onChange={(event) =>
                updateField("magicCode", event.target.value.toUpperCase())
              }
              placeholder="Magic code"
              className="w-full rounded-xl bg-[#F0E4F1] px-4 py-3 text-center tracking-[0.35em] outline-none focus:ring-2 focus:ring-[#AAB7DA]"
            />

            <button
              type="button"
              onClick={verifyCode}
              disabled={loading || !form.magicCode.trim()}
              className="rounded-xl bg-[#AAB7DA] px-6 py-3 font-itim text-lg transition hover:bg-[#97A7D2] disabled:opacity-60"
            >
              {loading ? "Checking..." : "Verify"}
            </button>
          </div>

          {error && (
            <p className="inter mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="inter mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {success}
            </p>
          )}

          {invitation && (
            <form onSubmit={handleSubmit} className="mt-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <SetupField
                  label="Center name"
                  value={form.centerName}
                  onChange={(value) => updateField("centerName", value)}
                  required
                />
                <SetupField
                  label="Center official email"
                  type="email"
                  value={form.centerEmail}
                  onChange={(value) => updateField("centerEmail", value)}
                  required
                />
                <SetupField
                  label="Center owner"
                  value={form.centerOwnerName}
                  onChange={(value) => updateField("centerOwnerName", value)}
                />
                <SetupField
                  label="Owner phone"
                  value={form.centerOwnerPhone}
                  onChange={(value) => updateField("centerOwnerPhone", value)}
                />
                <SetupField
                  label="Owner email"
                  type="email"
                  value={form.centerOwnerEmail}
                  onChange={(value) => updateField("centerOwnerEmail", value)}
                />
                <SetupField
                  label="Contact person"
                  value={form.contactPersonName}
                  onChange={(value) => updateField("contactPersonName", value)}
                />
                <SetupField
                  label="Contact number"
                  value={form.contactPersonPhone}
                  onChange={(value) => updateField("contactPersonPhone", value)}
                />
                <SetupField
                  label="Contact email"
                  type="email"
                  value={form.contactPersonEmail}
                  onChange={(value) => updateField("contactPersonEmail", value)}
                />
                <SetupField
                  label="Center phone"
                  value={form.centerPhone}
                  onChange={(value) => updateField("centerPhone", value)}
                />
                <SetupField
                  label="Website"
                  value={form.centerWebsite}
                  onChange={(value) => updateField("centerWebsite", value)}
                />
                <SetupField
                  label="Address"
                  value={form.address}
                  onChange={(value) => updateField("address", value)}
                />
                <SetupField
                  label="City"
                  value={form.city}
                  onChange={(value) => updateField("city", value)}
                />
                <SetupField
                  label="Province"
                  value={form.province}
                  onChange={(value) => updateField("province", value)}
                />
                <SetupField
                  label="Postal code"
                  value={form.postalCode}
                  onChange={(value) => updateField("postalCode", value)}
                />
                <SetupField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(value) => updateField("password", value)}
                  required
                />
                <SetupField
                  label="Re-enter password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(value) => updateField("confirmPassword", value)}
                  required
                />
              </div>

              <label className="mt-4 flex flex-col gap-2 font-itim text-lg">
                About the clinic
                <textarea
                  value={form.about}
                  onChange={(event) => updateField("about", event.target.value)}
                  className="min-h-28 w-full rounded-xl bg-[#F0E4F1] px-4 py-3 outline-none focus:ring-2 focus:ring-[#AAB7DA]"
                />
              </label>

              <p className="inter mt-4 text-xs text-gray-600 sm:text-sm">
                Password must have at least 8 characters, one capital letter,
                one number, and one special character.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full rounded-xl bg-[#AAB7DA] py-3 font-itim text-lg transition hover:bg-[#97A7D2] disabled:opacity-60 sm:text-xl"
              >
                {submitting ? "Creating Account..." : "Create Center Account"}
              </button>
            </form>
          )}
        </AuthCard>
      </main>
    </div>
  );
}

function SetupField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 font-itim text-lg">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-xl bg-[#F0E4F1] px-4 py-3 outline-none focus:ring-2 focus:ring-[#AAB7DA]"
      />
    </label>
  );
}

export default AcceptInvitation;
