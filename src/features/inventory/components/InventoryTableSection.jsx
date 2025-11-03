const InventoryTableSection = ({
  title,
  rows,
  sheet,
  onFieldChange,
  totalsHeading = "",
  className = "",
}) => (
  <section
    className={`rounded-3xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur ${className}`}
  >
    <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">
          Update each field to keep your counts aligned in real time.
        </p>
      </div>
      {totalsHeading ? (
        <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          {totalsHeading}
        </span>
      ) : null}
    </header>

    <div className="divide-y divide-slate-100">
      {rows.map(
        ({
          key,
          label,
          readOnly = false,
          type = "number",
          placeholder,
          prefix = "",
          formatValue,
          cellClassName,
        }) => {
          const value = sheet?.[key] ?? "";
          const displayValue = formatValue ? formatValue(value, sheet) : value;

          return (
            <div
              key={key}
              className={`grid gap-3 px-4 py-3 transition hover:bg-slate-50/60 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] sm:items-center ${
                cellClassName ?? ""
              }`}
            >
              <p className="text-sm font-semibold text-slate-700">{label}</p>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                {readOnly ? (
                  <span className="inline-flex min-w-[120px] justify-end rounded-2xl bg-blue-50 px-4 py-2 text-right text-sm font-semibold text-blue-700">
                    {prefix}
                    {displayValue}
                  </span>
                ) : (
                  <input
                    type={type}
                    inputMode={type === "number" ? "decimal" : undefined}
                    value={value}
                    onChange={(event) => onFieldChange?.(key, event.target.value)}
                    placeholder={placeholder}
                    className="h-11 min-w-[120px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-base font-semibold text-slate-900 placeholder:text-slate-400 shadow-inner transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                )}
              </div>
            </div>
          );
        },
      )}
    </div>
  </section>
);

export default InventoryTableSection;

