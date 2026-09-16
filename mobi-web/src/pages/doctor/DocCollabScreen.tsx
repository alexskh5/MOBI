import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  ClipboardList,
  Menu,
  Search,
  Share2,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DocSidebar from "../../components/doctor/DocSidebar";
import {
  getDoctorById,
  getDoctorPatients,
} from "../../services/doctor/doctorApi";
import {
  getLearnerCollaborationNotes,
  getLearnerTherapists,
} from "../../services/collaboration/collaborationApi";

/* =========================================================
   TYPES
========================================================= */

type NoteSource = "Clinical" | "MOBI Session";
type NotePeriod = "today" | "week" | "month";

interface CareMember {
  id: string;
  name: string;
  role: string;
  type: "doctor" | "therapist";
  isCurrentUser?: boolean;
}

interface ProgressNote {
  id: string;
  source: NoteSource;
  createdAt: string;
  dateLabel: string;
  authorName: string;
  authorRole?: string;
  isCurrentUser?: boolean;
  content: string;
  title?: string;
  category?: string;
}

interface CollaborationPatient {
  id: string;
  learnerCode?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  age: number | null;
  profilePicture?: string | null;
  assignedDoctor: CareMember;
  assignedTherapists: CareMember[];
  notes: ProgressNote[];
}

interface DoctorPatientApiRecord {
  id: string;
  learnerCode?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate?: string | null;
  profilePhotoUrl?: string | null;
}

interface DoctorApiRecord {
  id: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  specialization?: string | null;
}

/* =========================================================
   HELPERS
========================================================= */

function getFullName(patient: CollaborationPatient) {
  return [
    patient.firstName,
    patient.middleName,
    patient.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function calculateAge(birthDate?: string | null) {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function formatRecordDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function isWithinPeriod(
  createdAt: string,
  selectedPeriod: NotePeriod,
) {
  const recordDate =
    new Date(createdAt);

  if (
    Number.isNaN(
      recordDate.getTime(),
    )
  ) {
    return false;
  }

  const now = new Date();
  const startDate =
    new Date(now);

  if (
    selectedPeriod ===
    "today"
  ) {
    startDate.setHours(
      0,
      0,
      0,
      0,
    );

    return (
      recordDate >=
        startDate &&
      recordDate <= now
    );
  }

  if (
    selectedPeriod ===
    "week"
  ) {
    const currentDay =
      now.getDay();

    const daysSinceMonday =
      currentDay === 0
        ? 6
        : currentDay - 1;

    startDate.setDate(
      now.getDate() -
        daysSinceMonday,
    );

    startDate.setHours(
      0,
      0,
      0,
      0,
    );

    return (
      recordDate >=
        startDate &&
      recordDate <= now
    );
  }

  startDate.setDate(1);
  startDate.setHours(
    0,
    0,
    0,
    0,
  );

  return (
    recordDate >=
      startDate &&
    recordDate <= now
  );
}

function normalizeRole(
  senderRole?: string | null,
) {
  const role =
    senderRole
      ?.trim()
      .toLowerCase() ??
    "";

  if (role === "doctor") {
    return "Doctor";
  }

  if (
    role === "therapist"
  ) {
    return "Therapist";
  }

  return "Center";
}

function mapNote(
  note: any,
  doctorId: string,
): ProgressNote {
  const senderRole =
    String(
      note.senderRole ??
        "",
    )
      .trim()
      .toLowerCase();

  const category =
    note.category
      ? String(note.category)
      : undefined;

  const clinical =
    senderRole ===
      "doctor" ||
    category
      ?.toLowerCase()
      .includes(
        "clinical",
      );

  const isCurrentUser =
    senderRole ===
      "doctor" &&
    String(
      note.doctorId ?? "",
    ) === doctorId;

  const createdAt =
    String(
      note.createdAt ??
        new Date().toISOString(),
    );

  return {
    id:
      String(note.id),

    source:
      clinical
        ? "Clinical"
        : "MOBI Session",

    createdAt,

    dateLabel:
      formatRecordDate(
        createdAt,
      ),

    authorName:
      String(
        note.sender ??
          normalizeRole(
            note.senderRole,
          ),
      ),

    authorRole:
      isCurrentUser
        ? "You"
        : normalizeRole(
            note.senderRole,
          ),

    isCurrentUser,

    content:
      String(
        note.content ??
          "",
      ),

    title:
      note.title
        ? String(note.title)
        : undefined,

    category,
  };
}

function mapTherapist(
  therapist: any,
): CareMember {
  const generatedName =
    [
      therapist.first_name ??
        therapist.firstName,
      therapist.middle_name ??
        therapist.middleName,
      therapist.last_name ??
        therapist.lastName,
    ]
      .filter(Boolean)
      .join(" ");

  return {
    id:
      String(
        therapist.id,
      ),

    name:
      String(
        therapist.name ??
          generatedName ??
          "Therapist",
      ) ||
      "Therapist",

    role:
      String(
        therapist.specialization ??
          "Therapist",
      ),

    type:
      "therapist",
  };
}

/* =========================================================
   SMALL REUSABLE COMPONENTS
========================================================= */

function Avatar({
  name,
  image,
  size = "medium",
}: {
  name: string;
  image?: string | null;
  size?: "small" | "medium" | "large";
}) {
  const sizeClass =
    size === "small"
      ? "h-8 w-8 text-[9px]"
      : size === "large"
        ? "h-12 w-12 text-sm"
        : "h-10 w-10 text-[10px]";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#f3eff8] font-bold text-[#7456a3]`}
      aria-label={`${name} avatar`}
    >
      {initials || (
        <UserRound
          size={16}
        />
      )}
    </div>
  );
}

function SectionEyebrow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-[#7456a3]">
      {children}
    </span>
  );
}

function CareMemberRow({
  member,
  label,
}: {
  member: CareMember;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-[#eeeef2] bg-[#fafafd] px-3 py-2.5">
      <Avatar
        name={member.name}
        size="small"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <strong className="truncate text-[10px] font-semibold text-[#202027]">
            {member.isCurrentUser
              ? "You"
              : member.name}
          </strong>

          {label && (
            <span className="rounded-full bg-[#f3eff8] px-1.5 py-0.5 text-[8px] font-semibold text-[#7456a3]">
              {label}
            </span>
          )}
        </div>

        <span className="mt-0.5 block truncate text-[8px] text-[#9898a3]">
          {member.role}
        </span>
      </div>
    </div>
  );
}

function SourceBadge({
  source,
}: {
  source: NoteSource;
}) {
  const isClinical =
    source ===
    "Clinical";

  return (
    <span
      className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-[8px] font-semibold ${
        isClinical
          ? "bg-[#f3eff8] text-[#7456a3]"
          : "bg-[#edf7f0] text-[#4f9467]"
      }`}
    >
      {source}
    </span>
  );
}

/* =========================================================
   MAIN SCREEN
========================================================= */

function DocCollabScreen() {
  const navigate =
    useNavigate();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] =
    useState(
      () =>
        typeof window !==
          "undefined" &&
        window.innerWidth >=
          1024,
    );

  const [
    patients,
    setPatients,
  ] =
    useState<
      CollaborationPatient[]
    >([]);

  const [
    selectedPatientId,
    setSelectedPatientId,
  ] =
    useState<
      string | null
    >(null);

  const [
    patientSearch,
    setPatientSearch,
  ] =
    useState("");

  const [
    notePeriod,
    setNotePeriod,
  ] =
    useState<NotePeriod>(
      "month",
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCollaboration() {
      const role =
        localStorage.getItem(
          "mobi_staff_role",
        );

      const doctorId =
        localStorage.getItem(
          "mobi_staff_profile_id",
        );

      if (
        role !== "doctor" ||
        !doctorId
      ) {
        navigate(
          "/login",
          {
            replace: true,
          },
        );
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const [
          doctorResult,
          patientResult,
        ] =
          await Promise.all([
            getDoctorById(
              doctorId,
            ),
            getDoctorPatients(
              doctorId,
            ),
          ]);

        const doctor =
          doctorResult
            ?.doctor as
            | DoctorApiRecord
            | undefined;

        if (!doctor) {
          throw new Error(
            "Unable to identify the logged-in doctor.",
          );
        }

        const doctorName =
          [
            doctor.first_name ??
              doctor.firstName,
            doctor.middle_name ??
              doctor.middleName,
            doctor.last_name ??
              doctor.lastName,
          ]
            .filter(Boolean)
            .join(" ");

        const doctorMember:
          CareMember = {
            id:
              String(
                doctor.id,
              ),

            name:
              doctorName ||
              "Doctor",

            role:
              doctor.specialization ??
              "Doctor",

            type:
              "doctor",

            isCurrentUser:
              true,
          };

        const records:
          DoctorPatientApiRecord[] =
          Array.isArray(
            patientResult
              ?.patients,
          )
            ? patientResult.patients
            : [];

        const mappedPatients =
          await Promise.all(
            records.map(
              async (
                patient,
              ) => {
                const [
                  notesResult,
                  therapistsResult,
                ] =
                  await Promise.allSettled([
                    getLearnerCollaborationNotes(
                      patient.id,
                    ),
                    getLearnerTherapists(
                      patient.id,
                    ),
                  ]);

                let notes:
                  ProgressNote[] =
                  [];

                if (
                  notesResult.status ===
                  "fulfilled"
                ) {
                  notes =
                    (
                      notesResult
                        .value
                        ?.notes ??
                      []
                    )
                      .map(
                        (
                          note:
                            any,
                        ) =>
                          mapNote(
                            note,
                            doctorId,
                          ),
                      )
                      .sort(
                        (
                          first,
                          second,
                        ) =>
                          new Date(
                            second.createdAt,
                          ).getTime() -
                          new Date(
                            first.createdAt,
                          ).getTime(),
                      );
                } else {
                  console.error(
                    `Unable to load notes for learner ${patient.id}:`,
                    notesResult.reason,
                  );
                }

                let assignedTherapists:
                  CareMember[] =
                  [];

                if (
                  therapistsResult.status ===
                  "fulfilled"
                ) {
                  assignedTherapists =
                    (
                      therapistsResult
                        .value
                        ?.therapists ??
                      []
                    ).map(
                      mapTherapist,
                    );
                } else {
                  console.error(
                    `Unable to load therapists for learner ${patient.id}:`,
                    therapistsResult.reason,
                  );
                }

                return {
                  id:
                    String(
                      patient.id,
                    ),

                  learnerCode:
                    patient.learnerCode ??
                    null,

                  firstName:
                    patient.firstName,

                  middleName:
                    patient.middleName ??
                    null,

                  lastName:
                    patient.lastName,

                  age:
                    calculateAge(
                      patient.birthDate,
                    ),

                  profilePicture:
                    patient.profilePhotoUrl ??
                    null,

                  assignedDoctor:
                    doctorMember,

                  assignedTherapists,

                  notes,
                } satisfies CollaborationPatient;
              },
            ),
          );

        if (!mounted) {
          return;
        }

        setPatients(
          mappedPatients,
        );

        setSelectedPatientId(
          (
            currentId,
          ) =>
            currentId &&
            mappedPatients.some(
              (
                patient,
              ) =>
                patient.id ===
                currentId,
            )
              ? currentId
              : mappedPatients[0]
                  ?.id ??
                null,
        );
      } catch (
        error: any
      ) {
        if (!mounted) {
          return;
        }

        setErrorMessage(
          error?.response
            ?.data?.message ||
            error?.message ||
            "Unable to load collaboration data.",
        );

        setPatients([]);
        setSelectedPatientId(
          null,
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadCollaboration();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const filteredPatients =
    useMemo(() => {
      const normalizedSearch =
        patientSearch
          .trim()
          .toLowerCase();

      if (
        !normalizedSearch
      ) {
        return patients;
      }

      return patients.filter(
        (patient) =>
          `${getFullName(
            patient,
          )} ${
            patient.learnerCode ??
            ""
          }`
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [
      patientSearch,
      patients,
    ]);

  const selectedPatient =
    patients.find(
      (patient) =>
        patient.id ===
        selectedPatientId,
    ) ?? null;

  const visibleNotes =
    useMemo(() => {
      if (
        !selectedPatient
      ) {
        return [];
      }

      return selectedPatient.notes.filter(
        (note) =>
          isWithinPeriod(
            note.createdAt,
            notePeriod,
          ),
      );
    }, [
      selectedPatient,
      notePeriod,
    ]);

  const handlePatientSearch =
    (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => {
      setPatientSearch(
        event.target.value,
      );
    };

  const handleShare =
    async () => {
      if (
        !selectedPatient
      ) {
        return;
      }

      const fullName =
        getFullName(
          selectedPatient,
        );

      const ageLabel =
        selectedPatient.age ===
        null
          ? ""
          : `, ${selectedPatient.age} years old`;

      const shareText =
        `${fullName}${ageLabel}: ${selectedPatient.notes.length} shared collaboration note${
          selectedPatient.notes
            .length === 1
            ? ""
            : "s"
        }.`;

      try {
        if (
          navigator.share
        ) {
          await navigator.share(
            {
              title:
                "MOBI Collaboration",
              text:
                shareText,
            },
          );

          return;
        }

        await navigator.clipboard.writeText(
          shareText,
        );

        window.alert(
          "Collaboration summary copied to clipboard.",
        );
      } catch (error) {
        console.error(
          "Unable to share collaboration details:",
          error,
        );
      }
    };

  const fullName =
    selectedPatient
      ? getFullName(
          selectedPatient,
        )
      : "";

  return (
    <div className="min-h-screen bg-[#f7f7f9] font-professional text-[#202027]">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() =>
              setSidebarOpen(
                false,
              )
            }
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          />

          <DocSidebar
            setSidebarOpen={
              setSidebarOpen
            }
          />
        </>
      )}

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() =>
            setSidebarOpen(
              true,
            )
          }
          className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-[10px] border border-[#e8e8ed] bg-white text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3] lg:flex"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu
            size={19}
          />
        </button>
      )}

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarOpen
            ? "lg:pl-[280px]"
            : "lg:pl-0"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e8e8ed] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(
                true,
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
            aria-label="Open sidebar"
          >
            <Menu
              size={20}
            />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#202027]">
              Collaboration
            </p>

            <p className="truncate text-[10px] text-[#9898a3]">
              Progress notes and care team
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-[42px] lg:py-[35px]">
          <section className="mb-[30px] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <SectionEyebrow>
                Doctor Workspace
              </SectionEyebrow>

              <h1 className="m-0 text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-[#202027]">
                Collaboration
              </h1>

              <p className="mt-2 max-w-[650px] text-[13px] leading-[1.6] text-[#757580]">
                Review real progress notes and stay aligned with the care team
                supporting each learner currently assigned to you.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleShare()
              }
              disabled={
                !selectedPatient
              }
              className="inline-flex min-h-[38px] items-center justify-center gap-2 self-start rounded-[9px] border border-[#ded8e8] bg-white px-3.5 text-[10px] font-semibold text-[#7456a3] transition hover:bg-[#f3eff8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Share2
                size={15}
              />
              Share Notes
            </button>
          </section>

          {errorMessage && (
            <div className="mb-5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[11px] font-semibold text-red-700">
                {errorMessage}
              </p>
            </div>
          )}

          <section className="overflow-hidden rounded-[14px] border border-[#e8e8ed] bg-white">
            <div className="flex flex-col gap-4 border-b border-[#eeeef2] px-5 py-[21px] xl:flex-row xl:items-center xl:justify-between">
              <div>
                <SectionEyebrow>
                  Care Coordination
                </SectionEyebrow>

                <h2 className="m-0 text-[18px] font-semibold tracking-[-0.015em] text-[#202027]">
                  Patient Collaboration
                </h2>

                <p className="mt-1.5 text-[11px] leading-[1.5] text-[#757580]">
                  Only learners currently assigned to your Doctor account are shown.
                </p>
              </div>

              <div className="relative w-full xl:w-[340px]">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a3]"
                />

                <input
                  type="search"
                  value={
                    patientSearch
                  }
                  onChange={
                    handlePatientSearch
                  }
                  placeholder="Search patient..."
                  className="h-[38px] w-full rounded-[9px] border border-[#e8e8ed] bg-[#fafafd] pl-9 pr-3 text-[11px] text-[#202027] outline-none transition placeholder:text-[#aaa9b3] focus:border-[#cfc4df] focus:bg-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[620px] items-center justify-center px-6 py-12">
                <div className="text-center">
                  <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#ded8e8] border-t-[#7456a3]" />

                  <p className="mt-3 text-[11px] text-[#757580]">
                    Loading assigned learners and collaboration notes...
                  </p>
                </div>
              </div>
            ) : patients.length ===
              0 ? (
              <div className="flex min-h-[620px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#f3eff8] text-[#7456a3]">
                  <Users
                    size={21}
                  />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#202027]">
                  No assigned learners
                </h3>

                <p className="mt-1.5 max-w-md text-[11px] leading-5 text-[#757580]">
                  This Doctor account currently has no active learner assignments.
                </p>
              </div>
            ) : (
              <div className="grid min-h-[620px] lg:grid-cols-[250px_minmax(0,1fr)]">
                <aside className="border-b border-[#eeeef2] bg-[#fafafd] lg:border-b-0 lg:border-r">
                  <section>
                    <div className="flex items-center justify-between gap-2 border-b border-[#eeeef2] px-4 py-3.5">
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#9898a3]">
                          Assigned Learners
                        </span>

                        <p className="mt-1 text-[10px] font-semibold text-[#202027]">
                          {
                            filteredPatients.length
                          }{" "}
                          patient
                          {filteredPatients.length ===
                          1
                            ? ""
                            : "s"}
                        </p>
                      </div>

                      <Users
                        size={16}
                        className="text-[#7456a3]"
                      />
                    </div>

                    <div className="max-h-[270px] overflow-y-auto py-1.5">
                      {filteredPatients.length ===
                      0 ? (
                        <div className="px-4 py-8 text-center">
                          <Search
                            size={18}
                            className="mx-auto text-[#9898a3]"
                          />

                          <p className="mt-2 text-[10px] font-medium text-[#757580]">
                            No patient found.
                          </p>
                        </div>
                      ) : (
                        filteredPatients.map(
                          (
                            patient,
                          ) => {
                            const patientName =
                              getFullName(
                                patient,
                              );

                            const isSelected =
                              patient.id ===
                              selectedPatient?.id;

                            return (
                              <button
                                key={
                                  patient.id
                                }
                                type="button"
                                onClick={() =>
                                  setSelectedPatientId(
                                    patient.id,
                                  )
                                }
                                className={`relative flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition ${
                                  isSelected
                                    ? "bg-[#f3eff8]"
                                    : "hover:bg-white"
                                }`}
                              >
                                {isSelected && (
                                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-[#7456a3]" />
                                )}

                                <Avatar
                                  name={
                                    patientName
                                  }
                                  image={
                                    patient.profilePicture
                                  }
                                  size="small"
                                />

                                <div className="min-w-0">
                                  <span
                                    className={`block truncate text-[10px] font-semibold ${
                                      isSelected
                                        ? "text-[#7456a3]"
                                        : "text-[#202027]"
                                    }`}
                                  >
                                    {
                                      patientName
                                    }
                                  </span>

                                  <span className="mt-0.5 block truncate text-[8px] text-[#9898a3]">
                                    {patient.age ===
                                    null
                                      ? "Age unavailable"
                                      : `${patient.age} years old`}
                                  </span>
                                </div>
                              </button>
                            );
                          },
                        )
                      )}
                    </div>
                  </section>

                  {selectedPatient && (
                    <section className="border-t border-[#eeeef2] px-4 py-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#9898a3]">
                            Care Team
                          </span>

                          <p className="mt-1 text-[10px] font-semibold text-[#202027]">
                            Assigned Professionals
                          </p>
                        </div>

                        <Stethoscope
                          size={16}
                          className="text-[#7456a3]"
                        />
                      </div>

                      <div className="space-y-2">
                        <CareMemberRow
                          member={
                            selectedPatient.assignedDoctor
                          }
                          label="Doctor"
                        />

                        {selectedPatient.assignedTherapists.length >
                        0 ? (
                          selectedPatient.assignedTherapists.map(
                            (
                              therapist,
                            ) => (
                              <CareMemberRow
                                key={
                                  therapist.id
                                }
                                member={
                                  therapist
                                }
                                label="Therapist"
                              />
                            ),
                          )
                        ) : (
                          <div className="rounded-[10px] border border-dashed border-[#dedce4] bg-white px-3 py-3">
                            <p className="text-[9px] leading-4 text-[#9898a3]">
                              No therapists are currently assigned to this learner.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </aside>

                <div className="min-w-0">
                  {!selectedPatient ? (
                    <div className="flex min-h-[620px] flex-col items-center justify-center px-6 text-center">
                      <UserRound
                        size={25}
                        className="text-[#7456a3]"
                      />

                      <p className="mt-3 text-[11px] text-[#757580]">
                        Select an assigned learner to review collaboration notes.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-4 border-b border-[#eeeef2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar
                            name={
                              fullName
                            }
                            image={
                              selectedPatient.profilePicture
                            }
                            size="large"
                          />

                          <div className="min-w-0">
                            <span className="block text-[8px] font-bold uppercase tracking-[0.08em] text-[#7456a3]">
                              Selected Patient
                            </span>

                            <h3 className="mt-1 truncate text-[15px] font-semibold text-[#202027]">
                              {
                                fullName
                              }
                            </h3>

                            <p className="mt-0.5 text-[9px] text-[#9898a3]">
                              {selectedPatient.age ===
                              null
                                ? "Age unavailable"
                                : `${selectedPatient.age} years old`}{" "}
                              •{" "}
                              {
                                selectedPatient.notes.length
                              }{" "}
                              progress note
                              {selectedPatient.notes.length ===
                              1
                                ? ""
                                : "s"}
                            </p>
                          </div>
                        </div>

                        <div className="inline-flex min-h-[36px] items-center gap-2 self-start rounded-[8px] border border-[#e8e8ed] bg-[#fafafd] px-3.5 text-[9px] font-semibold text-[#757580] sm:self-auto">
                          <ClipboardList
                            size={14}
                            className="text-[#7456a3]"
                          />
                          Notes are read-only for now
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-b border-[#eeeef2] bg-[#fafafd] px-5 py-3.5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#9898a3]">
                            Progress Notes
                          </span>

                          <p className="mt-1 text-[10px] text-[#757580]">
                            Real shared notes from the learner's care team.
                          </p>
                        </div>

                        <div className="flex items-center gap-1 rounded-[8px] border border-[#e8e8ed] bg-white p-1">
                          {(
                            [
                              [
                                "today",
                                "Today",
                              ],
                              [
                                "week",
                                "This Week",
                              ],
                              [
                                "month",
                                "This Month",
                              ],
                            ] as const
                          ).map(
                            ([
                              value,
                              label,
                            ]) => (
                              <button
                                key={
                                  value
                                }
                                type="button"
                                onClick={() =>
                                  setNotePeriod(
                                    value,
                                  )
                                }
                                className={`min-h-[28px] rounded-[6px] px-2.5 text-[8px] font-semibold transition ${
                                  notePeriod ===
                                  value
                                    ? "bg-[#f3eff8] text-[#7456a3]"
                                    : "text-[#9898a3] hover:bg-[#f7f7f9] hover:text-[#666672]"
                                }`}
                              >
                                {
                                  label
                                }
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="min-h-[470px] px-5 py-4">
                        {visibleNotes.length ===
                        0 ? (
                          <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#f3eff8] text-[#7456a3]">
                              <ClipboardList
                                size={20}
                              />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-[#202027]">
                              No notes in this period
                            </h3>

                            <p className="mt-1.5 max-w-sm text-[10px] leading-5 text-[#757580]">
                              No shared collaboration notes were found for the selected time period.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {visibleNotes.map(
                              (
                                note,
                              ) => (
                                <article
                                  key={
                                    note.id
                                  }
                                  className="rounded-[12px] border border-[#e8e8ed] bg-white p-4 transition hover:border-[#dedce4]"
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                      <Avatar
                                        name={
                                          note.authorName
                                        }
                                        size="small"
                                      />

                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <strong className="text-[10px] font-semibold text-[#202027]">
                                            {
                                              note.authorName
                                            }
                                          </strong>

                                          {note.authorRole && (
                                            <span className="text-[8px] text-[#9898a3]">
                                              {
                                                note.authorRole
                                              }
                                            </span>
                                          )}
                                        </div>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                          <SourceBadge
                                            source={
                                              note.source
                                            }
                                          />

                                          {note.category && (
                                            <span className="inline-flex min-h-[24px] items-center rounded-full bg-[#f6f5f8] px-2 text-[8px] font-semibold text-[#666672]">
                                              {
                                                note.category
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5 text-[8px] text-[#9898a3]">
                                      <CalendarDays
                                        size={12}
                                      />
                                      {
                                        note.dateLabel
                                      }
                                    </div>
                                  </div>

                                  {note.title && (
                                    <h4 className="mt-3 text-[11px] font-semibold text-[#202027]">
                                      {
                                        note.title
                                      }
                                    </h4>
                                  )}

                                  <p className="mt-3 whitespace-pre-wrap text-[10px] leading-[1.65] text-[#666672]">
                                    {
                                      note.content
                                    }
                                  </p>
                                </article>
                              ),
                            )}

                            <div className="flex items-center justify-center gap-3 py-2 text-[8px] text-[#b0afb8]">
                              <span className="h-px w-16 border-t border-dashed border-[#d6d5db]" />
                              <span>
                                End of notes
                              </span>
                              <span className="h-px w-16 border-t border-dashed border-[#d6d5db]" />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default DocCollabScreen;
