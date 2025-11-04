import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, Download, Info, Loader2 } from "lucide-react";

import {
  describeSheet,
  getSheetIdentifier,
  isSheetComplete,
} from "../utils/sheetUtils.js";
import { downloadSheetsPdf } from "../utils/pdf.js";

const mapSheetsToOptions = (sheets) => {
  if (!Array.isArray(sheets)) {
    return [];
  }

  return sheets
    .map((sheet, index) => {
      if (!sheet) {
        return null;
      }

      const id = getSheetIdentifier(sheet, `sheet-${index}`);

      return {
        id,
        index,
        sheet,
        isComplete: isSheetComplete(sheet),
        label: describeSheet(sheet, index),
      };
    })
    .filter(Boolean);
};

const DownloadButton = ({ sheets, currentSheetId }) => {
  const options = useMemo(() => mapSheetsToOptions(sheets), [sheets]);
  const completeOptions = useMemo(
    () => options.filter((option) => option.isComplete),
    [options]
  );
  const incompleteOptions = useMemo(
    () => options.filter((option) => !option.isComplete),
    [options]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => {
    const preferred = completeOptions.find(
      (option) => option.id === currentSheetId
    );

    if (preferred) {
      return [preferred.id];
    }

    return completeOptions[0] ? [completeOptions[0].id] : [];
  });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPosition, setPanelPosition] = useState(null);

  const isTriggerDisabled = completeOptions.length === 0;
  const selectedSheets = useMemo(
    () =>
      options
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => option.sheet),
    [options, selectedIds]
  );
  const isDownloadDisabled =
    selectedSheets.length === 0 || isDownloading || isTriggerDisabled;

  const updatePanelPosition = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const triggerElement = triggerRef.current;

    if (!triggerElement) {
      return;
    }

    const rect = triggerElement.getBoundingClientRect();
    const width = 352;
    const spacing = 12;
    const horizontalMargin = 16;

    const viewportWidth = window.innerWidth;
    const rawLeft = rect.right + window.scrollX - width;
    const maxLeft = viewportWidth - horizontalMargin - width;
    const safeLeft = Math.min(Math.max(rawLeft, horizontalMargin), maxLeft);

    setPanelPosition({
      top: rect.bottom + window.scrollY + spacing,
      left: safeLeft,
      width,
    });
  }, []);

  useEffect(() => {
    const completeIds = new Set(completeOptions.map((option) => option.id));
    setSelectedIds((previous) => {
      const filtered = previous.filter((id) => completeIds.has(id));

      let nextSelection = filtered;

      if (filtered.length === 0 && completeOptions.length > 0) {
        const fallback =
          completeOptions.find((option) => option.id === currentSheetId) ??
          completeOptions[0];
        nextSelection = fallback ? [fallback.id] : [];
      }

      const previousKey = previous.join("|");
      const nextKey = nextSelection.join("|");

      if (previousKey === nextKey) {
        return previous;
      }

      return nextSelection;
    });
  }, [completeOptions, currentSheetId]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updatePanelPosition();

    const handleClickOutside = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        triggerRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleViewportChange = () => {
      updatePanelPosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, updatePanelPosition]);

  const toggleSelected = (optionId) => {
    setSelectedIds((previous) => {
      if (previous.includes(optionId)) {
        return previous.filter((id) => id !== optionId);
      }

      return [...previous, optionId];
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(completeOptions.map((option) => option.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleDownload = async () => {
    if (isDownloadDisabled) {
      return;
    }

    try {
      setIsDownloading(true);
      await downloadSheetsPdf(selectedSheets);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to download inventory sheets", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isTriggerDisabled) {
            setIsOpen((previous) => {
              const next = !previous;

              if (!next) {
                return next;
              }

              updatePanelPosition();
              return next;
            });
          }
        }}
        disabled={isTriggerDisabled || isDownloading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="sheet-download-panel"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download PDF
      </button>

      {isOpen && panelPosition
        ? createPortal(
            <div
              ref={panelRef}
              id="sheet-download-panel"
              className="fixed z-[120] overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-500/20 backdrop-blur"
              role="dialog"
              aria-label="Download sheets"
              style={{
                top: panelPosition.top,
                left: panelPosition.left,
                width: panelPosition.width,
              }}
            >
          <div className="border-b border-slate-100 px-5 pb-4 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Download sheets
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Pick the reports you want to include before exporting your PDF.
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto px-5 py-4">
            {options.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                Create a sheet to enable downloads.
              </div>
            ) : null}

            {completeOptions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Ready to export
                </p>
                <div className="space-y-2">
                  {completeOptions.map((option) => {
                    const isChecked = selectedIds.includes(option.id);
                    const details = [];

                    if (option.sheet?.date) {
                      details.push(option.sheet.date);
                    }

                    if (option.sheet?.location) {
                      details.push(option.sheet.location);
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleSelected(option.id)}
                        disabled={isDownloading}
                        role="checkbox"
                        aria-checked={isChecked}
                        className={`group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                          isChecked
                            ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-200"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/60"
                        } ${isDownloading ? "cursor-wait" : "cursor-pointer"}`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            isChecked
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-slate-300 bg-white text-transparent group-hover:border-blue-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-900">
                            {option.label}
                            {option.id === currentSheetId ? (
                              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                                <Check className="h-3 w-3" />
                                Viewing
                              </span>
                            ) : null}
                          </span>
                          {details.length > 0 ? (
                            <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                              {details.join(" • ")}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {incompleteOptions.length > 0 ? (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Needs attention
                </p>
                <div className="space-y-2">
                  {incompleteOptions.map((option) => {
                    const details = [];

                    if (option.sheet?.date) {
                      details.push(option.sheet.date);
                    }

                    if (option.sheet?.location) {
                      details.push(option.sheet.location);
                    }

                    return (
                      <div
                        key={option.id}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                      >
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-300">
                          <Info className="h-3 w-3" />
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-600">
                            {option.label}
                          </span>
                          {details.length > 0 ? (
                            <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                              {details.join(" • ")}
                            </span>
                          ) : null}
                          <span className="text-xs text-slate-500">
                            Fill in every field to include this sheet in your export.
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/40 px-5 py-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 transition hover:text-blue-500 disabled:text-slate-400"
                disabled={isDownloading || completeOptions.length === 0}
              >
                Select all
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-600 disabled:text-slate-300"
                disabled={isDownloading || selectedIds.length === 0}
              >
                Clear
              </button>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloadDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </button>
          </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default DownloadButton;
