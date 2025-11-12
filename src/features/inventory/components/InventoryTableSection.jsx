import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const InventoryTableSection = ({
  title,
  rows,
  sheet,
  onFieldChange,
  totalsHeading = "",
  className = "",
}) => {
  const [activeNotePopoverKey, setActiveNotePopoverKey] = useState(null);
  const noteContainerRefs = useRef({});
  const noteTextareaRefs = useRef({});
  const activePopoverRef = useRef(null);
  const [popoverLayout, setPopoverLayout] = useState(null);

  useEffect(() => {
    if (!activeNotePopoverKey || typeof document === "undefined") {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const activeContainer = noteContainerRefs.current[activeNotePopoverKey];
      const activePopover = activePopoverRef.current;

      if (!activeContainer || !document.contains(activeContainer)) {
        setActiveNotePopoverKey(null);
        return;
      }

      if (
        activeContainer.contains(event.target) ||
        (activePopover && activePopover.contains(event.target))
      ) {
        return;
      }

      if (!activeContainer.contains(event.target)) {
        setActiveNotePopoverKey(null);
        setPopoverLayout(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [activeNotePopoverKey]);

  useEffect(() => {
    if (!activeNotePopoverKey) {
      return;
    }

    const textarea = noteTextareaRefs.current[activeNotePopoverKey];

    if (textarea && typeof textarea.focus === "function") {
      textarea.focus({ preventScroll: true });

      if (typeof textarea.setSelectionRange === "function") {
        const length = textarea.value?.length ?? 0;
        textarea.setSelectionRange(length, length);
      }
    }
  }, [activeNotePopoverKey]);

  const registerNoteContainerRef = (rowKey) => (node) => {
    if (node) {
      noteContainerRefs.current[rowKey] = node;
    } else {
      delete noteContainerRefs.current[rowKey];
    }
  };

  const registerNoteTextareaRef = (rowKey) => (node) => {
    if (node) {
      noteTextareaRefs.current[rowKey] = node;
    } else {
      delete noteTextareaRefs.current[rowKey];
    }
  };

  const updatePopoverPosition = useCallback(
    (rowKey) => {
      if (!rowKey || typeof window === "undefined" || typeof document === "undefined") {
        return;
      }

      const container = noteContainerRefs.current[rowKey];

      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const viewportPadding = 24;
      const maxWidth = 352; // ~22rem
      const availableWidth = Math.max(
        200,
        Math.min(maxWidth, window.innerWidth - viewportPadding * 2),
      );

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      let left;
      if (isDesktop) {
        const preferredLeft = rect.right - availableWidth;
        left = Math.min(
          Math.max(preferredLeft, viewportPadding),
          window.innerWidth - viewportPadding - availableWidth,
        );
      } else {
        const fallbackLeft = rect.left;
        left = Math.min(
          Math.max(fallbackLeft, viewportPadding),
          window.innerWidth - viewportPadding - availableWidth,
        );
      }

      const top = Math.min(
        Math.max(rect.bottom + 12, viewportPadding),
        window.innerHeight - viewportPadding,
      );

      setPopoverLayout({
        key: rowKey,
        style: {
          top,
          left,
          width: availableWidth,
        },
      });
    },
    [setPopoverLayout],
  );

  useEffect(() => {
    if (!activeNotePopoverKey) {
      setPopoverLayout(null);
      return undefined;
    }

    const handleReposition = () => {
      updatePopoverPosition(activeNotePopoverKey);
    };

    handleReposition();

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [activeNotePopoverKey, updatePopoverPosition]);

  useEffect(() => {
    if (!activeNotePopoverKey) {
      return;
    }

    const adjustForHeight = () => {
      const popover = activePopoverRef.current;

      if (!popover || typeof window === "undefined") {
        return;
      }

      const rect = popover.getBoundingClientRect();
      const viewportPadding = 24;

      if (rect.bottom > window.innerHeight - viewportPadding) {
        const delta = rect.bottom - (window.innerHeight - viewportPadding);
        setPopoverLayout((previous) => {
          if (!previous || previous.key !== activeNotePopoverKey) {
            return previous;
          }

          const nextTop = Math.max(viewportPadding, previous.style.top - delta);

          if (Math.abs(nextTop - previous.style.top) < 0.5) {
            return previous;
          }

          return {
            ...previous,
            style: {
              ...previous.style,
              top: nextTop,
            },
          };
        });
      }
    };

    const frame = window.requestAnimationFrame(adjustForHeight);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [activeNotePopoverKey]);

  const closeActivePopover = useCallback(() => {
    setActiveNotePopoverKey(null);
    setPopoverLayout(null);
  }, []);

  return (
    <section className={`inventory-card inventory-motion-fade ${className}`.trim()}>
      <header className="flex flex-col gap-2 border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6 md:flex-row md:items-start md:justify-between md:gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-100 sm:text-xl">
            {title}
          </h2>
          <p className="text-sm text-slate-400">
            Update each field to keep your counts aligned in real time.
          </p>
        </div>
        {totalsHeading ? (
          <span className="self-start rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 ring-1 ring-inset ring-white/10 md:self-center">
            {totalsHeading}
          </span>
        ) : null}
      </header>

      <div className="divide-y divide-white/5">
        {rows.map(
          ({
            key,
            label,
            readOnly = false,
            type = "number",
            placeholder,
            prefix = "",
            formatValue,
            cellClassName,
            step,
            min,
            max,
            noteField,
            noteButtonLabel,
            noteCollapseLabel,
            noteEditLabel,
            notePlaceholder,
            noteHint,
            notePopupTitle,
            noteDoneLabel,
          }) => {
            const value = sheet?.[key] ?? "";
            const displayValue = formatValue ? formatValue(value, sheet) : value;
            const showEditablePrefix = !!prefix && !readOnly;
            const noteRawValue = noteField ? sheet?.[noteField] : undefined;
            const noteValue =
              typeof noteRawValue === "string"
                ? noteRawValue
                : noteRawValue === undefined || noteRawValue === null
                ? ""
                : String(noteRawValue);
            const hasNoteValue =
              noteField &&
              ((typeof noteRawValue === "string" && noteRawValue.trim() !== "") ||
                (noteRawValue !== undefined &&
                  noteRawValue !== null &&
                  typeof noteRawValue !== "string"));
            const isPopoverOpen = activeNotePopoverKey === key;
            const resolvedNoteButtonLabel = (() => {
              if (isPopoverOpen) {
                return noteCollapseLabel ?? "Close note";
              }

              if (hasNoteValue) {
                return noteEditLabel ?? noteButtonLabel ?? "Edit note";
              }

              return noteButtonLabel ?? "Add note";
            })();

            const handleNoteButtonClick = () => {
              setActiveNotePopoverKey((previousKey) => {
                if (previousKey === key) {
                  setPopoverLayout(null);
                  return null;
                }

                requestAnimationFrame(() => {
                  updatePopoverPosition(key);
                });

                return key;
              });
            };

            return (
              <div
                key={key}
                className={`group grid gap-4 px-5 py-4 transition-all duration-200 hover:bg-white/5 sm:px-6 sm:py-5 md:grid-cols-[minmax(0,1fr)_minmax(160px,0.55fr)] md:items-center ${
                  cellClassName ?? ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-slate-200 sm:text-[0.95rem]">
                    {label}
                  </p>
                  {noteField ? (
                    <div
                      className="relative flex w-full flex-wrap items-center gap-1 md:inline-flex md:w-auto"
                      ref={registerNoteContainerRef(key)}
                    >
                      <button
                        type="button"
                        onClick={handleNoteButtonClick}
                        className="text-sm font-semibold text-blue-300 underline decoration-blue-300/80 underline-offset-4 transition-colors duration-150 hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      >
                        {resolvedNoteButtonLabel}
                      </button>

                      {isPopoverOpen &&
                      popoverLayout?.key === key &&
                      typeof document !== "undefined"
                        ? createPortal(
                            <div
                              ref={activePopoverRef}
                              className="inventory-note-popover overflow-hidden p-4 shadow-[0_32px_70px_-38px_rgba(15,23,42,0.95)]"
                              style={{
                                position: "fixed",
                                top: `${popoverLayout.style.top}px`,
                                left: `${popoverLayout.style.left}px`,
                                width: `${popoverLayout.style.width}px`,
                                maxWidth: "calc(100vw - 48px)",
                              }}
                            >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="inventory-note-popover__title text-slate-100">
                              {notePopupTitle ?? "Notes"}
                            </p>
                            <button
                              type="button"
                                  onClick={closeActivePopover}
                              className="text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors duration-150 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                            >
                              Close
                            </button>
                          </div>
                          <textarea
                            value={noteValue}
                            onChange={(event) =>
                              onFieldChange?.(noteField, event.target.value)
                            }
                            placeholder={notePlaceholder ?? "Add note"}
                            rows={3}
                            ref={registerNoteTextareaRef(key)}
                            className="w-full resize-y rounded-2xl border border-white/12 bg-slate-900/60 px-3.5 py-3 text-sm font-medium text-slate-100 placeholder:text-slate-400/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 focus:border-blue-400/60 focus:bg-blue-500/12 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.22)] focus:outline-none"
                          />
                          {noteHint ? (
                            <p className="mt-1 text-xs text-slate-400">{noteHint}</p>
                          ) : null}
                          <div className="inventory-note-popover__actions mt-3">
                            <button
                              type="button"
                                  onClick={closeActivePopover}
                              className="rounded-full border border-blue-400/45 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-100 transition-colors duration-150 hover:bg-blue-500/24 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                            >
                              {noteDoneLabel ?? "Done"}
                            </button>
                          </div>
                            </div>,
                            document.body,
                          )
                        : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full items-center justify-end">
                  {readOnly ? (
                    <span className="inline-flex min-h-[46px] w-full items-center justify-end rounded-2xl bg-blue-500/10 px-4 text-right text-base font-semibold text-blue-200 ring-1 ring-inset ring-blue-400/40 transition-[transform,box-shadow] duration-200 group-hover:-translate-y-[1px] group-hover:shadow-[0_16px_32px_-28px_rgba(59,130,246,0.65)] md:w-auto">
                      {prefix}
                      {displayValue}
                    </span>
                  ) : (
                    <div className="flex w-full flex-col items-end md:w-auto md:min-w-[140px]">
                      <div className="relative w-full md:w-auto md:min-w-[140px]">
                        {showEditablePrefix ? (
                          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-300/80">
                            {prefix}
                          </span>
                        ) : null}
                        <input
                          type={type}
                          inputMode={type === "number" ? "decimal" : undefined}
                          value={value}
                          step={step}
                          min={min}
                          max={max}
                          onChange={(event) => onFieldChange?.(key, event.target.value)}
                          placeholder={placeholder}
                          className={`h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-semibold text-slate-100 placeholder:text-slate-400/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 focus:border-blue-400/60 focus:bg-blue-500/5 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.28)] focus:outline-none md:text-right ${
                            showEditablePrefix ? "pl-12" : ""
                          }`}
                        />
                      </div>

                    </div>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
};

export default InventoryTableSection;

