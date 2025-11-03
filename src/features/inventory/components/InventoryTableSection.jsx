const InventoryTableSection = ({ title, rows, sheet, onFieldChange, totalsHeading = '' }) => (
  <table className="w-full border-collapse border border-gray-300 mb-6">
    <thead>
      <tr>
        <th className="bg-gray-200 border border-gray-300 p-3 text-center font-bold" colSpan={2}>
          {title}
        </th>
        <th className="bg-gray-200 border border-gray-300 p-3 text-right font-bold w-32">
          {totalsHeading}
        </th>
      </tr>
    </thead>
    <tbody>
      {rows.map(({ key, label, readOnly = false, type = 'number', placeholder, prefix = '', formatValue, cellClassName }) => {
        const value = sheet?.[key] ?? '';
        const displayValue = formatValue ? formatValue(value, sheet) : value;

        return (
          <tr key={key}>
            <td className="border border-gray-300 p-2" colSpan={2}>
              {label}
            </td>
            <td className={`border border-gray-300 p-2 ${cellClassName ?? ''}`}>
              {readOnly ? (
                <span className="block text-right font-semibold">
                  {prefix}
                  {displayValue}
                </span>
              ) : (
                <input
                  type={type}
                  value={value}
                  onChange={(event) => onFieldChange?.(key, event.target.value)}
                  placeholder={placeholder}
                  className="w-full text-right border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2"
                />
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export default InventoryTableSection;

