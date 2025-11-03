import { ChevronLeft, ChevronRight } from "lucide-react";

const SheetNavigation = ({ currentIndex, total, onPrevious, onNext }) => {
  if (total <= 1) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= total - 1;

  return (
    <nav className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 text-slate-600 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col text-center text-sm font-medium sm:text-left">
        <span className="uppercase tracking-[0.3em] text-xs text-slate-400">
          Sheets
        </span>
        <span className="text-lg font-semibold text-slate-900">
          Sheet {currentIndex + 1} of {total}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous sheet
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Next sheet
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

export default SheetNavigation;

