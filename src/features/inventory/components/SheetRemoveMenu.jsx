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
  const safeSheets = Array.isArray(sheets) ? sheets : [];
  const isDisabled = safeSheets.length <= 1;

  const options = useMemo(
    () =>
      safeSheets.map((sheet, index) => ({
        id: sheet.id,
        label: describeSheet(sheet, index),
      })),
    [safeSheets],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(currentSheetId ?? options[0]?.id ?? "");
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
        setIsOpen(false);
      }
    };

    if (!isOpen) {
      return undefined;
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleRemove = (sheetId) => {
    if (!sheetId) {
      return;
    }

    const sheetLabel = options.find((option) => option.id === sheetId)?.label;

    const confirmed = window.confirm(
      sheetLabel
        ? `Delete ${sheetLabel}? This action cannot be undone.`
        : "Delete this sheet? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    onRemove?.(sheetId);
    setIsOpen(false);
  };

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
            {options.map(({ id, label }, index) => {
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
    </div>
  );
};

export default SheetRemoveMenu;

