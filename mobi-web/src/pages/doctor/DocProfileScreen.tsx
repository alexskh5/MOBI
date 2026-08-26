import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  Edit3,
  Globe2,
  ImageIcon,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  Phone,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import DocSidebar from "../../components/doctor/DocSidebar";

/* =========================================================
   TYPES
   Static for now, but already structured for future APIs.
========================================================= */

type DoctorStatus = "active" | "inactive";
type ConsultationMode = "In-person" | "Online" | "Hybrid";
type CropImageType = "profile" | "cover";

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

interface CropState {
  imageType: CropImageType;
  sourceUrl: string;
  fileName: string;
  zoom: number;
  positionX: number;
  positionY: number;
}

type ImageFeedback =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

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

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/* =========================================================
   REUSABLE DISPLAY COMPONENTS
========================================================= */

function ProfileInitials({ fullName }: { fullName: string }) {
  const initials = fullName
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <span aria-label={`${fullName} initials`}>
      {initials || "DR"}
    </span>
  );
}

function StatusBadge({ status }: { status: DoctorStatus }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-full px-2.5 text-[10px] font-semibold ${
        active
          ? "bg-[#edf7f0] text-[#4f9467]"
          : "bg-[#f2f2f4] text-[#777781]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#4f9467]" : "bg-[#9a9aa3]"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

interface ContactItemProps {
  label: string;
  value: string;
  icon: ReactNode;
}

function ContactItem({
  label,
  value,
  icon,
}: ContactItemProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-[12px] border border-[#e8e8ed] bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f3eff8] text-[#7456a3]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#9898a3]">
          {label}
        </p>

        <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-[#303038]">
          {value}
        </p>
      </div>
    </div>
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
    <div className="flex items-start gap-3 rounded-[10px] border border-[#eeeef2] bg-[#fafafd] px-3.5 py-3.5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white text-[#7456a3]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9898a3]">
          {label}
        </p>

        <div className="mt-1 text-[13px] font-medium leading-5 text-[#3f3f48]">
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      {eyebrow && (
        <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
          {eyebrow}
        </span>
      )}

      <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-[#202027]">
        {title}
      </h2>

      <p className="mt-1.5 text-[12px] leading-5 text-[#757580]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   IMAGE CROPPING
========================================================= */

async function createCroppedImage(
  crop: CropState,
): Promise<string> {
  const image = new Image();
  image.src = crop.sourceUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error("Unable to load the selected image."));
  });

  const outputWidth =
    crop.imageType === "profile" ? 800 : 1600;
  const outputHeight =
    crop.imageType === "profile" ? 800 : 480;

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

  const overflowX = Math.max(drawWidth - outputWidth, 0);
  const overflowY = Math.max(drawHeight - outputHeight, 0);

  const drawX = -(overflowX * (crop.positionX / 100));
  const drawY = -(overflowY * (crop.positionY / 100));

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}

/* =========================================================
   MAIN SCREEN
========================================================= */

function DocProfileScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth >= 1024,
  );

  const [profile, setProfile] =
    useState<DoctorProfile>(INITIAL_DOCTOR_PROFILE);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [confirmationAction, setConfirmationAction] =
    useState<"save" | "discard" | null>(null);

  const [cropState, setCropState] =
    useState<CropState | null>(null);

  const [isCropping, setIsCropping] = useState(false);
  const [cropError, setCropError] = useState("");
  const [imageFeedback, setImageFeedback] =
    useState<ImageFeedback>(null);

  const profileInputRef =
    useRef<HTMLInputElement | null>(null);

  const coverInputRef =
    useRef<HTMLInputElement | null>(null);

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
      yearsOfExperience: String(
        profile.yearsOfExperience,
      ),
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

  const locationLabel =
    `${profile.city}, ${profile.country}`;

  const showImageFeedback = (
    type: "success" | "error",
    message: string,
  ) => {
    setImageFeedback({ type, message });

    window.setTimeout(() => {
      setImageFeedback(null);
    }, 3000);
  };

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
      yearsOfExperience: String(
        profile.yearsOfExperience,
      ),
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
      professionalTitle:
        draftProfile.professionalTitle.trim(),
      city: draftProfile.city.trim(),
      country: draftProfile.country.trim(),
      phone: draftProfile.phone.trim(),
      email: draftProfile.email.trim(),
      specialty: draftProfile.specialty.trim(),
      licenseNumber:
        draftProfile.licenseNumber.trim(),
      licenseExpiry:
        draftProfile.licenseExpiry.trim(),
      affiliatedCenter:
        draftProfile.affiliatedCenter.trim(),
      yearsOfExperience:
        Number(draftProfile.yearsOfExperience) || 0,
      languages,
      consultationDays:
        draftProfile.consultationDays.trim(),
      consultationHours:
        draftProfile.consultationHours.trim(),
      consultationMode:
        draftProfile.consultationMode,
      biography: draftProfile.biography.trim(),
    }));

    setConfirmationAction(null);
    setSaveMessage("Profile updated successfully.");

    window.setTimeout(() => {
      setIsEditOpen(false);
      setSaveMessage("");
    }, 700);

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

    if (
      !ALLOWED_IMAGE_TYPES.includes(selectedFile.type)
    ) {
      showImageFeedback(
        "error",
        "Please upload a JPG, PNG, or WebP image.",
      );
      return;
    }

    if (selectedFile.size > MAX_IMAGE_BYTES) {
      showImageFeedback(
        "error",
        "The selected image is larger than 8 MB.",
      );
      return;
    }

    const sourceUrl =
      URL.createObjectURL(selectedFile);

    setCropError("");
    setCropState({
      imageType,
      sourceUrl,
      fileName: selectedFile.name,
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

  const resetCrop = () => {
    setCropState((current) =>
      current
        ? {
            ...current,
            zoom: 1,
            positionX: 50,
            positionY: 50,
          }
        : current,
    );
  };

  const saveCroppedImage = async () => {
    if (!cropState) return;

    const imageType = cropState.imageType;

    setIsCropping(true);
    setCropError("");

    try {
      const croppedImage =
        await createCroppedImage(cropState);

      setProfile((currentProfile) => ({
        ...currentProfile,
        [imageType === "profile"
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

      showImageFeedback(
        "success",
        imageType === "profile"
          ? "Profile photo updated."
          : "Profile banner updated.",
      );
    } catch (error) {
      console.error(
        "Unable to crop image:",
        error,
      );

      setCropError(
        "The image could not be processed. Please try another file.",
      );

      setIsCropping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] font-professional text-[#202027]">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          />

          <DocSidebar
            setSidebarOpen={setSidebarOpen}
          />
        </>
      )}

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-[10px] border border-[#e8e8ed] bg-white text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3] lg:flex"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu size={19} />
        </button>
      )}

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarOpen
            ? "lg:pl-[280px]"
            : "lg:pl-0"
        }`}
      >
        {/* MOBILE HEADER */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e8e8ed] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-[#202027]">
              My Profile
            </p>

            <p className="truncate text-[11px] text-[#9898a3]">
              Professional information
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-[42px] lg:py-[35px]">
          {/* PAGE HEADER */}
          <section className="mb-[30px]">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
              Doctor Workspace
            </span>

            <h1 className="text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-[#202027]">
              My Profile
            </h1>

            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.65] text-[#757580]">
              Manage your professional details and
              profile information shown within MOBI.
            </p>
          </section>

          {/* PROFILE HEADER */}
          <section className="overflow-hidden rounded-[14px] border border-[#e8e8ed] bg-white">
            {/* SUBTLE BANNER */}
            <div className="relative h-[118px] overflow-hidden bg-[#eee8f3] sm:h-[132px]">
              {profile.coverImage ? (
                <img
                  src={profile.coverImage}
                  alt="Doctor profile banner"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-[#eee8f3] via-[#f7f4fa] to-[#e9edf2]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-[#5f4588]/15 via-white/25 to-white/15" />

              <button
                type="button"
                onClick={() =>
                  coverInputRef.current?.click()
                }
                className="absolute right-4 top-4 inline-flex min-h-[36px] items-center gap-2 rounded-[8px] border border-white/80 bg-white/90 px-3 text-[11px] font-semibold text-[#555560] backdrop-blur transition hover:bg-white hover:text-[#7456a3]"
              >
                <ImageIcon size={15} />
                Change Banner
              </button>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                  handleImageUpload(
                    event,
                    "cover",
                  )
                }
              />
            </div>

            {/* IDENTITY */}
            <div className="px-5 pb-6 sm:px-6 lg:px-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                  {/* PROFESSIONAL PORTRAIT */}
                  <div className="-mt-14 shrink-0">
                    <div className="relative">
                      <div className="flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-[#f3eff8] text-3xl font-bold text-[#7456a3] shadow-[0_4px_14px_rgba(31,25,39,0.12)] sm:h-[126px] sm:w-[126px]">
                        {profile.profileImage ? (
                          <img
                            src={profile.profileImage}
                            alt={profile.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ProfileInitials
                            fullName={
                              profile.fullName
                            }
                          />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          profileInputRef.current?.click()
                        }
                        className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#7456a3] text-white shadow-sm transition hover:bg-[#5f4588]"
                        aria-label={
                          profile.profileImage
                            ? "Change profile photo"
                            : "Upload profile photo"
                        }
                        title={
                          profile.profileImage
                            ? "Change profile photo"
                            : "Upload profile photo"
                        }
                      >
                        <Camera size={15} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        profileInputRef.current?.click()
                      }
                      className="mt-2.5 inline-flex w-[126px] items-center justify-center gap-1.5 text-[11px] font-semibold text-[#7456a3] transition hover:text-[#5f4588]"
                    >
                      <Camera size={13} />
                      {profile.profileImage
                        ? "Change photo"
                        : "Upload photo"}
                    </button>

                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) =>
                        handleImageUpload(
                          event,
                          "profile",
                        )
                      }
                    />
                  </div>

                  <div className="min-w-0 pb-1 sm:pb-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="truncate text-[24px] font-bold tracking-[-0.02em] text-[#202027] sm:text-[27px]">
                        {profile.fullName}
                      </h2>

                      <StatusBadge
                        status={profile.status}
                      />
                    </div>

                    <p className="mt-1.5 text-[14px] font-semibold text-[#7456a3]">
                      {profile.professionalTitle}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#757580]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {locationLabel}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={14} />
                        {profile.affiliatedCenter}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 self-start rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588] sm:self-end"
                >
                  <Edit3 size={15} />
                  Edit Profile
                </button>
              </div>

              <div className="mt-4 rounded-[9px] border border-[#eeeef2] bg-[#fafafd] px-3.5 py-3">
                <p className="text-[11px] leading-5 text-[#757580]">
                  <strong className="font-semibold text-[#555560]">
                    Profile photo:
                  </strong>{" "}
                  Use a clear, front-facing professional
                  portrait. JPG, PNG, or WebP up to 8 MB.
                  You can crop and reposition the photo
                  before saving it.
                </p>
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <section className="mt-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ContactItem
                label="Contact Number"
                value={profile.phone}
                icon={<Phone size={18} />}
              />

              <ContactItem
                label="Email Address"
                value={profile.email}
                icon={<Mail size={18} />}
              />

              <ContactItem
                label="Specialty"
                value={profile.specialty}
                icon={<Stethoscope size={18} />}
              />
            </div>
          </section>

          {/* PROFESSIONAL + AVAILABILITY */}
          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.12fr_0.88fr]">
            <article className="rounded-[14px] border border-[#e8e8ed] bg-white p-5 sm:p-6">
              <SectionHeading
                eyebrow="Credentials"
                title="Professional Information"
                description="Professional details available to the assigned care team."
              />

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow
                  label="PRC License Number"
                  value={profile.licenseNumber}
                  icon={<ShieldCheck size={17} />}
                />

                <DetailRow
                  label="License Valid Until"
                  value={profile.licenseExpiry}
                  icon={<CalendarDays size={17} />}
                />

                <DetailRow
                  label="Affiliated Center"
                  value={profile.affiliatedCenter}
                  icon={<Building2 size={17} />}
                />

                <DetailRow
                  label="Years of Experience"
                  value={`${profile.yearsOfExperience} years`}
                  icon={
                    <BriefcaseBusiness size={17} />
                  }
                />

                <div className="sm:col-span-2">
                  <DetailRow
                    label="Languages Spoken"
                    value={
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map(
                          (language) => (
                            <span
                              key={language}
                              className="rounded-full bg-[#f3eff8] px-2.5 py-1 text-[10px] font-semibold text-[#7456a3]"
                            >
                              {language}
                            </span>
                          ),
                        )}
                      </div>
                    }
                    icon={<Globe2 size={17} />}
                  />
                </div>
              </div>
            </article>

            <article className="rounded-[14px] border border-[#e8e8ed] bg-white p-5 sm:p-6">
              <SectionHeading
                eyebrow="Schedule"
                title="Consultation & Availability"
                description="Your current availability information."
              />

              <div className="mt-5 space-y-3">
                <DetailRow
                  label="Available Days"
                  value={profile.consultationDays}
                  icon={<CalendarDays size={17} />}
                />

                <DetailRow
                  label="Consultation Hours"
                  value={profile.consultationHours}
                  icon={<Clock3 size={17} />}
                />

                <DetailRow
                  label="Consultation Mode"
                  value={profile.consultationMode}
                  icon={
                    <MessageSquareText size={17} />
                  }
                />
              </div>
            </article>
          </section>

          {/* ABOUT */}
          <section className="mt-5 rounded-[14px] border border-[#e8e8ed] bg-white p-5 sm:p-6">
            <SectionHeading
              eyebrow="Professional Summary"
              title="About the Doctor"
              description="A short professional introduction visible within MOBI."
            />

            <p className="mt-4 max-w-5xl text-[13px] leading-7 text-[#555560]">
              {profile.biography}
            </p>
          </section>
        </div>
      </main>

      {/* IMAGE FEEDBACK */}
      {imageFeedback && (
        <div
          className={`fixed right-4 top-4 z-[120] flex max-w-sm items-center gap-2 rounded-[10px] border bg-white px-4 py-3 text-[12px] font-semibold shadow-[0_14px_36px_rgba(31,25,39,0.14)] ${
            imageFeedback.type === "success"
              ? "border-[#cfe4d6] text-[#4f9467]"
              : "border-[#edcece] text-[#a75555]"
          }`}
          role="status"
        >
          {imageFeedback.type === "success" ? (
            <Check size={15} />
          ) : (
            <X size={15} />
          )}

          {imageFeedback.message}
        </div>
      )}

      {/* IMAGE CROP MODAL */}
      {cropState && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[3px] sm:p-5"
          onClick={closeCropModal}
          role="presentation"
        >
          <div
            className="flex max-h-[94vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[16px] border border-white/60 bg-white shadow-[0_24px_70px_rgba(20,16,25,0.24)]"
            role="dialog"
            aria-modal="true"
            aria-label={
              cropState.imageType === "profile"
                ? "Adjust profile photo"
                : "Adjust profile banner"
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eeeef2] px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
                  Image Editor
                </span>

                <h2 className="text-[20px] font-semibold text-[#202027]">
                  {cropState.imageType === "profile"
                    ? "Adjust Profile Photo"
                    : "Adjust Profile Banner"}
                </h2>

                <p className="mt-1.5 text-[12px] leading-5 text-[#757580]">
                  {cropState.imageType === "profile"
                    ? "Center your face inside the circular preview. This is how your professional photo will appear."
                    : "Position the image so the important area remains visible across different screen sizes."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCropModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f6f6f8] text-[#71717a] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
                aria-label="Close image editor"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_280px] lg:overflow-hidden">
              {/* PREVIEW */}
              <div className="flex min-h-[330px] items-center justify-center bg-[#242129] p-5 sm:min-h-[400px]">
                <div
                  className={`relative overflow-hidden bg-black ${
                    cropState.imageType === "profile"
                      ? "aspect-square w-full max-w-[360px] rounded-full"
                      : "aspect-[10/3] w-full max-w-[620px] rounded-[12px]"
                  }`}
                >
                  <img
                    src={cropState.sourceUrl}
                    alt="Selected image crop preview"
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `${cropState.positionX}% ${cropState.positionY}%`,
                      transform: `scale(${cropState.zoom})`,
                    }}
                  />

                  <div
                    className={`pointer-events-none absolute inset-0 ${
                      cropState.imageType === "profile"
                        ? "rounded-full border-2 border-white/80"
                        : "rounded-[12px] border-2 border-white/70"
                    }`}
                  />

                  {cropState.imageType === "profile" && (
                    <div className="pointer-events-none absolute inset-[12%] rounded-full border border-dashed border-white/30" />
                  )}
                </div>
              </div>

              {/* CONTROLS */}
              <div className="border-t border-[#eeeef2] bg-white p-5 lg:overflow-y-auto lg:border-l lg:border-t-0">
                <div className="rounded-[10px] border border-[#eeeef2] bg-[#fafafd] p-3.5">
                  <p className="truncate text-[11px] font-semibold text-[#555560]">
                    {cropState.fileName}
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-[#9898a3]">
                    {cropState.imageType === "profile"
                      ? "Output: square professional portrait"
                      : "Output: wide profile banner"}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <h3 className="text-[13px] font-semibold text-[#202027]">
                    Position
                  </h3>

                  <button
                    type="button"
                    onClick={resetCrop}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#7456a3] transition hover:text-[#5f4588]"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                </div>

                <div className="mt-4 space-y-5">
                  <label className="block">
                    <span className="flex items-center justify-between text-[11px] font-semibold text-[#555560]">
                      Zoom
                      <span className="font-normal text-[#9898a3]">
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
                                zoom: Number(
                                  event.target
                                    .value,
                                ),
                              }
                            : current,
                        )
                      }
                      className="mt-2 w-full accent-[#7456a3]"
                    />
                  </label>

                  <label className="block">
                    <span className="flex items-center justify-between text-[11px] font-semibold text-[#555560]">
                      Horizontal Position
                      <span className="font-normal text-[#9898a3]">
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
                                positionX:
                                  Number(
                                    event.target
                                      .value,
                                  ),
                              }
                            : current,
                        )
                      }
                      className="mt-2 w-full accent-[#7456a3]"
                    />
                  </label>

                  <label className="block">
                    <span className="flex items-center justify-between text-[11px] font-semibold text-[#555560]">
                      Vertical Position
                      <span className="font-normal text-[#9898a3]">
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
                                positionY:
                                  Number(
                                    event.target
                                      .value,
                                  ),
                              }
                            : current,
                        )
                      }
                      className="mt-2 w-full accent-[#7456a3]"
                    />
                  </label>
                </div>

                <div className="mt-5 rounded-[10px] border border-[#e8e8ed] bg-white p-3.5">
                  <p className="text-[10px] leading-5 text-[#757580]">
                    {cropState.imageType === "profile"
                      ? "Tip: Keep your face centered with a little space above your head. Avoid group photos, filters, and busy backgrounds."
                      : "Tip: Choose a simple image that does not distract from your professional profile information."}
                  </p>
                </div>

                {cropError && (
                  <p className="mt-4 rounded-[9px] border border-[#edcece] bg-[#faf0f0] px-3 py-2.5 text-[11px] font-medium leading-5 text-[#a75555]">
                    {cropError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#eeeef2] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeCropModal}
                className="min-h-[40px] rounded-[8px] border border-[#e8e8ed] bg-white px-4 text-[12px] font-semibold text-[#666672] transition hover:bg-[#f7f7f9]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void saveCroppedImage()
                }
                disabled={isCropping}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588] disabled:cursor-wait disabled:opacity-60"
              >
                <Check size={14} />
                {isCropping
                  ? "Saving..."
                  : cropState.imageType ===
                      "profile"
                    ? "Use Profile Photo"
                    : "Use Banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-3 py-5 backdrop-blur-[2px] sm:px-5"
          role="presentation"
        >
          <div
            className="flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[16px] border border-white/60 bg-white shadow-[0_22px_60px_rgba(31,25,39,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-label="Edit doctor profile"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eeeef2] px-5 py-5 sm:px-7">
              <div>
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
                  Profile Settings
                </span>

                <h2 className="text-[20px] font-semibold text-[#202027]">
                  Edit Doctor Profile
                </h2>

                <p className="mt-1.5 text-[12px] leading-5 text-[#757580]">
                  Update your professional,
                  contact, and availability
                  information.
                </p>
              </div>

              <button
                type="button"
                onClick={requestCloseEditModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f6f6f8] text-[#71717a] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
                aria-label="Close profile editor"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="space-y-7 px-5 py-6 sm:px-7">
                {/* BASIC */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-[14px] font-semibold text-[#202027]">
                      Basic Information
                    </h3>

                    <p className="mt-1 text-[11px] text-[#9898a3]">
                      Your name, professional title,
                      and location.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ProfileField
                      label="Full Name"
                      required
                    >
                      <input
                        type="text"
                        value={
                          draftProfile.fullName
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "fullName",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                        required
                      />
                    </ProfileField>

                    <ProfileField
                      label="Professional Title"
                      required
                    >
                      <input
                        type="text"
                        value={
                          draftProfile.professionalTitle
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "professionalTitle",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                        required
                      />
                    </ProfileField>

                    <ProfileField label="City">
                      <input
                        type="text"
                        value={draftProfile.city}
                        onChange={(event) =>
                          handleDraftChange(
                            "city",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField label="Country">
                      <input
                        type="text"
                        value={
                          draftProfile.country
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "country",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>
                  </div>
                </section>

                <div className="border-t border-[#eeeef2]" />

                {/* CONTACT + CREDENTIALS */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-[14px] font-semibold text-[#202027]">
                      Contact & Credentials
                    </h3>

                    <p className="mt-1 text-[11px] text-[#9898a3]">
                      Professional contact and
                      licensing information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ProfileField label="Contact Number">
                      <input
                        type="tel"
                        value={draftProfile.phone}
                        onChange={(event) =>
                          handleDraftChange(
                            "phone",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField
                      label="Email Address"
                      required
                    >
                      <input
                        type="email"
                        value={draftProfile.email}
                        onChange={(event) =>
                          handleDraftChange(
                            "email",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                        required
                      />
                    </ProfileField>

                    <ProfileField label="Specialty">
                      <input
                        type="text"
                        value={
                          draftProfile.specialty
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "specialty",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField label="PRC License Number">
                      <input
                        type="text"
                        value={
                          draftProfile.licenseNumber
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "licenseNumber",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField label="License Expiry">
                      <input
                        type="text"
                        value={
                          draftProfile.licenseExpiry
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "licenseExpiry",
                            event.target.value,
                          )
                        }
                        placeholder="December 18, 2028"
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField label="Affiliated Center">
                      <input
                        type="text"
                        value={
                          draftProfile.affiliatedCenter
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "affiliatedCenter",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField label="Years of Experience">
                      <input
                        type="number"
                        min="0"
                        value={
                          draftProfile.yearsOfExperience
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "yearsOfExperience",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField
                      label="Languages Spoken"
                      helper="Separate languages with commas."
                    >
                      <input
                        type="text"
                        value={
                          draftProfile.languages
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "languages",
                            event.target.value,
                          )
                        }
                        placeholder="English, Filipino, Cebuano"
                        className="profile-input"
                      />
                    </ProfileField>
                  </div>
                </section>

                <div className="border-t border-[#eeeef2]" />

                {/* AVAILABILITY */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-[14px] font-semibold text-[#202027]">
                      Availability
                    </h3>

                    <p className="mt-1 text-[11px] text-[#9898a3]">
                      When and how you are currently
                      available.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ProfileField label="Available Days">
                      <input
                        type="text"
                        value={
                          draftProfile.consultationDays
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "consultationDays",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField label="Consultation Hours">
                      <input
                        type="text"
                        value={
                          draftProfile.consultationHours
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "consultationHours",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      />
                    </ProfileField>

                    <ProfileField label="Consultation Mode">
                      <select
                        value={
                          draftProfile.consultationMode
                        }
                        onChange={(event) =>
                          handleDraftChange(
                            "consultationMode",
                            event.target.value,
                          )
                        }
                        className="profile-input"
                      >
                        <option value="In-person">
                          In-person
                        </option>
                        <option value="Online">
                          Online
                        </option>
                        <option value="Hybrid">
                          Hybrid
                        </option>
                      </select>
                    </ProfileField>
                  </div>
                </section>

                <div className="border-t border-[#eeeef2]" />

                {/* ABOUT */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-[14px] font-semibold text-[#202027]">
                      Professional Summary
                    </h3>

                    <p className="mt-1 text-[11px] text-[#9898a3]">
                      A concise professional overview
                      displayed in your profile.
                    </p>
                  </div>

                  <ProfileField label="About the Doctor">
                    <textarea
                      value={
                        draftProfile.biography
                      }
                      onChange={(event) =>
                        handleDraftChange(
                          "biography",
                          event.target.value,
                        )
                      }
                      rows={6}
                      className="profile-textarea"
                    />
                  </ProfileField>
                </section>
              </div>

              <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-3 border-t border-[#eeeef2] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  {saveMessage && (
                    <p className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#4f9467]">
                      <Check size={15} />
                      {saveMessage}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      requestCloseEditModal
                    }
                    className="min-h-[40px] rounded-[8px] border border-[#e8e8ed] bg-white px-4 text-[12px] font-semibold text-[#666672] transition hover:bg-[#f7f7f9]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="min-h-[40px] rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmationAction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-[3px]">
          <div className="w-full max-w-md overflow-hidden rounded-[16px] border border-white/60 bg-white shadow-[0_22px_60px_rgba(31,25,39,0.18)]">
            <div className="px-5 py-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
                  confirmationAction === "save"
                    ? "bg-[#f3eff8] text-[#7456a3]"
                    : "bg-[#fff5eb] text-[#bd7a38]"
                }`}
              >
                {confirmationAction === "save" ? (
                  <Check size={17} />
                ) : (
                  <X size={17} />
                )}
              </div>

              <h2 className="mt-4 text-[18px] font-semibold text-[#202027]">
                {confirmationAction === "save"
                  ? "Save Profile Changes?"
                  : "Discard Changes?"}
              </h2>

              <p className="mt-2 text-[12px] leading-5 text-[#757580]">
                {confirmationAction === "save"
                  ? "Please confirm that your updated professional and contact information is correct."
                  : "Any unsaved changes in the profile editor will be discarded."}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#eeeef2] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setConfirmationAction(null)
                }
                className="min-h-[40px] rounded-[8px] border border-[#e8e8ed] bg-white px-4 text-[12px] font-semibold text-[#666672] transition hover:bg-[#f7f7f9]"
              >
                {confirmationAction === "save"
                  ? "Review Again"
                  : "Continue Editing"}
              </button>

              <button
                type="button"
                onClick={
                  confirmationAction === "save"
                    ? commitProfileSave
                    : closeEditModalImmediately
                }
                className={`min-h-[40px] rounded-[8px] px-4 text-[12px] font-semibold text-white transition ${
                  confirmationAction === "save"
                    ? "bg-[#7456a3] hover:bg-[#5f4588]"
                    : "bg-[#b77732] hover:bg-[#9e662b]"
                }`}
              >
                {confirmationAction === "save"
                  ? "Save Changes"
                  : "Discard Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .profile-input {
          margin-top: 0.5rem;
          height: 44px;
          width: 100%;
          border-radius: 9px;
          border: 1px solid #e8e8ed;
          background: #fafafd;
          padding: 0 13px;
          color: #202027;
          font-size: 13px;
          outline: none;
          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
        }

        .profile-input:focus {
          border-color: #cfc4df;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(116, 86, 163, 0.08);
        }

        .profile-textarea {
          margin-top: 0.5rem;
          width: 100%;
          resize: vertical;
          border-radius: 10px;
          border: 1px solid #e8e8ed;
          background: #fafafd;
          padding: 12px 13px;
          color: #202027;
          font-size: 13px;
          line-height: 1.6;
          outline: none;
          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
        }

        .profile-textarea:focus {
          border-color: #cfc4df;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(116, 86, 163, 0.08);
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   EDIT FORM FIELD
========================================================= */

function ProfileField({
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
      <span className="text-[12px] font-semibold text-[#555560]">
        {label}
        {required && (
          <span className="ml-1 text-[#7456a3]">
            *
          </span>
        )}
      </span>

      {children}

      {helper && (
        <span className="mt-1.5 block text-[10px] leading-4 text-[#9898a3]">
          {helper}
        </span>
      )}
    </label>
  );
}

export default DocProfileScreen;
