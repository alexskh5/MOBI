export type PatientStatus = "active" | "inactive";

export type SpeechLevel =
  | "Sound"
  | "Syllable"
  | "Word"
  | "Phrase"
  | "Sentence"
  | "Conversation";

export type ProgressPeriod = "day" | "week" | "month" | "year";

export interface ProgressChartPoint {
  label: string;
  correct: number;
  incorrect: number;
}

export interface ActivityProgressRecord {
  id: string;
  title: string;
  level: SpeechLevel;
  completedSteps: number;
  totalSteps: number;
  correctAnswers: number;
  wrongAnswers: number;
  successRate: number;
  lastCompleted: string;
}

export interface SocialReadinessData {
  appropriateness: number;
  turnTaking: number;
  engagement: number;
  conversationAttempts: number;
  summary: string;
}

export interface PatientPeriodProgress {
  activitiesCompleted: number;
  wordsPracticed: number;
  focusMinutes: number;
  inactivityMinutes: number;
  correctAnswers: number;
  wrongAnswers: number;
  chartData: ProgressChartPoint[];
  socialReadiness: SocialReadinessData;
  activityRecords: ActivityProgressRecord[];
}

export interface DoctorPatient {
  id: string;
  learnerCode: string;
  firstName: string;
  lastName: string;
  age: number;
  diagnosis: string;
  guardianName: string;
  guardianContact: string;
  speechLevel: SpeechLevel;
  status: PatientStatus;
  lastSession: string | null;
  profilePicture?: string | null;
  progressByPeriod: Record<ProgressPeriod, PatientPeriodProgress>;
}

const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.min(Math.max(value, minimum), maximum);

const chartLabels: Record<ProgressPeriod, string[]> = {
  day: ["8 AM", "10 AM", "1 PM", "3 PM"],
  week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  month: ["Week 1", "Week 2", "Week 3", "Week 4"],
  year: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

const periodMultiplier: Record<ProgressPeriod, number> = {
  day: 1,
  week: 5,
  month: 18,
  year: 90,
};

const createActivityRecords = (
  seed: number,
  period: ProgressPeriod,
): ActivityProgressRecord[] => {
  const multiplier = periodMultiplier[period];

  return [
    {
      id: `activity-${seed}-1`,
      title: "Animal Words",
      level: "Word" as SpeechLevel,
      completedSteps: 5,
      totalSteps: 5,
      correctAnswers: clamp(3 + (seed % 3), 1, 5),
      wrongAnswers: clamp(2 - (seed % 2), 0, 5),
      successRate: clamp(72 + seed * 2, 55, 96),
      lastCompleted:
        period === "day"
          ? "Today, 10:30 AM"
          : period === "week"
            ? "Wednesday"
            : period === "month"
              ? "July 3, 2026"
              : "June 2026",
    },
    {
      id: `activity-${seed}-2`,
      title: "Daily Request Practice",
      level: "Phrase" as SpeechLevel,
      completedSteps: 4,
      totalSteps: 5,
      correctAnswers: clamp(2 + (seed % 3), 1, 5),
      wrongAnswers: clamp(2 + (seed % 2), 0, 5),
      successRate: clamp(65 + seed * 2, 50, 94),
      lastCompleted:
        period === "day"
          ? "Today, 1:15 PM"
          : period === "week"
            ? "Friday"
            : period === "month"
              ? "July 1, 2026"
              : "May 2026",
    },
    {
      id: `activity-${seed}-3`,
      title: "Greetings and Responses",
      level: "Conversation" as SpeechLevel,
      completedSteps: 6,
      totalSteps: 6,
      correctAnswers: clamp(4 + (seed % 2), 1, 6),
      wrongAnswers: clamp(2 - (seed % 2), 0, 6),
      successRate: clamp(76 + seed, 58, 97),
      lastCompleted:
        period === "day"
          ? "Today, 3:00 PM"
          : period === "week"
            ? "Saturday"
            : period === "month"
              ? "June 29, 2026"
              : "April 2026",
    },
  ].map((activity) => ({
    ...activity,
    correctAnswers: Math.min(
      activity.correctAnswers * Math.max(1, Math.round(multiplier / 3)),
      99,
    ),
    wrongAnswers: Math.min(
      activity.wrongAnswers * Math.max(1, Math.round(multiplier / 4)),
      99,
    ),
  }));
};

const createPeriodProgress = (
  seed: number,
  period: ProgressPeriod,
): PatientPeriodProgress => {
  const multiplier = periodMultiplier[period];
  const labels = chartLabels[period];

  const chartData = labels.map((label, index) => {
    const correct = clamp(
      45 + seed * 4 + index * 5 + ((index + seed) % 3) * 4,
      25,
      96,
    );

    return {
      label,
      correct,
      incorrect: clamp(100 - correct, 4, 75),
    };
  });

  const correctAnswers = Math.max(
    3,
    Math.round((8 + seed * 2) * multiplier),
  );

  const wrongAnswers = Math.max(
    1,
    Math.round((3 + (seed % 3)) * multiplier),
  );

  return {
    activitiesCompleted: Math.max(
      1,
      Math.round((2 + (seed % 3)) * multiplier),
    ),
    wordsPracticed: Math.max(
      5,
      Math.round((12 + seed * 3) * multiplier),
    ),
    focusMinutes: Math.max(
      8,
      Math.round((18 + seed * 3) * multiplier),
    ),
    inactivityMinutes: Math.max(
      2,
      Math.round((4 + (seed % 3)) * multiplier),
    ),
    correctAnswers,
    wrongAnswers,
    chartData,
    socialReadiness: {
      appropriateness: clamp(65 + seed * 3, 50, 94),
      turnTaking: clamp(60 + seed * 4, 45, 92),
      engagement: clamp(68 + seed * 2, 50, 95),
      conversationAttempts: Math.max(
        1,
        Math.round((3 + seed) * multiplier),
      ),
      summary:
        "The learner responds well to familiar prompts and shows improving engagement. Continue practicing turn-taking and spontaneous responses using short, structured conversations.",
    },
    activityRecords: createActivityRecords(seed, period),
  };
};

const createProgress = (
  seed: number,
): Record<ProgressPeriod, PatientPeriodProgress> => ({
  day: createPeriodProgress(seed, "day"),
  week: createPeriodProgress(seed, "week"),
  month: createPeriodProgress(seed, "month"),
  year: createPeriodProgress(seed, "year"),
});

export const doctorPatients: DoctorPatient[] = [
  {
    id: "patient-001",
    learnerCode: "MB-2026-001",
    firstName: "Lucas",
    lastName: "Anderson",
    age: 7,
    diagnosis: "Autism Spectrum Disorder",
    guardianName: "Maria Anderson",
    guardianContact: "0917 123 4567",
    speechLevel: "Word",
    status: "active",
    lastSession: "July 5, 2026 • 10:30 AM",
    profilePicture: null,
    progressByPeriod: createProgress(1),
  },
  {
    id: "patient-002",
    learnerCode: "MB-2026-002",
    firstName: "Sophia",
    lastName: "Martinez",
    age: 8,
    diagnosis: "Autism Spectrum Disorder",
    guardianName: "Angela Martinez",
    guardianContact: "0918 234 5678",
    speechLevel: "Phrase",
    status: "active",
    lastSession: "July 4, 2026 • 2:15 PM",
    profilePicture: null,
    progressByPeriod: createProgress(2),
  },
  {
    id: "patient-003",
    learnerCode: "MB-2026-003",
    firstName: "Noah",
    lastName: "Williams",
    age: 6,
    diagnosis: "Speech and Language Delay",
    guardianName: "Daniel Williams",
    guardianContact: "0919 345 6789",
    speechLevel: "Syllable",
    status: "active",
    lastSession: "July 3, 2026 • 9:45 AM",
    profilePicture: null,
    progressByPeriod: createProgress(3),
  },
  {
    id: "patient-004",
    learnerCode: "MB-2026-004",
    firstName: "Emma",
    lastName: "Johnson",
    age: 9,
    diagnosis: "Autism Spectrum Disorder",
    guardianName: "Carla Johnson",
    guardianContact: "0920 456 7890",
    speechLevel: "Sentence",
    status: "inactive",
    lastSession: "June 28, 2026 • 4:00 PM",
    profilePicture: null,
    progressByPeriod: createProgress(4),
  },
  {
    id: "patient-005",
    learnerCode: "MB-2026-005",
    firstName: "Ethan",
    lastName: "Brown",
    age: 10,
    diagnosis: "Autism Spectrum Disorder",
    guardianName: "Michelle Brown",
    guardianContact: "0921 567 8901",
    speechLevel: "Conversation",
    status: "active",
    lastSession: "July 5, 2026 • 11:20 AM",
    profilePicture: null,
    progressByPeriod: createProgress(5),
  },
  {
    id: "patient-006",
    learnerCode: "MB-2026-006",
    firstName: "Mia",
    lastName: "Davis",
    age: 7,
    diagnosis: "Speech and Language Delay",
    guardianName: "Olivia Davis",
    guardianContact: "0922 678 9012",
    speechLevel: "Sound",
    status: "active",
    lastSession: null,
    profilePicture: null,
    progressByPeriod: createProgress(6),
  },
];

export const getDoctorPatientById = (patientId?: string) =>
  doctorPatients.find((patient) => patient.id === patientId);

export const getDoctorPatientFullName = (patient: DoctorPatient) =>
  `${patient.firstName} ${patient.lastName}`.trim();
