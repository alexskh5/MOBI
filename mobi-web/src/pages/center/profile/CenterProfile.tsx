import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";
import centerLogo from "../../../assets/centerLogo.png";
import coverPhoto from "../../../assets/coverPhoto.png";
import {
  getCenterProfile,
  updateCenterProfile,
  type CenterProfile as CenterProfileData,
} from "../../../services/centerProfileApi";

const emptyProfile: CenterProfileData = {
  id: "",
  centerName: "",
  centerEmail: "",
  centerPhone: "",
  centerWebsite: "",
  centerOwnerName: "",
  centerOwnerPhone: "",
  centerOwnerEmail: "",
  contactPersonName: "",
  contactPersonPhone: "",
  contactPersonEmail: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  about: "",
  subscriptionStatus: "No active plan",
  isActive: false,
};

type EditableFieldProps = {
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onDone: () => void;
  type?: "text" | "email";
  icon?: React.ReactNode;
};

const EditableField = ({
  label,
  value,
  editing,
  onEdit,
  onChange,
  onDone,
  type = "text",
  icon,
}: EditableFieldProps) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div
        className={`group flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4 shadow-sm transition ${
          editing
            ? "border-[#9B6BA4] ring-4 ring-[#9B6BA4]/10"
            : "border-slate-200 hover:border-[#C9A7CF]"
        }`}
      >
        {icon && <div className="shrink-0 text-slate-400">{icon}</div>}

        {editing ? (
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onDone}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onDone();
              }
            }}
            autoFocus
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none sm:text-base"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate py-3 text-sm text-slate-800 sm:text-base">
            {value || "Not provided"}
          </span>
        )}

        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-slate-400 opacity-70 transition hover:bg-[#F5ECF6] hover:text-[#82548C] group-hover:opacity-100"
            aria-label={`Edit ${label}`}
          >
            <Pencil size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

const CenterProfile = () => {
  const navigate = useNavigate();

  const [editingCenterName, setEditingCenterName] = useState(false);
  const [centerName, setCenterName] = useState("ABLED MINDS THERAPY CENTER");

  const [editingAddress, setEditingAddress] = useState(false);
  const [address, setAddress] = useState(
    "Tintay Talamban, Cebu City, 6000"
  );

  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState("09158872911");

  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState("abledminds@gmail.com");

  const [editingAbout, setEditingAbout] = useState(false);
  const [about, setAbout] = useState(
    "Therapists from Abled Minds supported the development of the MOBI App by helping validate its features and providing professional guidance to ensure it is effective for therapy and learning environments."
  );

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="min-h-full overflow-hidden rounded-none bg-[#F8F5F9] font-sans sm:rounded-[26px]">
          {/* HERO / COVER */}
          <section className="relative">
            <div className="relative h-44 overflow-hidden sm:h-56 lg:h-64">
              <img
                src={coverPhoto}
                alt="Center cover"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#5D3B65]/55 via-[#82548C]/25 to-[#E4C9E5]/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/90 text-xl shadow-sm backdrop-blur transition hover:bg-white sm:left-6 sm:top-6"
                  aria-label="Open sidebar"
                >
                  ☰
                </button>
              )}

              <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                >
                  <Camera size={16} />
                  <span className="hidden sm:inline">Change cover</span>
                </button>
              </div>
            </div>

            {/* PROFILE HEADER */}
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="-mt-14 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_50px_rgba(40,20,45,0.10)] sm:-mt-16 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="relative mx-auto shrink-0 sm:mx-0">
                      <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md sm:h-32 sm:w-32">
                        <img
                          src={centerLogo}
                          alt="Center logo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-[#F5ECF6] hover:text-[#82548C]"
                        aria-label="Change center logo"
                      >
                        <Camera size={16} />
                      </button>
                    </div>

                    <div className="min-w-0 pb-1 text-center sm:text-left">
                      <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={13} />
                          Active Center
                        </span>
                        <span className="rounded-full bg-[#F5ECF6] px-2.5 py-1 text-xs font-semibold text-[#82548C]">
                          Center Profile
                        </span>
                      </div>

                      <div className="flex items-start justify-center gap-2 sm:justify-start">
                        {editingCenterName ? (
                          <input
                            type="text"
                            value={centerName}
                            onChange={(event) =>
                              setCenterName(event.target.value)
                            }
                            onBlur={() => setEditingCenterName(false)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                setEditingCenterName(false);
                              }
                            }}
                            autoFocus
                            className="w-full max-w-2xl border-b-2 border-[#82548C] bg-transparent text-xl font-bold tracking-tight text-slate-900 outline-none sm:text-2xl lg:text-3xl"
                          />
                        ) : (
                          <h1 className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                            {centerName}
                          </h1>
                        )}

                        {!editingCenterName && (
                          <button
                            type="button"
                            onClick={() => setEditingCenterName(true)}
                            className="mt-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-[#F5ECF6] hover:text-[#82548C]"
                            aria-label="Edit center name"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </div>

                      <div className="mt-2 flex items-start justify-center gap-2 text-sm text-slate-500 sm:justify-start sm:text-base">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        {editingAddress ? (
                          <input
                            type="text"
                            value={address}
                            onChange={(event) =>
                              setAddress(event.target.value)
                            }
                            onBlur={() => setEditingAddress(false)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                setEditingAddress(false);
                              }
                            }}
                            autoFocus
                            className="min-w-0 flex-1 border-b border-[#82548C] bg-transparent outline-none"
                          />
                        ) : (
                          <span className="break-words">{address}</span>
                        )}

                        {!editingAddress && (
                          <button
                            type="button"
                            onClick={() => setEditingAddress(true)}
                            className="rounded p-1 text-slate-400 transition hover:text-[#82548C]"
                            aria-label="Edit address"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate("/center/profile/doctors")}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#C9A7CF] hover:bg-[#FBF8FC]"
                    >
                      <Stethoscope size={17} />
                      Doctors
                      <ArrowRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/center/profile/staff")}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#82548C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#704578]"
                    >
                      <Users size={17} />
                      Staff
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN CONTENT */}
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* CONTACT */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      Contact Information
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Public contact details used for your center profile.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <EditableField
                      label="Center phone number"
                      value={phone}
                      editing={editingPhone}
                      onEdit={() => setEditingPhone(true)}
                      onChange={setPhone}
                      onDone={() => setEditingPhone(false)}
                      icon={<Phone size={17} />}
                    />

                    <EditableField
                      label="Center email"
                      value={email}
                      editing={editingEmail}
                      onEdit={() => setEditingEmail(true)}
                      onChange={setEmail}
                      onDone={() => setEditingEmail(false)}
                      type="email"
                      icon={<Mail size={17} />}
                    />
                  </div>
                </section>

                {/* ABOUT */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                        About the Center
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        A short description shown across MOBI.
                      </p>
                    </div>

                    {!editingAbout && (
                      <button
                        type="button"
                        onClick={() => setEditingAbout(true)}
                        className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-[#C9A7CF] hover:bg-[#F5ECF6] hover:text-[#82548C]"
                        aria-label="Edit about"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                  </div>

                  {editingAbout ? (
                    <textarea
                      value={about}
                      onChange={(event) => setAbout(event.target.value)}
                      onBlur={() => setEditingAbout(false)}
                      rows={6}
                      autoFocus
                      className="min-h-36 w-full resize-y rounded-xl border border-[#9B6BA4] bg-white p-4 text-sm leading-6 text-slate-700 outline-none ring-4 ring-[#9B6BA4]/10 sm:text-base"
                    />
                  ) : (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <p className="text-sm leading-7 text-slate-600 sm:text-base">
                        {about}
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}

              {/* RIGHT COLUMN */}
              <aside className="space-y-6">
                {/* ACCOUNT SECURITY */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5ECF6] text-[#82548C]">
                    <ShieldCheck size={21} />
                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    Account & Security
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Passwords are never displayed on this page. Security and
                    login credentials should be managed through the account
                    access flow.
                  </p>

                  <button
                    type="button"
                    className="mt-5 inline-flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#C9A7CF] hover:bg-[#FBF8FC]"
                  >
                    Manage account access
                    <ArrowRight size={16} />
                  </button>
                </section>

                {/* SUBSCRIPTION */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5ECF6] text-[#82548C]">
                    <CreditCard size={20} />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Subscription
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        MOBI Center Plan
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-5 inline-flex w-full items-center justify-between rounded-xl bg-[#82548C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#704578]"
                  >
                    View subscription
                    <ArrowRight size={16} />
                  </button>
                </section>

                {/* PROFILE STATUS */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Building2 size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Profile status
                      </p>
                      <p className="text-xs text-slate-500">
                        Center information is visible
                      </p>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </main>
        </div>
      )}
    </CenterLayout>
  );
};

export default CenterProfile;
