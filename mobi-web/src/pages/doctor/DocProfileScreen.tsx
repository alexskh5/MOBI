import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import DocSidebar from "../../components/doctor/DocSidebar";

/* =========================================================
   TYPES
   Static for now, but already structured for future APIs.
========================================================= */

type DoctorStatus = "active" | "inactive";
type ConsultationMode = "In-person" | "Online" | "Hybrid";

interface DoctorProfile {
  id: string;
  fullName: string;
  professionalTitle: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  licenseExpiry: string;
  affiliatedCenter: string;
  yearsOfExperience: number;
  languages: string[];
  consultationDays: string;
  consultationHours: string;
  consultationMode: ConsultationMode;
  status: DoctorStatus;
  biography: string;
  profileImage: string | null;
  coverImage: string | null;
}

interface EditableDoctorProfile {
  fullName: string;
  professionalTitle: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  licenseExpiry: string;
  affiliatedCenter: string;
  yearsOfExperience: string;
  languages: string;
  consultationDays: string;
  consultationHours: string;
  consultationMode: ConsultationMode;
  biography: string;
}

/* =========================================================
   STATIC PREVIEW DATA
   Later replace this with:
   GET /doctor/profile
========================================================= */

const INITIAL_DOCTOR_PROFILE: DoctorProfile = {
  id: "doctor-001",
  fullName: "Dr. Louvino Larosa",
  professionalTitle: "Developmental Pediatrician",
  city: "Cebu City",
  country: "Philippines",
  phone: "0915 887 2911",
  email: "larosalou@gmail.com",
  specialty: "Psychiatrist",
  licenseNumber: "PRC-0074921",
  licenseExpiry: "December 18, 2028",
  affiliatedCenter: "Abled Minds Therapy Center",
  yearsOfExperience: 9,
  languages: ["English", "Filipino", "Cebuano"],
  consultationDays: "Monday to Friday",
  consultationHours: "9:00 AM – 5:00 PM",
  consultationMode: "Hybrid",
  status: "active",
  biography:
    "Dr. Louvino Larosa supports children and families through developmental assessment, coordinated intervention planning, and collaborative progress monitoring. He works closely with therapists, caregivers, and centers to help each learner receive consistent and individualized care.",
  profileImage:
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=85",
  coverImage:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=85",
};

/* =========================================================
   ICONS
========================================================= */

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  );
}

function EditIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14 5 5 5M4 20l4.5-1 10-10a2 2 0 0 0-4-4l-10 10L4 20Z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6l12 12M18 6 6 18"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4h3l2 5-2 1.5a15 15 0 0 0 5.5 5.5L15 14l5 2v3c0 1.1-.9 2-2 2C9.7 21 3 14.3 3 6c0-1.1.9-2 2-2Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7 8 6 8-6"
      />
    </svg>
  );
}

function SpecialtyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3v5a4 4 0 0 0 8 0V3"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16v1a4 4 0 0 0 8 0v-2"
      />
      <circle cx="20" cy="12" r="2" />
    </svg>
  );
}

function LicenseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 8h8M8 12h5M8 16h4"
      />
    </svg>
  );
}

function CenterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 21V8l8-4 8 4v13"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 21v-7h8v7M8 10h.01M12 10h.01M16 10h.01"
      />
    </svg>
  );
}

function ExperienceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V4h8v3M3 12h18"
      />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3v4M16 3v4M3 10h18"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7v5l3 2"
      />
    </svg>
  );
}

function ConsultationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5h16v11H8l-4 4V5Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 9h8M8 12h5"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h4l2-3h4l2 3h4v13H4V7Z"
      />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4 10-10"
      />
    </svg>
  );
}

/* =========================================================
   SMALL REUSABLE COMPONENTS
========================================================= */

interface InformationCardProps {
  label: string;
  value: string;
  icon: ReactNode;
}

function InformationCard({
  label,
  value,
  icon,
}: InformationCardProps) {
  return (
    <article className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[#74517b]">{icon}</span>
        <p className="text-sm font-bold text-[#211c23]">{label}</p>
      </div>

      <div className="flex min-h-12 items-center rounded-xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_3px_7px_rgba(69,47,72,0.16)]">
        <p className="min-w-0 flex-1 truncate text-sm text-[#3f3741]">
          {value}
        </p>
      </div>
    </article>
  );
}

interface DetailRowProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}

function DetailRow({
  label,
  value,
  icon,
}: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#faf6fb] px-4 py-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#7f5b85] shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.07em] text-slate-400">
          {label}
        </p>
        <div className="mt-1 text-sm font-semibold leading-5 text-[#3a323d]">
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#28212a]">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

type CropImageType = "profile" | "cover";

interface CropState {
  imageType: CropImageType;
  sourceUrl: string;
  zoom: number;
  positionX: number;
  positionY: number;
}

async function createCroppedImage(
  crop: CropState,
): Promise<string> {
  const image = new Image();
  image.src = crop.sourceUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load the selected image."));
  });

  const outputWidth = crop.imageType === "profile" ? 900 : 1800;
  const outputHeight = crop.imageType === "profile" ? 900 : 650;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const baseScale = Math.max(
    outputWidth / image.naturalWidth,
    outputHeight / image.naturalHeight,
  );
  const scale = baseScale * crop.zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = (outputWidth - drawWidth) * (crop.positionX / 100);
  const drawY = (outputHeight - drawHeight) * (crop.positionY / 100);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  return canvas.toDataURL("image/jpeg", 0.9);
}

/* =========================================================
   MAIN SCREEN
========================================================= */

function DocProfileScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [profile, setProfile] = useState<DoctorProfile>(
    INITIAL_DOCTOR_PROFILE,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [confirmationAction, setConfirmationAction] =
    useState<"save" | "discard" | null>(null);
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropError, setCropError] = useState("");

  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const editableProfile = useMemo<EditableDoctorProfile>(
    () => ({
      fullName: profile.fullName,
      professionalTitle: profile.professionalTitle,
      city: profile.city,
      country: profile.country,
      phone: profile.phone,
      email: profile.email,
      specialty: profile.specialty,
      licenseNumber: profile.licenseNumber,
      licenseExpiry: profile.licenseExpiry,
      affiliatedCenter: profile.affiliatedCenter,
      yearsOfExperience: String(profile.yearsOfExperience),
      languages: profile.languages.join(", "),
      consultationDays: profile.consultationDays,
      consultationHours: profile.consultationHours,
      consultationMode: profile.consultationMode,
      biography: profile.biography,
    }),
    [profile],
  );

  const [draftProfile, setDraftProfile] =
    useState<EditableDoctorProfile>(editableProfile);

  const locationLabel = `${profile.city}, ${profile.country}`;

  const openEditModal = () => {
    setDraftProfile({
      fullName: profile.fullName,
      professionalTitle: profile.professionalTitle,
      city: profile.city,
      country: profile.country,
      phone: profile.phone,
      email: profile.email,
      specialty: profile.specialty,
      licenseNumber: profile.licenseNumber,
      licenseExpiry: profile.licenseExpiry,
      affiliatedCenter: profile.affiliatedCenter,
      yearsOfExperience: String(profile.yearsOfExperience),
      languages: profile.languages.join(", "),
      consultationDays: profile.consultationDays,
      consultationHours: profile.consultationHours,
      consultationMode: profile.consultationMode,
      biography: profile.biography,
    });

    setSaveMessage("");
    setIsEditOpen(true);
  };

  const requestCloseEditModal = () => {
    setConfirmationAction("discard");
  };

  const closeEditModalImmediately = () => {
    setIsEditOpen(false);
    setSaveMessage("");
    setConfirmationAction(null);
  };

  const handleDraftChange = (
    field: keyof EditableDoctorProfile,
    value: string,
  ) => {
    setDraftProfile((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const handleSaveProfile = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setConfirmationAction("save");
  };

  const commitProfileSave = () => {
    const languages = draftProfile.languages
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);

    setProfile((currentProfile) => ({
      ...currentProfile,
      fullName: draftProfile.fullName.trim(),
      professionalTitle: draftProfile.professionalTitle.trim(),
      city: draftProfile.city.trim(),
      country: draftProfile.country.trim(),
      phone: draftProfile.phone.trim(),
      email: draftProfile.email.trim(),
      specialty: draftProfile.specialty.trim(),
      licenseNumber: draftProfile.licenseNumber.trim(),
      licenseExpiry: draftProfile.licenseExpiry.trim(),
      affiliatedCenter: draftProfile.affiliatedCenter.trim(),
      yearsOfExperience: Number(draftProfile.yearsOfExperience) || 0,
      languages,
      consultationDays: draftProfile.consultationDays.trim(),
      consultationHours: draftProfile.consultationHours.trim(),
      consultationMode: draftProfile.consultationMode,
      biography: draftProfile.biography.trim(),
    }));

    setConfirmationAction(null);
    setSaveMessage("Profile updated successfully.");

    window.setTimeout(() => {
      setIsEditOpen(false);
      setSaveMessage("");
    }, 650);

    /*
      Later backend call:
      PATCH /doctor/profile
      body: updated doctor profile fields
    */
  };

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
    imageType: CropImageType,
  ) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setCropError("Please choose a valid image file.");
      return;
    }

    const sourceUrl = URL.createObjectURL(selectedFile);
    setCropError("");
    setCropState({
      imageType,
      sourceUrl,
      zoom: 1,
      positionX: 50,
      positionY: 50,
    });
  };

  const closeCropModal = () => {
    if (cropState) {
      URL.revokeObjectURL(cropState.sourceUrl);
    }

    setCropState(null);
    setCropError("");
    setIsCropping(false);
  };

  const saveCroppedImage = async () => {
    if (!cropState) return;

    setIsCropping(true);
    setCropError("");

    try {
      const croppedImage = await createCroppedImage(cropState);

      setProfile((currentProfile) => ({
        ...currentProfile,
        [cropState.imageType === "profile"
          ? "profileImage"
          : "coverImage"]: croppedImage,
      }));

      /*
        Later backend flow:
        1. Convert the cropped data URL to a Blob/File.
        2. Upload it to Supabase Storage.
        3. Save the returned public URL in the doctor profile row.
      */

      closeCropModal();
    } catch (error) {
      console.error("Unable to crop image:", error);
      setCropError("The image could not be cropped. Please try another file.");
      setIsCropping(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-professional">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          />

          <DocSidebar setSidebarOpen={setSidebarOpen} />
        </>
      )}

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-xl border border-[#e5deeb] bg-white text-slate-600 shadow-md transition hover:bg-[#f3eef9] hover:text-[#8257bd] lg:flex"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <MenuIcon />
        </button>
      )}

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarOpen ? "lg:pl-[280px]" : "lg:pl-0"
        }`}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e7dce8] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-[#f4e9f5]"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#201c23]">
              My Profile
            </p>
            <p className="truncate text-xs text-slate-500">
              Professional and account details
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 lg:px-7 lg:py-5 xl:px-9">
          <section className="min-h-[calc(100vh-40px)] overflow-hidden rounded-[30px] bg-[#ead8ec] shadow-[0_12px_36px_rgba(75,43,78,0.08)]">
            {/* Cover section */}
            <div className="relative h-[220px] overflow-hidden border-b border-[#ceb8d0] sm:h-[250px]">
              {profile.coverImage ? (
                <img
                  src={profile.coverImage}
                  alt="Doctor profile cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-[#b8999e] via-[#ead7dc] to-[#cec3d3]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-[#a9858e]/30 via-white/25 to-[#b6aabd]/25" />

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl border border-white/75 bg-white/75 px-4 py-2 text-sm font-semibold text-[#4a3e4d] shadow-sm backdrop-blur transition hover:bg-white"
              >
                <CameraIcon />
                Change cover
              </button>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  handleImageUpload(event, "cover")
                }
              />
            </div>

            {/* Identity section */}
            <div className="relative px-5 pb-6 sm:px-7 lg:px-9">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="-mt-20 shrink-0">
                    <div className="relative rounded-2xl border-[7px] border-white bg-white shadow-[0_4px_10px_rgba(61,43,63,0.26)]">
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={profile.fullName}
                          className="h-[145px] w-[135px] rounded-xl object-cover sm:h-[160px] sm:w-[150px]"
                        />
                      ) : (
                        <div className="flex h-[145px] w-[135px] items-center justify-center rounded-xl bg-[#f4eef5] text-4xl font-bold text-[#835b89] sm:h-[160px] sm:w-[150px]">
                          {profile.fullName
                            .split(" ")
                            .filter(Boolean)
                            .slice(-2)
                            .map((name) => name.charAt(0))
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          profileInputRef.current?.click()
                        }
                        className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-[#5c4a60] shadow transition hover:bg-white"
                        aria-label="Change profile photo"
                      >
                        <CameraIcon />
                      </button>
                    </div>

                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        handleImageUpload(event, "profile")
                      }
                    />
                  </div>

                  <div className="pb-1 sm:pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold text-[#201b22] sm:text-3xl">
                        {profile.fullName}
                      </h1>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          profile.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            profile.status === "active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {profile.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-[#74517b]">
                      {profile.professionalTitle}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                      <LocationIcon />
                      <span>{locationLabel}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#76507e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#65416d] xl:self-end"
                >
                  <EditIcon />
                  Edit profile
                </button>
              </div>
            </div>

            {/* Main profile content */}
            <div className="px-5 pb-8 sm:px-7 lg:px-9">
              {/* Primary contact cards */}
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InformationCard
                  label="Contact number"
                  value={profile.phone}
                  icon={<PhoneIcon />}
                />

                <InformationCard
                  label="Email address"
                  value={profile.email}
                  icon={<MailIcon />}
                />

                <InformationCard
                  label="Specialty"
                  value={profile.specialty}
                  icon={<SpecialtyIcon />}
                />
              </section>

              {/* Added information to avoid the empty lower area */}
              <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                {/* Professional details */}
                <article className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_6px_18px_rgba(66,44,68,0.09)] sm:p-6">
                  <SectionHeading
                    title="Professional Information"
                    description="Credentials and professional details visible to the care team."
                  />

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailRow
                      label="PRC license number"
                      value={profile.licenseNumber}
                      icon={<LicenseIcon />}
                    />

                    <DetailRow
                      label="License valid until"
                      value={profile.licenseExpiry}
                      icon={<CalendarIcon />}
                    />

                    <DetailRow
                      label="Affiliated center"
                      value={profile.affiliatedCenter}
                      icon={<CenterIcon />}
                    />

                    <DetailRow
                      label="Years of experience"
                      value={`${profile.yearsOfExperience} years`}
                      icon={<ExperienceIcon />}
                    />

                    <div className="sm:col-span-2">
                      <DetailRow
                        label="Languages spoken"
                        value={
                          <div className="flex flex-wrap gap-2">
                            {profile.languages.map((language) => (
                              <span
                                key={language}
                                className="rounded-full bg-[#eee2f0] px-2.5 py-1 text-xs font-semibold text-[#694a70]"
                              >
                                {language}
                              </span>
                            ))}
                          </div>
                        }
                        icon={<LanguageIcon />}
                      />
                    </div>
                  </div>
                </article>

                {/* Availability */}
                <article className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_6px_18px_rgba(66,44,68,0.09)] sm:p-6">
                  <SectionHeading
                    title="Consultation & Availability"
                    description="When and how the doctor is available for consultations."
                  />

                  <div className="mt-5 space-y-3">
                    <DetailRow
                      label="Available days"
                      value={profile.consultationDays}
                      icon={<CalendarIcon />}
                    />

                    <DetailRow
                      label="Consultation hours"
                      value={profile.consultationHours}
                      icon={<ClockIcon />}
                    />

                    <DetailRow
                      label="Consultation mode"
                      value={profile.consultationMode}
                      icon={<ConsultationIcon />}
                    />
                  </div>
                </article>
              </section>

              {/* About section */}
              <section className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_6px_18px_rgba(66,44,68,0.09)] sm:p-6">
                <SectionHeading
                  title="About the Doctor"
                  description="A professional overview shown to the assigned center, therapists, and caregivers."
                />

                <p className="mt-5 max-w-5xl text-sm leading-7 text-[#514753]">
                  {profile.biography}
                </p>
              </section>
            </div>
          </section>
        </div>
      </main>

      {/* Responsive image crop modal */}
      {cropState && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-slate-950/60 p-2 backdrop-blur-[3px] sm:p-4">
          <div className="flex h-[calc(100dvh-1rem)] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#eadfeb] px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <p className="font-accent text-xs font-semibold text-[#8257bd] sm:text-sm">
                  Adjust image
                </p>
                <h2 className="mt-0.5 truncate text-lg font-bold text-[#241f26] sm:text-xl">
                  Crop {cropState.imageType === "profile" ? "profile photo" : "cover photo"}
                </h2>
                <p className="mt-1 hidden text-sm leading-5 text-slate-500 sm:block">
                  Adjust the zoom and position until the important part of the image is visible.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCropModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#f4ebf5] hover:text-[#7a4b80]"
                aria-label="Close image cropper"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_270px] lg:overflow-hidden">
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl bg-[#1f1922] p-3 sm:min-h-[320px] sm:p-4 lg:min-h-0">
                <div
                  className={`relative overflow-hidden bg-black ${
                    cropState.imageType === "profile"
                      ? "rounded-full"
                      : "aspect-[18/6.5] w-full max-w-[680px] rounded-2xl"
                  }`}
                  style={
                    cropState.imageType === "profile"
                      ? {
                          width:
                            "min(360px, 42dvh, calc(100vw - 3rem))",
                          aspectRatio: "1 / 1",
                        }
                      : undefined
                  }
                >
                  <img
                    src={cropState.sourceUrl}
                    alt="Crop preview"
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `${cropState.positionX}% ${cropState.positionY}%`,
                      transform: `scale(${cropState.zoom})`,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 border-2 border-white/75" />
                </div>
              </div>

              <div className="flex flex-col rounded-2xl border border-[#eadfeb] bg-[#fcf9fc] p-4 sm:p-5 lg:min-h-0 lg:overflow-y-auto">
                <div>
                  <h3 className="text-sm font-bold text-[#302832]">
                    Image position
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Use the controls below to choose which part of the image will be shown.
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="flex items-center justify-between text-sm font-bold text-[#302832]">
                      Zoom
                      <span className="font-normal text-slate-400">
                        {cropState.zoom.toFixed(1)}×
                      </span>
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={cropState.zoom}
                      onChange={(event) =>
                        setCropState((current) =>
                          current
                            ? {
                                ...current,
                                zoom: Number(event.target.value),
                              }
                            : current,
                        )
                      }
                      className="mt-2 w-full accent-[#76507e]"
                    />
                  </label>

                  <label className="block">
                    <span className="flex items-center justify-between text-sm font-bold text-[#302832]">
                      Horizontal
                      <span className="font-normal text-slate-400">
                        {cropState.positionX}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cropState.positionX}
                      onChange={(event) =>
                        setCropState((current) =>
                          current
                            ? {
                                ...current,
                                positionX: Number(event.target.value),
                              }
                            : current,
                        )
                      }
                      className="mt-2 w-full accent-[#76507e]"
                    />
                  </label>

                  <label className="block">
                    <span className="flex items-center justify-between text-sm font-bold text-[#302832]">
                      Vertical
                      <span className="font-normal text-slate-400">
                        {cropState.positionY}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cropState.positionY}
                      onChange={(event) =>
                        setCropState((current) =>
                          current
                            ? {
                                ...current,
                                positionY: Number(event.target.value),
                              }
                            : current,
                        )
                      }
                      className="mt-2 w-full accent-[#76507e]"
                    />
                  </label>
                </div>

                {cropError && (
                  <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
                    {cropError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#eadfeb] bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={closeCropModal}
                className="rounded-xl border border-[#ddd0df] px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-[#f7f1f7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveCroppedImage()}
                disabled={isCropping}
                className="rounded-xl bg-[#76507e] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#65416d] disabled:cursor-wait disabled:opacity-60"
              >
                {isCropping ? "Saving crop..." : "Use this crop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-3 py-5 backdrop-blur-[2px] sm:px-5">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eadfeb] px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-xl font-bold text-[#241f26] sm:text-2xl">
                  Edit Doctor Profile
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Update professional information, contact details,
                  availability, and biography.
                </p>
              </div>

              <button
                type="button"
                onClick={requestCloseEditModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#f4ebf5] hover:text-[#7a4b80]"
                aria-label="Close profile editor"
              >
                <CloseIcon />
              </button>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="grid grid-cols-1 gap-5 px-5 py-6 sm:px-7 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Full name
                  </span>

                  <input
                    type="text"
                    value={draftProfile.fullName}
                    onChange={(event) =>
                      handleDraftChange(
                        "fullName",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Professional title
                  </span>

                  <input
                    type="text"
                    value={draftProfile.professionalTitle}
                    onChange={(event) =>
                      handleDraftChange(
                        "professionalTitle",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    City
                  </span>

                  <input
                    type="text"
                    value={draftProfile.city}
                    onChange={(event) =>
                      handleDraftChange(
                        "city",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Country
                  </span>

                  <input
                    type="text"
                    value={draftProfile.country}
                    onChange={(event) =>
                      handleDraftChange(
                        "country",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Contact number
                  </span>

                  <input
                    type="tel"
                    value={draftProfile.phone}
                    onChange={(event) =>
                      handleDraftChange(
                        "phone",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Email address
                  </span>

                  <input
                    type="email"
                    value={draftProfile.email}
                    onChange={(event) =>
                      handleDraftChange(
                        "email",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Specialty
                  </span>

                  <input
                    type="text"
                    value={draftProfile.specialty}
                    onChange={(event) =>
                      handleDraftChange(
                        "specialty",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    PRC license number
                  </span>

                  <input
                    type="text"
                    value={draftProfile.licenseNumber}
                    onChange={(event) =>
                      handleDraftChange(
                        "licenseNumber",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    License expiry
                  </span>

                  <input
                    type="text"
                    value={draftProfile.licenseExpiry}
                    onChange={(event) =>
                      handleDraftChange(
                        "licenseExpiry",
                        event.target.value,
                      )
                    }
                    placeholder="December 18, 2028"
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Affiliated center
                  </span>

                  <input
                    type="text"
                    value={draftProfile.affiliatedCenter}
                    onChange={(event) =>
                      handleDraftChange(
                        "affiliatedCenter",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Years of experience
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={draftProfile.yearsOfExperience}
                    onChange={(event) =>
                      handleDraftChange(
                        "yearsOfExperience",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-[#302832]">
                    Languages spoken
                  </span>

                  <input
                    type="text"
                    value={draftProfile.languages}
                    onChange={(event) =>
                      handleDraftChange(
                        "languages",
                        event.target.value,
                      )
                    }
                    placeholder="English, Filipino, Cebuano"
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />

                  <span className="mt-1 block text-xs text-slate-400">
                    Separate each language with a comma.
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Available days
                  </span>

                  <input
                    type="text"
                    value={draftProfile.consultationDays}
                    onChange={(event) =>
                      handleDraftChange(
                        "consultationDays",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Consultation hours
                  </span>

                  <input
                    type="text"
                    value={draftProfile.consultationHours}
                    onChange={(event) =>
                      handleDraftChange(
                        "consultationHours",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Consultation mode
                  </span>

                  <select
                    value={draftProfile.consultationMode}
                    onChange={(event) =>
                      handleDraftChange(
                        "consultationMode",
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  >
                    <option value="In-person">
                      In-person
                    </option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-[#302832]">
                    About the doctor
                  </span>

                  <textarea
                    value={draftProfile.biography}
                    onChange={(event) =>
                      handleDraftChange(
                        "biography",
                        event.target.value,
                      )
                    }
                    rows={6}
                    className="mt-2 w-full resize-none rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                  />
                </label>
              </div>

              <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-3 border-t border-[#eadfeb] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  {saveMessage && (
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <CheckIcon />
                      {saveMessage}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={requestCloseEditModal}
                    className="rounded-xl border border-[#ddd0df] px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-[#f7f1f7]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#76507e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#65416d]"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmationAction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-[3px]">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="px-6 py-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                confirmationAction === "save"
                  ? "bg-[#f0e7f2] text-[#76507e]"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {confirmationAction === "save" ? <CheckIcon /> : <CloseIcon />}
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#241f26]">
                {confirmationAction === "save"
                  ? "Save profile changes?"
                  : "Exit without saving?"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {confirmationAction === "save"
                  ? "Please confirm that the updated professional and contact details are correct."
                  : "Any changes made in the profile editor will be discarded."}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#eadfeb] px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmationAction(null)}
                className="rounded-xl border border-[#ddd0df] px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-[#f7f1f7]"
              >
                {confirmationAction === "save" ? "Review again" : "Continue editing"}
              </button>

              <button
                type="button"
                onClick={
                  confirmationAction === "save"
                    ? commitProfileSave
                    : closeEditModalImmediately
                }
                className={`rounded-xl px-5 py-3 text-sm font-bold text-white transition ${
                  confirmationAction === "save"
                    ? "bg-[#76507e] hover:bg-[#65416d]"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {confirmationAction === "save" ? "Yes, save changes" : "Discard and exit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocProfileScreen;
