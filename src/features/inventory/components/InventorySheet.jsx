import DownloadButton from "./DownloadButton.jsx";
import InventoryTableSection from "./InventoryTableSection.jsx";
import ProductTotalsSection from "./ProductTotalsSection.jsx";
import SheetHeader from "./SheetHeader.jsx";
import SheetNavigation from "./SheetNavigation.jsx";

import { useInventorySheets } from "../hooks/useInventorySheets.js";
import { endOfDayRows, startOfDayRows } from "../constants/tableSections.js";

const InventorySheet = () => {
  const {
    currentSheet,
    currentIndex,
    totalSheets,
    isLoading,
    error,
    soldTotals,
    createSheet,
    updateSheetField,
    goToPrevious,
    goToNext,
  } = useInventorySheets();

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (!currentSheet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        No inventory sheets available.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <SheetHeader
        sheet={currentSheet}
        onFieldChange={updateSheetField}
        onCreateNew={createSheet}
      />

      {error && (
        <div className="mb-4 text-center text-sm text-red-600">
          There was a problem loading your saved sheets. A new sheet has been
          created.
        </div>
      )}

      <SheetNavigation
        currentIndex={currentIndex}
        total={totalSheets}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />

      <InventoryTableSection
        title="AT THE START OF THE DAY:"
        rows={startOfDayRows}
        sheet={currentSheet}
        totalsHeading="TOTALS:"
        onFieldChange={updateSheetField}
      />

      <InventoryTableSection
        title="AT THE END OF THE DAY:"
        rows={endOfDayRows}
        sheet={currentSheet}
        totalsHeading=""
        onFieldChange={updateSheetField}
      />

      <ProductTotalsSection totals={soldTotals} />

      <DownloadButton sheet={currentSheet} totals={soldTotals} />
    </div>
  );
};

export default InventorySheet;
