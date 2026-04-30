import { useState } from "react";
import { Info } from "lucide-react";
import ChecklistModal from "./ChecklistModal.jsx";

const InfoButton = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`inventory-theme-toggle ${className}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open event checklists"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Info className="h-4 w-4 shrink-0" />
      </button>
      {isOpen && <ChecklistModal onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default InfoButton;
