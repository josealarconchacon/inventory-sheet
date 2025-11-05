import { formatSoldValue } from "../utils/calculations.js";
import { productTotalsRows } from "../constants/tableSections.js";

const ProductTotalsSection = ({ totals }) => {
  const safeTotals = totals ?? {};

  return (
    <section className="inventory-card inventory-motion-fade inventory-motion-delay-3">
      <header className="flex flex-col gap-2 border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6 md:flex-row md:items-center md:justify-between md:gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-100 sm:text-xl">Product totals</h2>
          <p className="text-sm text-slate-400">
            See what sold today after factoring starting and ending counts.
          </p>
        </div>
        <span className="self-start rounded-full bg-blue-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100 ring-1 ring-inset ring-blue-400/40 md:self-center">
          Live
        </span>
      </header>

      <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-3">
        {productTotalsRows.map(({ key, label }) => (
          <article
            key={key}
            className="group flex flex-col items-center gap-2 rounded-2xl bg-white/5 px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:-translate-y-[2px] hover:bg-white/10 hover:shadow-[0_20px_36px_-28px_rgba(59,130,246,0.65)]"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-400">
              Sold today
            </span>
            <p className="text-sm font-medium text-slate-300">{label}</p>
            <span className="text-2xl font-bold text-slate-100 sm:text-[1.65rem]">
              {formatSoldValue(safeTotals[key])}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductTotalsSection;

