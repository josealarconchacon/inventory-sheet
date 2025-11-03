import { Download } from 'lucide-react';

import { downloadSheetPdf } from '../utils/pdf.js';

const DownloadButton = ({ sheet, totals }) => {
  const handleDownload = () => {
    if (!sheet) {
      return;
    }

    downloadSheetPdf(sheet, totals);
  };

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={handleDownload}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 mx-auto transition-colors"
      >
        <Download size={20} />
        Download as PDF
      </button>
    </div>
  );
};

export default DownloadButton;

