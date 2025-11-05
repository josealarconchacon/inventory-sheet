const InventoryTableSection = ({
  title,
  rows,
  sheet,
  onFieldChange,
  totalsHeading = "",
  className = "",
}) => (
  <section className={`inventory-card inventory-motion-fade ${className}`.trim()}>
    <header className="flex flex-col gap-2 border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6 md:flex-row md:items-start md:justify-between md:gap-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-100 sm:text-xl">{title}</h2>
        <p className="text-sm text-slate-400">
          Update each field to keep your counts aligned in real time.
        </p>
      </div>
      {totalsHeading ? (
        <span className="self-start rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 ring-1 ring-inset ring-white/10 md:self-center">
          {totalsHeading}
        </span>
      ) : null}
    </header>

    <div className="divide-y divide-white/5">
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
              className={`group grid gap-4 px-5 py-4 transition-all duration-200 hover:bg-white/5 sm:px-6 sm:py-5 md:grid-cols-[minmax(0,1fr)_minmax(160px,0.55fr)] md:items-center ${
                cellClassName ?? ""
              }`}
            >
              <p className="text-base font-semibold text-slate-200 sm:text-[0.95rem]">
                {label}
              </p>

              <div className="flex w-full items-center justify-end">
                {readOnly ? (
                  <span className="inline-flex min-h-[46px] w-full items-center justify-end rounded-2xl bg-blue-500/10 px-4 text-right text-base font-semibold text-blue-200 ring-1 ring-inset ring-blue-400/40 transition-[transform,box-shadow] duration-200 group-hover:-translate-y-[1px] group-hover:shadow-[0_16px_32px_-28px_rgba(59,130,246,0.65)] md:w-auto">
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
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-semibold text-slate-100 placeholder:text-slate-400/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 focus:border-blue-400/60 focus:bg-blue-500/5 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.28)] focus:outline-none md:min-w-[140px] md:w-auto md:text-right"
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

