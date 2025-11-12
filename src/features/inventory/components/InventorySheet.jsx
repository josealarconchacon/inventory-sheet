import { useEffect } from "react";

import DownloadButton from "./DownloadButton.jsx";
import InventoryTableSection from "./InventoryTableSection.jsx";
import ProductTotalsSection from "./ProductTotalsSection.jsx";
import SheetHeader from "./SheetHeader.jsx";
import { useInventorySheets } from "../hooks/useInventorySheets.js";
import { endOfDayRows, startOfDayRows } from "../constants/tableSections.js";
import { initializeTheme } from "../utils/themeService.js";

const InventorySheet = () => {
  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    const enablePersistentStorage = async () => {
      if (typeof navigator === "undefined" || !navigator.storage?.persist)
        return;

      try {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
          const granted = await navigator.storage.persist();
          console.log(
            granted ? "Persistent storage granted" : "Persistent storage denied"
          );
        } else {
          console.log("Storage is already persistent");
        }
      } catch (err) {
        console.warn("Failed to enable persistent storage:", err);
      }
    };

    void enablePersistentStorage();
  }, []);

  const {
    sheet,
    isLoading,
    error,
    soldTotals,
    updateSheetField,
    resetSheet,
    isComplete,
  } = useInventorySheets();

  if (isLoading) {
    return (
      <div className="inventory-app-shell">
        <div className="inventory-app-surface">
          <div className="inventory-card inventory-motion-fade px-6 py-12 text-center text-base font-semibold text-slate-100">
            Loading your inventory sheet…
          </div>
        </div>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="inventory-app-shell">
        <div className="inventory-app-surface">
          <div className="inventory-card inventory-motion-fade px-6 py-12 text-center text-base font-semibold text-slate-100">
            No inventory sheet available.
          </div>
        </div>
      </div>
    );
  }

  const downloadButtonProps = {
    sheet,
    isComplete,
    onDownloadComplete: resetSheet,
  };

  const desktopDownloadButton = (
    <DownloadButton
      {...downloadButtonProps}
      className="hidden w-full md:inline-flex md:w-auto md:min-w-[220px]"
    />
  );

  const mobileDownloadButton = (
    <DownloadButton {...downloadButtonProps} className="w-full" />
  );

  return (
    <div className="inventory-app-shell">
      <main className="inventory-app-surface">
        <div className="space-y-8 sm:space-y-10">
          <SheetHeader
            sheet={sheet}
            onFieldChange={updateSheetField}
            downloadButton={desktopDownloadButton}
          />

          {error && (
            <div className="inventory-card inventory-motion-fade inventory-motion-delay-1 border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-center text-sm font-semibold text-amber-100 shadow-[0_16px_24px_-20px_rgba(251,191,36,0.45)]">
              There was a problem loading your saved sheet. A new sheet has been
              created.
            </div>
          )}

          <section className="inventory-section-group inventory-motion-fade inventory-motion-delay-1">
            <input
              type="radio"
              id="inventory-view-start"
              name="inventory-mobile-view"
              defaultChecked
              className="inventory-view-input"
            />
            <input
              type="radio"
              id="inventory-view-end"
              name="inventory-mobile-view"
              className="inventory-view-input"
            />

            <div className="inventory-mobile-tabs">
              <label
                htmlFor="inventory-view-start"
                className="inventory-mobile-tab"
              >
                Start of Day
              </label>
              <label
                htmlFor="inventory-view-end"
                className="inventory-mobile-tab"
              >
                End of Day
              </label>
            </div>

            <div className="inventory-section-cards space-y-6 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
              <InventoryTableSection
                title="At the start of the day"
                rows={startOfDayRows}
                sheet={sheet}
                totalsHeading="Totals"
                onFieldChange={updateSheetField}
                className="inventory-section-card inventory-section-card--start h-full inventory-motion-delay-1"
              />

              <InventoryTableSection
                title="At the end of the day"
                rows={endOfDayRows}
                sheet={sheet}
                totalsHeading="Totals"
                onFieldChange={updateSheetField}
                className="inventory-section-card inventory-section-card--end h-full inventory-motion-delay-2"
              />
            </div>
          </section>

          <div className="inventory-product-totals">
            <ProductTotalsSection totals={soldTotals} />
          </div>
        </div>
      </main>

      <div className="inventory-mobile-action-bar md:hidden">
        <div className="inventory-mobile-action-bar__panel">
          <div className="inventory-mobile-action-bar__text">
            <span className="inventory-mobile-action-bar__eyebrow">Ready</span>
            <p className="inventory-mobile-action-bar__title">
              Export your report
            </p>
          </div>
          {mobileDownloadButton}
        </div>
      </div>
    </div>
  );
};

export default InventorySheet;
