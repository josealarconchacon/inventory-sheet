import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

const describeSheet = (sheet, index) => {
  const base = `Sheet ${index + 1}`;

  if (!sheet) {
    return base;
  }

  const detailParts = [];

  if (sheet.date) {
    detailParts.push(sheet.date);
  }

  if (sheet.name) {
    detailParts.push(sheet.name);
  } else if (sheet.location) {
    detailParts.push(sheet.location);
  }

  if (detailParts.length === 0) {
    return base;
  }

  return `${base} • ${detailParts.join(" • ")}`;
};

const SheetRemoveMenu = ({ sheets, currentSheetId, onRemove }) => {
  const safeSheets = useMemo(
    () => (Array.isArray(sheets) ? sheets : []),
    [sheets]
  );
  const isDisabled = safeSheets.length <= 1;

  const options = useMemo(
    () =>
      safeSheets.map((sheet, index) => ({
        id: sheet.id,
        label: describeSheet(sheet, index),
      })),
    [safeSheets]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(
    currentSheetId ?? options[0]?.id ?? ""
  );
  const [pendingSheet, setPendingSheet] = useState(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (currentSheetId && currentSheetId !== activeId) {
      setActiveId(currentSheetId);
    }
  }, [currentSheetId, activeId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !menuRef.current ||
        menuRef.current.contains(event.target) ||
        triggerRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    if (!isOpen) {
      return undefined;
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (pendingSheet) {
          setPendingSheet(null);
        } else {
          setIsOpen(false);
        }
      }
    };

    if (!isOpen && !pendingSheet) {
      return undefined;
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, pendingSheet]);

  const handleRemove = (sheetId) => {
    if (!sheetId) {
      return;
    }

    const sheetLabel = options.find((option) => option.id === sheetId)?.label;
    setPendingSheet({
      id: sheetId,
      label: sheetLabel,
    });
    setIsOpen(false);
  };

  const handleCancelRemoval = () => {
    setPendingSheet(null);
  };

  const handleConfirmRemoval = () => {
    if (!pendingSheet?.id) {
      return;
    }

    onRemove?.(pendingSheet.id);
    setPendingSheet(null);
  };

  const confirmMessage = pendingSheet?.label
    ? `Delete ${pendingSheet.label}? This action cannot be undone.`
    : "Delete this sheet? This action cannot be undone.";

  return (
    <div className="relative z-30">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        disabled={isDisabled}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Trash2 className="h-4 w-4" />
        Manage sheets
      </button>

      {isOpen && !isDisabled ? (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white/95 py-2 shadow-xl shadow-slate-400/20 backdrop-blur"
        >
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Remove a sheet
          </p>

          <ul className="max-h-64 overflow-auto">
            {options.map(({ id, label }) => {
              const isActive = id === activeId;

              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm font-semibold transition hover:bg-red-50 ${
                      isActive ? "text-red-600" : "text-slate-700"
                    }`}
                  >
                    <span>
                      {label}
                      {isActive ? (
                        <span className="block text-xs font-medium text-red-500">
                          Currently viewing
                        </span>
                      ) : null}
                    </span>
                    <Trash2 className="h-4 w-4 shrink-0 text-red-500" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {pendingSheet ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Sheet deletion confirmation"
          onClick={handleCancelRemoval}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Delete sheet
              </h2>
              <p className="mt-2 text-sm text-slate-600">{confirmMessage}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelRemoval}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoval}
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SheetRemoveMenu;
