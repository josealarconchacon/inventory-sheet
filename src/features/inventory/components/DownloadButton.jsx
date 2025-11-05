import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { isSheetComplete } from "../utils/sheetUtils.js";
import { downloadSheetPdf } from "../utils/pdf.js";

const DownloadButton = ({ sheet, isComplete, onDownloadComplete }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const resolvedSheet = useMemo(() => sheet ?? null, [sheet]);
  const sheetIsComplete = useMemo(() => {
    if (typeof isComplete === "boolean") {
      return isComplete;
    }

    return isSheetComplete(resolvedSheet);
  }, [isComplete, resolvedSheet]);

  const isDisabled = !resolvedSheet || !sheetIsComplete || isDownloading;
  const disabledReason = !resolvedSheet
    ? "No inventory sheet to download"
    : !sheetIsComplete
    ? "Complete all fields to enable the download"
    : undefined;

  const handleDownload = async () => {
    if (isDisabled || !resolvedSheet) {
      return;
    }

    try {
      setIsDownloading(true);
      await downloadSheetPdf(resolvedSheet);
      onDownloadComplete?.();
    } catch (error) {
      console.error("Failed to download inventory sheet", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDisabled}
      title={disabledReason}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Download PDF
    </button>
  );
};

export default DownloadButton;
