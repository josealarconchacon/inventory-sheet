import { Download } from "lucide-react";

import { endOfDayRows, startOfDayRows } from "../constants/tableSections.js";
import { downloadSheetPdf } from "../utils/pdf.js";

const editableRows = [...startOfDayRows, ...endOfDayRows].filter(
  ({ readOnly }) => !readOnly
);

const DownloadButton = ({ sheet, totals }) => {
  const isSheetComplete = editableRows.every(({ key }) => {
    const value = sheet?.[key];

    if (value === undefined || value === null) {
      return false;
    }

    return String(value).trim() !== "";
  });

  const isDisabled = !sheet || !isSheetComplete;

  const handleDownload = () => {
    if (!sheet) {
      return;
    }

    downloadSheetPdf(sheet, totals);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDisabled}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      title={
        isDisabled
          ? "Add all start and end counts before downloading the PDF."
          : undefined
      }
    >
      <Download className="h-4 w-4" />
      Download PDF
    </button>
  );
};

export default DownloadButton;
