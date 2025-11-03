import { formatSoldValue } from '../utils/calculations.js';

const ProductTotalsSection = ({ totals }) => {
  const safeTotals = totals ?? {};

  const rows = [
    {
      key: 'lobster',
      label: 'Total Lobster sold (amount brought minus leftover)',
    },
    {
      key: 'buns',
      label: 'Total Rolls sold (amount brought minus leftover)',
    },
    {
      key: 'oysters',
      label: 'Total Oysters sold (amount brought minus leftover)',
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 shadow-sm backdrop-blur">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Product totals</h2>
          <p className="text-sm text-slate-500">
            See what sold today after factoring starting and ending counts.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
          Live
        </span>
      </header>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-3">
        {rows.map(({ key, label }) => (
          <article
            key={key}
            className="flex flex-col gap-2 rounded-2xl border border-transparent bg-white/80 px-4 py-3 shadow-inner shadow-blue-50 transition hover:border-blue-200 hover:shadow-lg"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Sold today
            </span>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <span className="text-2xl font-bold text-blue-700">
              {formatSoldValue(safeTotals[key])}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductTotalsSection;

