import { Plus } from 'lucide-react';

const SheetHeader = ({ sheet, onFieldChange, onCreateNew }) => {
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
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold mb-4">BEGINNING + END OF DAY INVENTORY SHEET</h1>
      <div className="flex gap-4 justify-center mb-4 items-center">
        <input
          type="text"
          placeholder="Name"
          value={sheet.name ?? ''}
          onChange={handleFieldChange('name')}
          className="border border-gray-300 rounded px-3 py-2 w-48"
        />
        <input
          type="text"
          placeholder="Location"
          value={sheet.location ?? ''}
          onChange={handleFieldChange('location')}
          className="border border-gray-300 rounded px-3 py-2 w-48"
        />
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={sheet.date ?? ''}
            onChange={handleFieldChange('date')}
            className="border border-gray-300 rounded px-3 py-2 w-48"
          />
          <button
            type="button"
            onClick={() => onCreateNew?.()}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
            title="Create new sheet"
            aria-label="Create new sheet"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SheetHeader;

