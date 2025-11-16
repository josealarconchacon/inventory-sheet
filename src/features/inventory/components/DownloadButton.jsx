import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { isSheetComplete } from "../utils/sheetUtils.js";
import { downloadSheetPdf } from "../utils/pdf.js";

const DownloadButton = ({
  sheet,
  isComplete,
  onDownloadComplete,
  className = "",
}) => {
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
      aria-busy={isDownloading}
      aria-live="polite"
      data-busy={isDownloading}
      className={`inventory-download-button ${className}`.trim()}
    >
      {isDownloading ? (
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin"
          data-testid="loader-icon"
        />
      ) : (
        <Download className="h-4 w-4 shrink-0" data-testid="download-icon" />
      )}
      <span className="font-semibold">Download PDF</span>
    </button>
  );
};

export default DownloadButton;
