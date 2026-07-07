import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PeriodKey, PeriodOption } from "./progressTypes";

export type AvailablePeriod = PeriodOption & { enabled: boolean };

export type ProgressGlyph =
  | "arrow-back"
  | "bar-chart"
  | "chat"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "close"
  | "help"
  | "info"
  | "layers-outline"
  | "lock"
  | "pause-circle-outline"
  | "people"
  | "phone-portrait-outline"
  | "search"
  | "text-outline"
  | "time-outline";

export function ProgressIcon({
  name,
  className = "h-5 w-5",
}: {
  name: ProgressGlyph | string;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    className,
    "aria-hidden": true,
  } as const;

  switch (name) {
    case "arrow-back":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6-6 6 6 6" />
        </svg>
      );
    case "bar-chart":
      return (
        <svg {...common}>
          <path strokeLinecap="round" d="M5 20V10m7 10V4m7 16v-7" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5Z" />
          <path strokeLinecap="round" d="M8 9h8M8 12h5" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m7 10 5 5 5-5" />
        </svg>
      );
    case "chevron-up":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m7 14 5-5 5 5" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.7 9a2.5 2.5 0 1 1 3.8 2.1c-.9.5-1.5 1.1-1.5 2.2" />
          <path strokeLinecap="round" d="M12 17h.01" />
        </svg>
      );
    case "layers-outline":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 9 5 9-5M3 16l9 5 9-5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "pause-circle-outline":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M9.5 9v6M14.5 9v6" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="7" r="2.4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20M15 14h1.5a4 4 0 0 1 4 4v2" />
        </svg>
      );
    case "phone-portrait-outline":
      return (
        <svg {...common}>
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path strokeLinecap="round" d="M10 5h4M11 18.5h2" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-4-4" />
        </svg>
      );
    case "text-outline":
      return (
        <svg {...common}>
          <path strokeLinecap="round" d="M5 6h14M12 6v12M8 18h8" />
        </svg>
      );
    case "time-outline":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
        </svg>
      );
  }
}

export function PageHeader({
  title,
  subtitle,
  selectedPeriod,
  periods,
  onSelect,
}: {
  title: string;
  subtitle: string;
  selectedPeriod: PeriodKey;
  periods: AvailablePeriod[];
  onSelect: (period: PeriodKey, enabled: boolean) => void;
}) {
  return (
    <div className="relative z-30 mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-extrabold tracking-tight text-[#171217] sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
          {subtitle}
        </p>
      </div>

      <PeriodDropdown
        selectedPeriod={selectedPeriod}
        periods={periods}
        onSelect={onSelect}
      />
    </div>
  );
}

export function PeriodDropdown({
  selectedPeriod,
  periods,
  onSelect,
}: {
  selectedPeriod: PeriodKey;
  periods: AvailablePeriod[];
  onSelect: (period: PeriodKey, enabled: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selected = periods.find((item) => item.key === selectedPeriod);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative z-50 w-full sm:w-32">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-full border border-[#e8cfe8] bg-[#f7eaf7] px-4 text-xs font-extrabold text-[#8f5aa6] transition hover:bg-[#f2dff3] focus:outline-none focus:ring-4 focus:ring-[#9b6cae]/10"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.label ?? "Day"}
        <ProgressIcon
          name={open ? "chevron-up" : "chevron-down"}
          className="h-4 w-4"
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-12 overflow-hidden rounded-2xl border border-[#eadfeb] bg-white py-1.5 shadow-[0_14px_35px_rgba(50,35,72,0.18)] sm:left-auto sm:w-40"
        >
          {periods.map((item) => {
            const selectedItem = item.key === selectedPeriod;

            return (
              <button
                key={item.key}
                type="button"
                disabled={!item.enabled}
                onClick={() => {
                  onSelect(item.key, item.enabled);
                  setOpen(false);
                }}
                className={`flex min-h-10 w-full items-center justify-between px-4 text-left text-xs font-bold transition ${
                  selectedItem
                    ? "bg-[#f7eaf7] text-[#8f5aa6]"
                    : "text-slate-600 hover:bg-[#faf7fb]"
                } ${!item.enabled ? "cursor-not-allowed opacity-45" : ""}`}
              >
                {item.label}
                {!item.enabled && <ProgressIcon name="lock" className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SearchBox({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <label className="mt-4 flex min-h-11 items-center gap-2 rounded-full border border-white bg-white px-4 shadow-[0_4px_16px_rgba(55,37,67,0.06)] focus-within:border-[#cfadd7] focus-within:ring-4 focus-within:ring-[#a76eb9]/10">
      <span className="text-slate-400">
        <ProgressIcon name="search" className="h-4 w-4" />
      </span>

      <input
        type="search"
        value={value}
        onChange={(event) => onChangeText(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2 text-xs text-[#2d2630] outline-none placeholder:text-slate-400 sm:text-sm"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChangeText("")}
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Clear search"
        >
          <ProgressIcon name="close" className="h-4 w-4" />
        </button>
      )}
    </label>
  );
}

export function TopBackHeader({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-[#eee5f1] hover:text-[#8257bd]"
    >
      <ProgressIcon name="arrow-back" className="h-5 w-5" />
      Back to overview
    </button>
  );
}

export function InfoBox({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(58,39,69,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-sm font-extrabold text-[#171217]">
          {title}
        </h3>
        {value && (
          <p className="shrink-0 text-sm font-extrabold text-[#a16bb4]">
            {value}
          </p>
        )}
      </div>

      {children !== undefined && children !== null && (
        <div className="mt-2 whitespace-pre-line text-xs leading-5 text-[#4f454f] sm:text-sm">
          {children}
        </div>
      )}
    </article>
  );
}

export function EmptyCard({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 text-slate-500 shadow-[0_5px_18px_rgba(58,39,69,0.07)]">
      <span className="mt-0.5 text-[#b48bc7]">
        <ProgressIcon name="info" className="h-5 w-5" />
      </span>
      <p className="text-xs leading-5 sm:text-sm">{message}</p>
    </div>
  );
}

export function BottomPager({
  pageNumber,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
}: {
  pageNumber: string;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-4 flex items-center gap-2 pb-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={previousDisabled}
        className="flex h-8 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition hover:border-[#b48bc7] hover:text-[#8f5aa6] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous progress page"
      >
        <ProgressIcon name="chevron-left" className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex h-8 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition hover:border-[#b48bc7] hover:text-[#8f5aa6] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next progress page"
      >
        <ProgressIcon name="chevron-right" className="h-4 w-4" />
      </button>

      <p className="ml-auto text-xs font-medium text-slate-500">
        {pageNumber} of 4
      </p>
    </div>
  );
}

export function formatList(items: string[]) {
  if (!items || items.length === 0) return "No data available";
  return items.map((item) => `• ${item}`).join("\n");
}
