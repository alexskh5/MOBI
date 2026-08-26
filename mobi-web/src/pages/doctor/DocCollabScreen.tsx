import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Menu,
  Plus,
  Search,
  Share2,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";
import DocSidebar from "../../components/doctor/DocSidebar";

/* =========================================================
   TYPES
   Static for now, but already shaped for future API data.
========================================================= */

type NoteSource = "Clinical" | "MOBI Session";
type NotePeriod = "today" | "week" | "month";
type NoteCategory = "Observation" | "Recommendation" | "Follow-up";

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
  dateLabel: string;
  period: NotePeriod;
  authorName: string;
  authorRole?: string;
  isCurrentUser?: boolean;
  content: string;
  title?: string;
  category?: NoteCategory;
  nextSteps?: string;
}

interface CollaborationPatient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  profilePicture?: string | null;
  assignedDoctor: CareMember;
  assignedTherapists: CareMember[];
  notes: ProgressNote[];
}

/* =========================================================
   STATIC PREVIEW DATA
   Later, replace this with your doctor collaboration API.
========================================================= */

const collaborationPatients: CollaborationPatient[] = [
  {
    id: "patient-001",
    firstName: "Lea",
    lastName: "Sarsoza",
    age: 8,
    profilePicture: null,
    assignedDoctor: {
      id: "doctor-001",
      name: "Dr. Jane R. Doe",
      role: "Developmental Pediatrician",
      type: "doctor",
      isCurrentUser: true,
    },
    assignedTherapists: [
      {
        id: "therapist-001",
        name: "John Lenon",
        role: "OT",
        type: "therapist",
      },
      {
        id: "therapist-002",
        name: "Villa R. Reese",
        role: "ST",
        type: "therapist",
      },
    ],
    notes: [
      {
        id: "note-001",
        source: "Clinical",
        dateLabel: "May 2, 2026",
        period: "month",
        authorName: "Dr. Jane R. Doe",
        authorRole: "You",
        isCurrentUser: true,
        content:
          "Lea practiced following simple directions and used short verbal requests during play activities. She showed improved attention during sensory breaks and participated well in peer interaction exercises.",
      },
      {
        id: "note-002",
        source: "MOBI Session",
        dateLabel: "May 3, 2026",
        period: "week",
        authorName: "John Lenon",
        authorRole: "OT",
        content:
          "Lea completed AI-guided speech activities focused on emotion recognition and turn-taking skills in MOBI. She responded positively to adaptive prompts and demonstrated progress in initiating simple social greetings.",
      },
      {
        id: "note-003",
        source: "MOBI Session",
        dateLabel: "May 5, 2026",
        period: "today",
        authorName: "John Lenon",
        authorRole: "OT",
        content:
          "Lea completed AI-guided speech activities focused on emotion recognition and turn-taking skills in MOBI. She responded positively to adaptive prompts and demonstrated progress in initiating simple social greetings.",
      },
    ],
  },
  {
    id: "patient-002",
    firstName: "Harry",
    lastName: "Potter",
    age: 9,
    profilePicture: null,
    assignedDoctor: {
      id: "doctor-001",
      name: "Dr. Jane R. Doe",
      role: "Developmental Pediatrician",
      type: "doctor",
      isCurrentUser: true,
    },
    assignedTherapists: [
      {
        id: "therapist-003",
        name: "Grace Lim",
        role: "ST",
        type: "therapist",
      },
    ],
    notes: [
      {
        id: "note-004",
        source: "Clinical",
        dateLabel: "May 4, 2026",
        period: "week",
        authorName: "Dr. Jane R. Doe",
        authorRole: "You",
        isCurrentUser: true,
        content:
          "Harry demonstrated better response consistency during phrase-level practice. Continue reinforcing spontaneous requesting and short conversational turns.",
      },
      {
        id: "note-005",
        source: "MOBI Session",
        dateLabel: "May 5, 2026",
        period: "today",
        authorName: "Grace Lim",
        authorRole: "ST",
        content:
          "Harry completed the daily request activity and responded correctly to four out of five prompts with minimal support.",
      },
    ],
  },
  {
    id: "patient-003",
    firstName: "Albus",
    lastName: "Severus",
    age: 7,
    profilePicture: null,
    assignedDoctor: {
      id: "doctor-001",
      name: "Dr. Jane R. Doe",
      role: "Developmental Pediatrician",
      type: "doctor",
      isCurrentUser: true,
    },
    assignedTherapists: [
      {
        id: "therapist-004",
        name: "Rachel Kim",
        role: "OT",
        type: "therapist",
      },
      {
        id: "therapist-005",
        name: "Noel Ramos",
        role: "ST",
        type: "therapist",
      },
    ],
    notes: [
      {
        id: "note-006",
        source: "MOBI Session",
        dateLabel: "May 5, 2026",
        period: "today",
        authorName: "Rachel Kim",
        authorRole: "OT",
        content:
          "Albus remained engaged during the visual matching activity and completed the session with two short breaks.",
      },
    ],
  },
  {
    id: "patient-004",
    firstName: "George",
    lastName: "Weasley",
    age: 10,
    profilePicture: null,
    assignedDoctor: {
      id: "doctor-001",
      name: "Dr. Jane R. Doe",
      role: "Developmental Pediatrician",
      type: "doctor",
      isCurrentUser: true,
    },
    assignedTherapists: [
      {
        id: "therapist-006",
        name: "Ana Cruz",
        role: "ST",
        type: "therapist",
      },
    ],
    notes: [
      {
        id: "note-007",
        source: "Clinical",
        dateLabel: "April 30, 2026",
        period: "month",
        authorName: "Dr. Jane R. Doe",
        authorRole: "You",
        isCurrentUser: true,
        content:
          "George continues to show steady improvement in maintaining topic and responding appropriately to familiar social situations.",
      },
    ],
  },
];

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
      ? "h-9 w-9 text-[10px]"
      : size === "large"
        ? "h-[52px] w-[52px] text-sm"
        : "h-11 w-11 text-xs";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
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
      {initials || <UserRound size={16} />}
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
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
    <div className="flex items-center gap-3 rounded-[10px] border border-[#eeeef2] bg-[#fafafd] px-3.5 py-3">
      <Avatar name={member.name} size="small" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <strong className="truncate text-[13px] font-semibold text-[#202027]">
            {member.isCurrentUser ? "You" : member.name}
          </strong>

          {label && (
            <span className="rounded-full bg-[#f3eff8] px-2 py-0.5 text-[9px] font-semibold text-[#7456a3]">
              {label}
            </span>
          )}
        </div>

        <span className="mt-1 block truncate text-[11px] text-[#9898a3]">
          {member.role}
        </span>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: NoteSource }) {
  const isClinical = source === "Clinical";

  return (
    <span
      className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-[9px] font-semibold ${
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
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );

  const [selectedPatientId, setSelectedPatientId] = useState(
    collaborationPatients[0].id,
  );

  const [patientSearch, setPatientSearch] = useState("");
  const [notePeriod, setNotePeriod] = useState<NotePeriod>("month");

  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [draftNote, setDraftNote] = useState("");
  const [draftNoteTitle, setDraftNoteTitle] = useState("");
  const [draftNoteCategory, setDraftNoteCategory] =
    useState<NoteCategory>("Observation");
  const [draftNextSteps, setDraftNextSteps] = useState("");

  const [noteSavedMessage, setNoteSavedMessage] = useState("");
  const [patients, setPatients] = useState(collaborationPatients);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = patientSearch.trim().toLowerCase();

    if (!normalizedSearch) return patients;

    return patients.filter((patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [patientSearch, patients]);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ??
    patients[0];

  const visibleNotes = useMemo(() => {
    const notePriority: Record<NotePeriod, number> = {
      today: 1,
      week: 2,
      month: 3,
    };

    return selectedPatient.notes.filter(
      (note) => notePriority[note.period] <= notePriority[notePeriod],
    );
  }, [selectedPatient, notePeriod]);

  const fullName =
    `${selectedPatient.firstName} ${selectedPatient.lastName}`;

  const handlePatientSearch = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPatientSearch(event.target.value);
  };

  const resetNoteForm = () => {
    setDraftNote("");
    setDraftNoteTitle("");
    setDraftNoteCategory("Observation");
    setDraftNextSteps("");
  };

  const closeAddNoteModal = () => {
    resetNoteForm();
    setIsAddNoteOpen(false);
  };

  const handleAddNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = draftNote.trim();
    const title = draftNoteTitle.trim();
    const nextSteps = draftNextSteps.trim();

    if (!content) return;

    const newNote: ProgressNote = {
      id: `note-${Date.now()}`,
      source: "Clinical",
      dateLabel: "Today",
      period: "today",
      authorName: "Dr. Jane R. Doe",
      authorRole: "You",
      isCurrentUser: true,
      content,
      title: title || undefined,
      category: draftNoteCategory,
      nextSteps: nextSteps || undefined,
    };

    setPatients((currentPatients) =>
      currentPatients.map((patient) =>
        patient.id === selectedPatient.id
          ? {
              ...patient,
              notes: [newNote, ...patient.notes],
            }
          : patient,
      ),
    );

    setNotePeriod("today");
    closeAddNoteModal();
    setNoteSavedMessage("Progress note saved successfully.");
    window.setTimeout(() => setNoteSavedMessage(""), 2600);

    /*
      Later backend call:
      POST /doctor/patients/:patientId/progress-notes
      body: { title, category, content, nextSteps }
    */
  };

  const handleShare = async () => {
    const shareText =
      `${fullName}, ${selectedPatient.age} years old: Progress Notes`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "MOBI Collaboration",
          text: shareText,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      window.alert("Progress note title copied to clipboard.");
    } catch (error) {
      console.error("Unable to share collaboration details:", error);
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

          <DocSidebar setSidebarOpen={setSidebarOpen} />
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
          sidebarOpen ? "lg:pl-[280px]" : "lg:pl-0"
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
            <p className="truncate text-sm font-semibold text-[#202027]">
              Collaboration
            </p>
            <p className="truncate text-[11px] text-[#9898a3]">
              Progress notes and care team
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-[42px] lg:py-[35px]">
          {/* PAGE HEADER */}
          <section className="mb-[30px] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <SectionEyebrow>Doctor Workspace</SectionEyebrow>

              <h1 className="m-0 text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-[#202027]">
                Collaboration
              </h1>

              <p className="mt-2 max-w-[680px] text-[14px] leading-[1.65] text-[#757580]">
                Review progress notes and stay aligned with the care team
                supporting each assigned learner.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex min-h-[38px] items-center justify-center gap-2 self-start rounded-[9px] border border-[#ded8e8] bg-white px-4 text-[12px] font-semibold text-[#7456a3] transition hover:bg-[#f3eff8]"
            >
              <Share2 size={15} />
              Share Notes
            </button>
          </section>

          {/* COLLABORATION WORKSPACE */}
          <section className="overflow-hidden rounded-[14px] border border-[#e8e8ed] bg-white">
            {/* WORKSPACE HEADER */}
            <div className="flex flex-col gap-4 border-b border-[#eeeef2] px-5 py-[21px] xl:flex-row xl:items-center xl:justify-between">
              <div>
                <SectionEyebrow>Shared Records</SectionEyebrow>

                <h2 className="m-0 text-[20px] font-semibold tracking-[-0.015em] text-[#202027]">
                  Progress Notes
                </h2>

                <p className="mt-2 text-[13px] leading-[1.55] text-[#757580]">
                  Choose a patient to review clinical observations and MOBI session updates from the care team.
                </p>
              </div>

              <div className="relative w-full xl:w-[360px]">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a3]"
                />

                <input
                  type="search"
                  value={patientSearch}
                  onChange={handlePatientSearch}
                  placeholder="Search patient..."
                  className="h-[42px] w-full rounded-[9px] border border-[#e8e8ed] bg-[#fafafd] pl-10 pr-3 text-[12px] text-[#202027] outline-none transition placeholder:text-[#aaa9b3] focus:border-[#cfc4df] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid min-h-[620px] lg:grid-cols-[290px_minmax(0,1fr)]">
              {/* LEFT SIDEBAR */}
              <aside className="border-b border-[#eeeef2] bg-[#fafafd] lg:border-b-0 lg:border-r">
                {/* PATIENT LIST */}
                <section>
                  <div className="flex items-center justify-between gap-2 border-b border-[#eeeef2] px-4 py-3.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9898a3]">
                        Patients
                      </span>

                      <p className="mt-1 text-[12px] font-semibold text-[#202027]">
                        {filteredPatients.length} patient
                        {filteredPatients.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <Users size={16} className="text-[#7456a3]" />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto py-1.5">
                    {filteredPatients.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Search
                          size={18}
                          className="mx-auto text-[#9898a3]"
                        />
                        <p className="mt-2 text-[12px] font-medium text-[#757580]">
                          No patient found.
                        </p>
                      </div>
                    ) : (
                      filteredPatients.map((patient) => {
                        const patientName =
                          `${patient.firstName} ${patient.lastName}`;
                        const isSelected =
                          patient.id === selectedPatient.id;

                        return (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() =>
                              setSelectedPatientId(patient.id)
                            }
                            className={`relative flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                              isSelected
                                ? "bg-[#f3eff8]"
                                : "hover:bg-white"
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-[#7456a3]" />
                            )}

                            <Avatar
                              name={patientName}
                              image={patient.profilePicture}
                              size="small"
                            />

                            <div className="min-w-0">
                              <span
                                className={`block truncate text-[13px] font-semibold ${
                                  isSelected
                                    ? "text-[#7456a3]"
                                    : "text-[#202027]"
                                }`}
                              >
                                {patientName}
                              </span>

                              <span className="mt-1 block text-[10px] text-[#9898a3]">
                                {patient.age} years old
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* CARE TEAM */}
                <section className="border-t border-[#eeeef2] px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#202027]">
                        Care Team
                      </h3>

                      <p className="mt-1 text-[11px] text-[#9898a3]">
                        Doctor and assigned therapists
                      </p>
                    </div>

                    <Stethoscope size={16} className="text-[#7456a3]" />
                  </div>

                  <div className="space-y-2">
                    <CareMemberRow
                      member={selectedPatient.assignedDoctor}
                      label="Doctor"
                    />

                    {selectedPatient.assignedTherapists.map(
                      (therapist) => (
                        <CareMemberRow
                          key={therapist.id}
                          member={therapist}
                          label="Therapist"
                        />
                      ),
                    )}
                  </div>
                </section>
              </aside>

              {/* RIGHT CONTENT */}
              <div className="min-w-0">
                {/* PATIENT SUMMARY */}
                <div className="flex flex-col gap-4 border-b border-[#eeeef2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={fullName}
                      image={selectedPatient.profilePicture}
                      size="large"
                    />

                    <div className="min-w-0">
                      <span className="block text-[8px] font-bold uppercase tracking-[0.08em] text-[#7456a3]">
                        Patient
                      </span>

                      <h3 className="mt-1 truncate text-[20px] font-semibold text-[#202027]">
                        {fullName}
                      </h3>

                      <p className="mt-1 text-[11px] text-[#9898a3]">
                        {selectedPatient.age} years old •{" "}
                        {selectedPatient.notes.length} progress note
                        {selectedPatient.notes.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddNoteOpen(true)}
                    className="inline-flex min-h-[36px] items-center justify-center gap-2 self-start rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588] sm:self-auto"
                  >
                    <Plus size={14} />
                    Add Progress Note
                  </button>
                </div>

                {/* NOTES HEADER */}
                <div className="flex flex-col gap-3 border-b border-[#eeeef2] bg-[#fafafd] px-5 py-3.5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#202027]">
                      Shared Notes
                    </h3>

                    <p className="mt-1 text-[12px] text-[#757580]">
                      Notes from the doctor, therapists, and MOBI sessions.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-[8px] border border-[#e8e8ed] bg-white p-1">
                    {(
                      [
                        ["today", "Today"],
                        ["week", "This Week"],
                        ["month", "This Month"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setNotePeriod(value)}
                        className={`min-h-[32px] rounded-[6px] px-3 text-[10px] font-semibold transition ${
                          notePeriod === value
                            ? "bg-[#f3eff8] text-[#7456a3]"
                            : "text-[#9898a3] hover:bg-[#f7f7f9] hover:text-[#666672]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NOTES LIST */}
                <div className="min-h-[470px] px-5 py-4">
                  {visibleNotes.length === 0 ? (
                    <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#f3eff8] text-[#7456a3]">
                        <ClipboardList size={20} />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-[#202027]">
                        No notes in this period
                      </h3>

                      <p className="mt-1.5 max-w-sm text-[12px] leading-5 text-[#757580]">
                        Add a clinical progress note or select a longer
                        time period.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleNotes.map((note) => (
                        <article
                          key={note.id}
                          className="rounded-[12px] border border-[#e8e8ed] bg-white p-5 transition hover:border-[#dedce4]"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <Avatar
                                name={note.authorName}
                                size="small"
                              />

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <strong className="text-[10px] font-semibold text-[#202027]">
                                    {note.authorName}
                                  </strong>

                                  {note.authorRole && (
                                    <span className="text-[10px] text-[#9898a3]">
                                      {note.authorRole}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <SourceBadge source={note.source} />

                                  {note.category && (
                                    <span className="inline-flex min-h-[24px] items-center rounded-full bg-[#f6f5f8] px-2 text-[8px] font-semibold text-[#666672]">
                                      {note.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-[#9898a3]">
                              <CalendarDays size={12} />
                              {note.dateLabel}
                            </div>
                          </div>

                          {note.title && (
                            <h4 className="mt-3 text-[14px] font-semibold text-[#202027]">
                              {note.title}
                            </h4>
                          )}

                          <p className="mt-3 text-[13px] leading-[1.75] text-[#5f5f69]">
                            {note.content}
                          </p>

                          {note.nextSteps && (
                            <div className="mt-3 rounded-[10px] border border-[#eeeef2] bg-[#fafafd] px-3.5 py-3">
                              <div className="flex items-center gap-2 text-[#7456a3]">
                                <CheckCircle2 size={13} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.07em]">
                                  Recommended Next Steps
                                </span>
                              </div>

                              <p className="mt-2 text-[12px] leading-[1.65] text-[#666672]">
                                {note.nextSteps}
                              </p>
                            </div>
                          )}
                        </article>
                      ))}

                      <div className="flex items-center justify-center gap-3 py-3 text-[10px] text-[#b0afb8]">
                        <span className="h-px w-16 border-t border-dashed border-[#d6d5db]" />
                        <span>End of notes</span>
                        <span className="h-px w-16 border-t border-dashed border-[#d6d5db]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* SUCCESS TOAST */}
      {noteSavedMessage && (
        <div className="fixed right-4 top-4 z-[90] flex items-center gap-2 rounded-[10px] border border-[#cfe4d6] bg-white px-4 py-3 text-[12px] font-semibold text-[#4f9467] shadow-[0_14px_36px_rgba(31,25,39,0.12)]">
          <CheckCircle2 size={15} />
          {noteSavedMessage}
        </div>
      )}

      {/* ADD NOTE MODAL */}
      {isAddNoteOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 px-3 py-5 backdrop-blur-[3px] sm:px-5"
          onClick={closeAddNoteModal}
          role="presentation"
        >
          <div
            className="flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-[16px] border border-white/60 bg-white shadow-[0_22px_60px_rgba(31,25,39,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-label="Add progress note"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eeeef2] px-5 py-5 sm:px-6">
              <div>
                <SectionEyebrow>Clinical Collaboration</SectionEyebrow>

                <h2 className="text-[20px] font-semibold text-[#202027]">
                  Add Progress Note
                </h2>

                <p className="mt-2 text-[13px] leading-5 text-[#757580]">
                  Record an observation or recommendation for {fullName}.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddNoteModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f6f6f8] text-[#71717a] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
                aria-label="Close add note modal"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleAddNote}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-center gap-3 rounded-[10px] border border-[#eeeef2] bg-[#fafafd] p-3.5">
                  <Avatar
                    name={fullName}
                    image={selectedPatient.profilePicture}
                  />

                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#202027]">
                      {fullName}
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#9898a3]">
                      {selectedPatient.age} years old • Note date: Today
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#555560]">
                      Note Category
                    </span>

                    <select
                      value={draftNoteCategory}
                      onChange={(event) =>
                        setDraftNoteCategory(
                          event.target.value as NoteCategory,
                        )
                      }
                      className="mt-2 h-[44px] w-full rounded-[9px] border border-[#e8e8ed] bg-[#fafafd] px-3.5 text-[13px] text-[#202027] outline-none transition focus:border-[#cfc4df] focus:bg-white"
                    >
                      <option value="Observation">Observation</option>
                      <option value="Recommendation">
                        Recommendation
                      </option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#555560]">
                      Note Title{" "}
                      <span className="font-normal text-[#9898a3]">
                        (optional)
                      </span>
                    </span>

                    <input
                      type="text"
                      value={draftNoteTitle}
                      onChange={(event) =>
                        setDraftNoteTitle(event.target.value)
                      }
                      maxLength={80}
                      placeholder="e.g. Improved turn-taking"
                      className="mt-2 h-[44px] w-full rounded-[9px] border border-[#e8e8ed] bg-[#fafafd] px-3.5 text-[13px] text-[#202027] outline-none transition placeholder:text-[#aaa9b3] focus:border-[#cfc4df] focus:bg-white"
                    />
                  </label>
                </div>

                <label className="block">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-semibold text-[#555560]">
                      Progress Note
                    </span>

                    <span className="text-[10px] text-[#9898a3]">
                      {draftNote.length}/1200
                    </span>
                  </div>

                  <textarea
                    id="progress-note"
                    value={draftNote}
                    onChange={(event) =>
                      setDraftNote(event.target.value)
                    }
                    rows={7}
                    maxLength={1200}
                    placeholder="Describe the learner's response, observed progress, support needed, and relevant clinical details..."
                    className="mt-2 w-full resize-none rounded-[10px] border border-[#e8e8ed] bg-[#fafafd] px-4 py-3.5 text-[13px] leading-6 text-[#202027] outline-none transition placeholder:text-[#aaa9b3] focus:border-[#cfc4df] focus:bg-white"
                    autoFocus
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-semibold text-[#555560]">
                    Recommended Next Steps{" "}
                    <span className="font-normal text-[#9898a3]">
                      (optional)
                    </span>
                  </span>

                  <textarea
                    value={draftNextSteps}
                    onChange={(event) =>
                      setDraftNextSteps(event.target.value)
                    }
                    rows={3}
                    maxLength={500}
                    placeholder="Add a follow-up plan, suggested activity, or instruction for the care team..."
                    className="mt-2 w-full resize-none rounded-[10px] border border-[#e8e8ed] bg-[#fafafd] px-4 py-3.5 text-[13px] leading-6 text-[#202027] outline-none transition placeholder:text-[#aaa9b3] focus:border-[#cfc4df] focus:bg-white"
                  />
                </label>
              </div>

              <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#eeeef2] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeAddNoteModal}
                  className="min-h-[40px] rounded-[8px] border border-[#e8e8ed] bg-white px-4 text-[12px] font-semibold text-[#666672] transition hover:bg-[#f7f7f9]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!draftNote.trim()}
                  className="min-h-[40px] rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Progress Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocCollabScreen;
