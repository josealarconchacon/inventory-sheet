const SheetNavigation = ({ currentIndex, total, onPrevious, onNext }) => {
  if (total <= 1) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= total - 1;

  return (
    <div className="flex gap-2 justify-center mb-6 items-center text-sm text-gray-600">
      <span>
        Sheet {currentIndex + 1} of {total}
      </span>
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default SheetNavigation;

