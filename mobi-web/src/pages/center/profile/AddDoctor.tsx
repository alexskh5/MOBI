import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Mail,
  Save,
  Stethoscope,
  UserRoundPlus,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";

import {
  createDoctor,
  type DoctorFormPayload,
} from "../../../services/doctor/doctorApi";

const EMPTY_FORM:
  DoctorFormPayload = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    specialization: "",
    phoneNumber: "",
    bio: "",
  };

const AddDoctor = () => {
  const navigate =
    useNavigate();

  const [
    form,
    setForm,
  ] =
    useState<DoctorFormPayload>(
      EMPTY_FORM,
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const setField = (
    field:
      keyof DoctorFormPayload,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !form.firstName.trim() ||
        !form.lastName.trim()
      ) {
        setErrorMessage(
          "First name and last name are required.",
        );
        return;
      }

      if (!form.email.trim()) {
        setErrorMessage(
          "Email is required because MOBI sends the doctor's access code there.",
        );
        return;
      }

      try {
        setIsSaving(true);
        setErrorMessage("");

        const result =
          await createDoctor(
            form,
          );

        navigate(
          "/center/profile/doctors",
          {
            replace: true,
            state: {
              doctorNotice: {
                type:
                  result
                    .invitation
                    ?.sent
                    ? "success"
                    : "warning",

                message:
                  result.message,
              },
            },
          },
        );
      } catch (error: any) {
        setErrorMessage(
          error?.response
            ?.data?.message ||
            error?.message ||
            "Unable to add doctor.",
        );
      } finally {
        setIsSaving(false);
      }
    };

  return (
    <CenterLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="min-h-full rounded-[28px] bg-[#eee0ef] p-5 font-professional sm:p-7">
          <div className="mx-auto max-w-[1040px]">
            <header className="mb-6 flex items-start gap-4">
              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(
                      true,
                    )
                  }
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-2xl text-[#4b4450] transition hover:bg-white/60"
                  aria-label="Open sidebar"
                >
                  ☰
                </button>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7456a3]">
                  Center Management
                </span>

                <h1 className="mt-1 text-[29px] font-bold tracking-[-0.02em] text-[#202027]">
                  Add Doctor
                </h1>

                <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-[#757580]">
                  Create a doctor account under Abled Minds Therapy Center.
                  MOBI will send the first temporary access code to the email below.
                </p>
              </div>
            </header>

            <form
              onSubmit={
                handleSubmit
              }
              className="overflow-hidden rounded-[16px] border border-[#ddbfdf] bg-white/70 shadow-[0_8px_24px_rgba(89,62,91,0.06)]"
            >
              <div className="flex items-center gap-4 border-b border-[#ead8eb] px-5 py-5 sm:px-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-[#f3eff8] text-[#7456a3]">
                  <UserRoundPlus
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-[17px] font-semibold text-[#202027]">
                    Doctor Information
                  </h2>

                  <p className="mt-1 text-[11px] leading-5 text-[#757580]">
                    Only account information needed by the Center is collected here.
                    The doctor can add a profile photo later from their own profile.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 px-5 py-6 sm:px-6 md:grid-cols-2">
                <Field
                  label="First Name"
                  required
                >
                  <input
                    type="text"
                    value={
                      form.firstName
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        "firstName",
                        event
                          .target
                          .value,
                      )
                    }
                    className="doctor-input"
                    autoComplete="given-name"
                    required
                  />
                </Field>

                <Field label="Middle Name">
                  <input
                    type="text"
                    value={
                      form.middleName
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        "middleName",
                        event
                          .target
                          .value,
                      )
                    }
                    className="doctor-input"
                    autoComplete="additional-name"
                  />
                </Field>

                <Field
                  label="Last Name"
                  required
                >
                  <input
                    type="text"
                    value={
                      form.lastName
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        "lastName",
                        event
                          .target
                          .value,
                      )
                    }
                    className="doctor-input"
                    autoComplete="family-name"
                    required
                  />
                </Field>

                <Field label="Specialization">
                  <div className="relative">
                    <Stethoscope
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8da0]"
                    />

                    <input
                      type="text"
                      value={
                        form.specialization
                      }
                      onChange={(
                        event,
                      ) =>
                        setField(
                          "specialization",
                          event
                            .target
                            .value,
                        )
                      }
                      className="doctor-input pl-10"
                      placeholder="e.g. Developmental Pediatrician"
                    />
                  </div>
                </Field>

                <Field
                  label="Email Address"
                  helper="Required. The temporary MOBI access code will be sent here."
                  required
                >
                  <div className="relative">
                    <Mail
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8da0]"
                    />

                    <input
                      type="email"
                      value={
                        form.email
                      }
                      onChange={(
                        event,
                      ) =>
                        setField(
                          "email",
                          event
                            .target
                            .value,
                        )
                      }
                      className="doctor-input pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </Field>

                <Field label="Phone Number">
                  <input
                    type="tel"
                    value={
                      form.phoneNumber
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        "phoneNumber",
                        event
                          .target
                          .value,
                      )
                    }
                    className="doctor-input"
                    autoComplete="tel"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Bio"
                    helper="Optional. Keep this short; the doctor can update professional information later."
                  >
                    <textarea
                      value={
                        form.bio
                      }
                      onChange={(
                        event,
                      ) =>
                        setField(
                          "bio",
                          event
                            .target
                            .value,
                        )
                      }
                      rows={4}
                      className="doctor-input min-h-[112px] resize-y py-3"
                    />
                  </Field>
                </div>

                {errorMessage && (
                  <div className="md:col-span-2 rounded-[10px] border border-[#edcece] bg-[#fff7f7] px-4 py-3 text-[12px] font-medium leading-5 text-[#a75555]">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#ead8eb] bg-white/55 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/center/profile/doctors",
                    )
                  }
                  disabled={
                    isSaving
                  }
                  className="min-h-[42px] rounded-[9px] border border-[#e2dce4] bg-white px-5 text-[12px] font-semibold text-[#666672] transition hover:bg-[#faf8fb] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[9px] bg-[#a86f9f] px-5 text-[12px] font-semibold text-white transition hover:bg-[#925d8a] disabled:cursor-wait disabled:opacity-60"
                >
                  <Save size={15} />

                  {isSaving
                    ? "Creating account..."
                    : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>

          <style>{`
            .doctor-input {
              width: 100%;
              min-height: 43px;
              border: 1px solid #dfd3e0;
              border-radius: 10px;
              background: rgba(255, 255, 255, 0.94);
              padding: 10px 12px;
              color: #303038;
              font-size: 13px;
              outline: none;
              transition:
                border-color 0.15s ease,
                box-shadow 0.15s ease,
                background 0.15s ease;
            }

            .doctor-input:focus {
              border-color: #b993b7;
              background: #ffffff;
              box-shadow: 0 0 0 3px rgba(168, 111, 159, 0.10);
            }
          `}</style>
        </div>
      )}
    </CenterLayout>
  );
};

function Field({
  label,
  helper,
  required = false,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-[#38323b]">
        {label}

        {required && (
          <span className="ml-1 text-[#a75555]">
            *
          </span>
        )}
      </span>

      {children}

      {helper && (
        <span className="mt-1.5 block text-[10px] leading-4 text-[#8e8592]">
          {helper}
        </span>
      )}
    </label>
  );
}

export default AddDoctor;
