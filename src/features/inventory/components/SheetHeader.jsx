import { Plus } from "lucide-react";

const baseInputClasses =
  "h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100";

const SheetHeader = ({ sheet, onFieldChange, onCreateNew, downloadButton }) => {
  if (!sheet) {
    return null;
  }

  const handleFieldChange = (field) => (event) => {
    if (!onFieldChange) {
      return;
    }

    onFieldChange(field, event.target.value);
  };

  return (
    <header className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Oyster Party
          </span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-1xl">
            Beginning + End of Day Inventory
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Manage daily counts with quick updates, built-in totals, and instant
            exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => onCreateNew?.()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            <Plus className="h-4 w-4" />
            New sheet
          </button>

          {downloadButton}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
          Team lead
          <input
            type="text"
            placeholder="Who is on shift?"
            value={sheet.name ?? ""}
            onChange={handleFieldChange("name")}
            className={baseInputClasses}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
          Location
          <input
            type="text"
            placeholder="e.g. Downtown cart"
            value={sheet.location ?? ""}
            onChange={handleFieldChange("location")}
            className={baseInputClasses}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-1">
          Date
          <input
            type="date"
            value={sheet.date ?? ""}
            onChange={handleFieldChange("date")}
            className={baseInputClasses}
          />
        </label>
      </div>
    </header>
  );
};

export default SheetHeader;
