import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
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

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m20 20-4-4"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 5h5v5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14 19 5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"
      />
    </svg>
  );
}

function AddIcon() {
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
        d="M12 5v14M5 12h14"
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

function PersonIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 21a7 7 0 0 1 14 0"
      />
    </svg>
  );
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
  size?: "small" | "medium";
}) {
  const sizeClass =
    size === "small" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

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
        className={`${sizeClass} shrink-0 rounded-full border-2 border-white object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border border-[#ccb9d0] bg-white font-bold text-[#bb84bb]`}
      aria-label={`${name} avatar`}
    >
      {initials || <PersonIcon className="h-5 w-5" />}
    </div>
  );
}

function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-[#1f1b24]">
      {children}
    </h2>
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

  const fullName = `${selectedPatient.firstName} ${selectedPatient.lastName}`;

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
    const shareText = `${fullName}, ${selectedPatient.age} years old: Progress Notes`;

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
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e8ddea] bg-white/95 px-4 backdrop-blur lg:hidden">
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
              Collaboration
            </p>
            <p className="truncate text-xs text-slate-500">
              Progress notes and care team
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 lg:px-7 lg:py-5 xl:px-9">
          <section className="overflow-hidden rounded-[30px] bg-[#edd9ef] shadow-[0_12px_36px_rgba(75,43,78,0.08)]">
            {/* Top heading area */}
            <div className="flex flex-col gap-4 border-b border-[#cfb8d1] px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-9">
              <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Collaboration
              </h1>

              <div className="flex w-full items-center gap-3 lg:max-w-[590px]">
                <div className="relative min-w-0 flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                    <SearchIcon />
                  </div>

                  <input
                    type="search"
                    value={patientSearch}
                    onChange={handlePatientSearch}
                    placeholder="Search patient"
                    className="h-12 w-full rounded-xl border border-white/70 bg-white/75 pl-11 pr-4 text-sm text-[#2d2730] shadow-[0_3px_8px_rgba(67,43,70,0.18)] outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-4 focus:ring-white/35"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[#56d7df] transition hover:bg-white/45 hover:text-[#20bac4]"
                  aria-label="Share progress notes"
                  title="Share progress notes"
                >
                  <ShareIcon />
                </button>
              </div>
            </div>

            {/* Selected patient title */}
            <div className="flex flex-col gap-3 px-5 py-4 sm:px-7 md:flex-row md:items-center md:justify-between lg:px-9">
              <h2 className="text-xl font-bold text-black sm:text-2xl">
                {fullName}, {selectedPatient.age} years old: Progress Notes
              </h2>

              <button
                type="button"
                onClick={() => setIsAddNoteOpen(true)}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-[#76507e] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#65416d] md:self-auto"
              >
                <AddIcon />
                Add note
              </button>
            </div>

            {/* Main collaboration content */}
            <div className="grid gap-3 px-4 pb-5 sm:px-5 lg:grid-cols-[235px_minmax(0,1fr)] lg:px-6">
              {/* Left column */}
              <aside className="space-y-3">
                <section className="overflow-hidden rounded-[28px] bg-white/90">
                  <div className="px-5 pb-2 pt-5">
                    <PanelTitle>Select patient</PanelTitle>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pb-4">
                    {filteredPatients.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-slate-500">
                        No patient found.
                      </p>
                    ) : (
                      filteredPatients.map((patient) => {
                        const patientName = `${patient.firstName} ${patient.lastName}`;
                        const isSelected =
                          patient.id === selectedPatient.id;

                        return (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() =>
                              setSelectedPatientId(patient.id)
                            }
                            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-base transition ${
                              isSelected
                                ? "bg-[#f1e3f2] text-[#f16139]"
                                : "text-[#282329] hover:bg-[#f7eef7]"
                            }`}
                          >
                            <Avatar
                              name={patientName}
                              image={patient.profilePicture}
                              size="small"
                            />
                            <span className="truncate">
                              {patientName}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="rounded-[28px] bg-white/90 px-5 py-5">
                  <PanelTitle>Assigned Doctor</PanelTitle>

                  <div className="mt-3 flex items-center gap-2 text-[#f16139]">
                    <Avatar
                      name={selectedPatient.assignedDoctor.name}
                      size="small"
                    />
                    <span className="truncate text-base">
                      {selectedPatient.assignedDoctor.isCurrentUser
                        ? "You"
                        : selectedPatient.assignedDoctor.name}
                    </span>
                  </div>

                  <div className="mt-6">
                    <PanelTitle>Assigned Therapist</PanelTitle>

                    <div className="mt-3 space-y-2">
                      {selectedPatient.assignedTherapists.map(
                        (therapist) => (
                          <div
                            key={therapist.id}
                            className="flex items-center gap-2 text-[#f16139]"
                          >
                            <Avatar
                              name={therapist.name}
                              size="small"
                            />
                            <span className="truncate text-base">
                              {therapist.name}, {therapist.role}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </section>
              </aside>

              {/* Right notes panel */}
              <section className="min-w-0 overflow-hidden bg-white shadow-[0_3px_5px_rgba(70,50,72,0.26)]">
                <div className="flex flex-col gap-3 border-b border-[#c8bfc9] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bold text-[#221d24]">
                    Progress Notes
                  </h3>

                  <div className="inline-flex self-start overflow-hidden rounded-md bg-[#aeb9d2] text-[11px] text-white sm:self-auto">
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
                        className={`px-3 py-1.5 transition ${
                          notePeriod === value
                            ? "bg-white text-[#ff6845]"
                            : "hover:bg-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-[495px] p-4 sm:p-5">
                  {visibleNotes.length === 0 ? (
                    <div className="flex min-h-[420px] items-center justify-center text-center">
                      <div>
                        <p className="text-lg font-semibold text-slate-500">
                          No notes in this period
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          Add a clinical note or select a longer period.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visibleNotes.map((note) => (
                        <article
                          key={note.id}
                          className="grid gap-3 sm:grid-cols-[92px_minmax(0,1fr)]"
                        >
                          <div className="pt-1">
                            <p className="text-sm font-medium text-[#f16139]">
                              {note.source}
                            </p>
                            <p className="text-sm font-bold text-[#1e1a20]">
                              {note.dateLabel}
                            </p>
                          </div>

                          <div
                            className={`rounded-[18px_0_0_18px] px-5 py-4 ${
                              note.isCurrentUser
                                ? "bg-[#efb7ed]"
                                : "bg-[#eaddea]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar
                                name={note.authorName}
                                size="small"
                              />

                              <p className="min-w-0 truncate text-lg font-medium text-[#241e26]">
                                {note.authorName}
                                {note.authorRole
                                  ? `, ${note.authorRole}`
                                  : ""}
                              </p>
                            </div>

                            {(note.category || note.title) && (
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {note.category && (
                                  <span className="rounded-full bg-white/65 px-2.5 py-1 text-[11px] font-semibold text-[#714b77]">
                                    {note.category}
                                  </span>
                                )}

                                {note.title && (
                                  <p className="text-sm font-bold text-[#2f2632]">
                                    {note.title}
                                  </p>
                                )}
                              </div>
                            )}

                            <p className="mt-3 text-sm leading-6 text-[#201c22]">
                              {note.content}
                            </p>

                            {note.nextSteps && (
                              <div className="mt-4 rounded-xl bg-white/55 px-4 py-3">
                                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#78537e]">
                                  Recommended next steps
                                </p>
                                <p className="mt-1 text-sm leading-5 text-[#342b36]">
                                  {note.nextSteps}
                                </p>
                              </div>
                            )}
                          </div>
                        </article>
                      ))}

                      <div className="flex items-center justify-center gap-3 py-4 text-sm text-slate-400">
                        <span className="h-px w-24 border-t border-dashed border-slate-400" />
                        <span>Nothing follows</span>
                        <span className="h-px w-24 border-t border-dashed border-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>

      {noteSavedMessage && (
        <div className="fixed right-4 top-4 z-[90] rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl">
          {noteSavedMessage}
        </div>
      )}

      {/* Add Note Modal */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-3 py-5 backdrop-blur-[3px] sm:px-5">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eadfeb] px-5 py-5 sm:px-7">
              <div>
                <p className="font-accent text-sm font-semibold text-[#8257bd]">
                  Clinical collaboration
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#241f26] sm:text-2xl">
                  Add progress note
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Record an observation or recommendation for {fullName}.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddNoteModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#f4ebf5] hover:text-[#7a4b80]"
                aria-label="Close add note modal"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-5 px-5 py-6 sm:px-7">
                <div className="flex items-center gap-3 rounded-2xl border border-[#eadfeb] bg-[#faf7fb] p-4">
                  <Avatar
                    name={fullName}
                    image={selectedPatient.profilePicture}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#2b252d]">
                      {fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedPatient.age} years old • Note date: Today
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-[#302832]">
                      Note category
                    </span>
                    <select
                      value={draftNoteCategory}
                      onChange={(event) =>
                        setDraftNoteCategory(event.target.value as NoteCategory)
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                    >
                      <option value="Observation">Observation</option>
                      <option value="Recommendation">Recommendation</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-[#302832]">
                      Note title <span className="font-normal text-slate-400">(optional)</span>
                    </span>
                    <input
                      type="text"
                      value={draftNoteTitle}
                      onChange={(event) => setDraftNoteTitle(event.target.value)}
                      maxLength={80}
                      placeholder="e.g. Improved turn-taking"
                      className="mt-2 h-12 w-full rounded-xl border border-[#dfd2e1] bg-[#fcf9fc] px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#a877ae] focus:bg-white focus:ring-4 focus:ring-[#a877ae]/12"
                    />
                  </label>
                </div>

                <label className="block">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#302832]">
                      Progress note
                    </span>
                    <span className="text-xs text-slate-400">
                      {draftNote.length}/1200
                    </span>
                  </div>

                  <textarea
                    id="progress-note"
                    value={draftNote}
                    onChange={(event) => setDraftNote(event.target.value)}
                    rows={7}
                    maxLength={1200}
                    placeholder="Describe the learner's response, observed progress, support needed, and relevant clinical details..."
                    className="mt-2 w-full resize-none rounded-2xl border border-[#dfd1e1] bg-[#fcf9fc] px-4 py-4 text-sm leading-6 text-[#282229] outline-none transition placeholder:text-slate-400 focus:border-[#b789bc] focus:bg-white focus:ring-4 focus:ring-[#b789bc]/15"
                    autoFocus
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#302832]">
                    Recommended next steps <span className="font-normal text-slate-400">(optional)</span>
                  </span>
                  <textarea
                    value={draftNextSteps}
                    onChange={(event) => setDraftNextSteps(event.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Add a follow-up plan, suggested activity, or instruction for the care team..."
                    className="mt-2 w-full resize-none rounded-2xl border border-[#dfd1e1] bg-[#fcf9fc] px-4 py-3 text-sm leading-6 text-[#282229] outline-none transition placeholder:text-slate-400 focus:border-[#b789bc] focus:bg-white focus:ring-4 focus:ring-[#b789bc]/15"
                  />
                </label>
              </div>

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-[#eadfeb] bg-white px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={closeAddNoteModal}
                  className="rounded-xl border border-[#ddd0df] px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-[#f7f1f7]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!draftNote.trim()}
                  className="rounded-xl bg-[#76507e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#65416d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save progress note
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
