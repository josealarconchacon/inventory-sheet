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
    <table className="w-full border-collapse border border-gray-300 mb-6">
      <thead>
        <tr>
          <th className="bg-gray-200 border border-gray-300 p-3 text-center font-bold" colSpan={2}>
            PRODUCT TOTALS:
          </th>
          <th className="bg-gray-200 border border-gray-300 p-3 w-32" />
        </tr>
      </thead>
      <tbody>
        {rows.map(({ key, label }) => (
          <tr key={key}>
            <td className="border border-gray-300 p-2" colSpan={2}>
              {label}
            </td>
            <td className="border border-gray-300 p-2 text-right font-semibold bg-blue-50">
              {formatSoldValue(safeTotals[key])}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTotalsSection;

