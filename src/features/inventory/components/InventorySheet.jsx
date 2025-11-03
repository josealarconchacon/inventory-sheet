import DownloadButton from "./DownloadButton.jsx";
import InventoryTableSection from "./InventoryTableSection.jsx";
import ProductTotalsSection from "./ProductTotalsSection.jsx";
import SheetHeader from "./SheetHeader.jsx";
import SheetNavigation from "./SheetNavigation.jsx";

import { useInventorySheets } from "../hooks/useInventorySheets.js";
import { endOfDayRows, startOfDayRows } from "../constants/tableSections.js";

const InventorySheet = () => {
  const {
    sheets,
    currentSheet,
    currentIndex,
    totalSheets,
    isLoading,
    error,
    soldTotals,
    createSheet,
    updateSheetField,
    deleteSheet,
    goToPrevious,
    goToNext,
  } = useInventorySheets();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm backdrop-blur">
            Loading your inventory sheet…
          </div>
        </div>
      </div>
    );
  }

  if (!currentSheet) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm backdrop-blur">
            No inventory sheets available.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <SheetHeader
            sheet={currentSheet}
            onFieldChange={updateSheetField}
            onCreateNew={createSheet}
            downloadButton={
              <DownloadButton sheet={currentSheet} totals={soldTotals} />
            }
          />

          {error && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-700 shadow-sm">
              There was a problem loading your saved sheets. A new sheet has
              been created.
            </div>
          )}

          <SheetNavigation
            currentIndex={currentIndex}
            total={totalSheets}
            onPrevious={goToPrevious}
            onNext={goToNext}
            sheets={sheets}
            onDelete={deleteSheet}
          />

          <section className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            <InventoryTableSection
              title="At the start of the day"
              rows={startOfDayRows}
              sheet={currentSheet}
              totalsHeading="Totals"
              onFieldChange={updateSheetField}
              className="h-full"
            />

            <InventoryTableSection
              title="At the end of the day"
              rows={endOfDayRows}
              sheet={currentSheet}
              totalsHeading="Totals"
              onFieldChange={updateSheetField}
              className="h-full"
            />
          </section>

          <ProductTotalsSection totals={soldTotals} />
        </div>
      </div>
    </div>
  );
};

export default InventorySheet;
