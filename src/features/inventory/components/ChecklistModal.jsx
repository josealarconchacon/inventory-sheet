import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { CHECKLISTS } from "../constants/checklists.js";

const ChecklistModal = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState({});
  const overlayRef = useRef(null);

  const checklist = selectedId
    ? CHECKLISTS.find((c) => c.id === selectedId)
    : null;

  const checkableItems = checklist
    ? checklist.items.filter((i) => !i.isHeading && !i.isNote)
    : [];
  const totalChecked = checklist
    ? checklist.items.filter(
        (item, index) =>
          !item.isHeading && !item.isNote && checked[`${selectedId}-${index}`]
      ).length
    : 0;

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== "Escape") return;
      if (selectedId) setSelectedId(null);
      else onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedId, onClose]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
    setChecked({});
  }, []);

  const handleBack = useCallback(() => {
    setSelectedId(null);
    setChecked({});
  }, []);

  const toggleCheck = useCallback((key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return createPortal(
    <div
      ref={overlayRef}
      className="inventory-checklist-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={checklist ? checklist.label : "Event Checklists"}
    >
      <div className="inventory-checklist-modal inventory-card">
        <div className="inventory-checklist-modal__header">
          {selectedId ? (
            <button
              className="inventory-checklist-nav-btn"
              onClick={handleBack}
              aria-label="Back to checklists"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
            </button>
          ) : (
            <div className="inventory-checklist-nav-spacer" />
          )}

          <div className="inventory-checklist-modal__title-group">
            <span className="inventory-checklist-modal__eyebrow">
              {selectedId ? "Checklist" : "Resources"}
            </span>
            <h2 className="inventory-checklist-modal__title">
              {checklist ? checklist.label : "Event Checklists"}
            </h2>
          </div>

          <button
            className="inventory-checklist-nav-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4 shrink-0" />
          </button>
        </div>

        <div className="inventory-checklist-modal__body">
          {!selectedId ? (
            <div className="inventory-checklist-options">
              <p className="inventory-checklist-options__hint">
                Select a checklist to get started
              </p>
              {CHECKLISTS.map((cl) => (
                <button
                  key={cl.id}
                  className="inventory-checklist-option"
                  onClick={() => handleSelect(cl.id)}
                >
                  <span className="inventory-checklist-option__label">
                    {cl.label}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 inventory-checklist-option__chevron" />
                </button>
              ))}
            </div>
          ) : (
            <div className="inventory-checklist-detail">
              {checkableItems.length > 0 && (
                <div className="inventory-checklist-progress">
                  <div className="inventory-checklist-progress__bar">
                    <div
                      className="inventory-checklist-progress__fill"
                      style={{
                        width: `${(totalChecked / checkableItems.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="inventory-checklist-progress__count">
                    {totalChecked} / {checkableItems.length}
                  </span>
                </div>
              )}

              <ul className="inventory-checklist-items" role="list">
                {checklist.items.map((item, index) => {
                  if (item.isHeading) {
                    return (
                      <li
                        key={index}
                        className="inventory-checklist-item--heading"
                      >
                        {item.text}
                      </li>
                    );
                  }

                  if (item.isNote) {
                    return (
                      <li
                        key={index}
                        className="inventory-checklist-item--note"
                      >
                        {item.text}
                      </li>
                    );
                  }

                  const itemKey = `${selectedId}-${index}`;
                  const isChecked = checked[itemKey] ?? false;

                  return (
                    <li key={index}>
                      <button
                        className={[
                          "inventory-checklist-item",
                          isChecked ? "inventory-checklist-item--checked" : "",
                          item.isSubItem ? "inventory-checklist-item--sub" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => toggleCheck(itemKey)}
                        role="checkbox"
                        aria-checked={isChecked}
                      >
                        <span className="inventory-checklist-item__checkbox">
                          {isChecked && (
                            <svg
                              viewBox="0 0 12 10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="1,5 4.5,9 11,1" />
                            </svg>
                          )}
                        </span>
                        <span className="inventory-checklist-item__text">
                          {item.text}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChecklistModal;
