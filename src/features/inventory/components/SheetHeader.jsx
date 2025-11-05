const baseInputClasses =
  "h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-semibold text-slate-100 placeholder:text-slate-400/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 focus:border-blue-400/60 focus:bg-blue-500/5 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.28)] focus:outline-none";

const SheetHeader = ({ sheet, onFieldChange, downloadButton }) => {
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
    <header className="inventory-card inventory-motion-fade px-5 py-6 sm:px-7 sm:py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3 text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-200">
            Oyster Party
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-100 sm:text-4xl">
              Daily Inventory
            </h1>
            <p className="text-sm text-slate-300 md:max-w-lg">
              Stay aligned from opening to close. Keep your product counts,
              cash totals, and sales insights synced in one polished view.
            </p>
          </div>
        </div>

        {downloadButton ? (
          <div className="flex w-full justify-center md:w-auto md:justify-end">
            {downloadButton}
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
          Team lead
          <input
            type="text"
            placeholder="Who is on shift?"
            value={sheet.name ?? ""}
            onChange={handleFieldChange("name")}
            className={baseInputClasses}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
          Location
          <input
            type="text"
            placeholder="e.g. Downtown cart"
            value={sheet.location ?? ""}
            onChange={handleFieldChange("location")}
            className={baseInputClasses}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200 sm:col-span-2 lg:col-span-1">
          Date
          <input
            type="date"
            value={sheet.date ?? ""}
            onChange={handleFieldChange("date")}
            className={`${baseInputClasses} inventory-date-input`}
          />
        </label>
      </div>
    </header>
  );
};

export default SheetHeader;
