import {
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface StepMenuProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
}

function StepMenu({
  onMoveUp,
  onMoveDown,
  onDelete,
}: StepMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-2xl font-bold"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">

          <button
            onClick={() => {
              onMoveUp?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-[#F8EFF9]"
          >
            <ArrowUp size={16} />
            <span>Move Up</span>
          </button>

          <button
            onClick={() => {
              onMoveDown?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-[#F8EFF9]"
          >
            <ArrowDown size={16} />
            <span>Move Down</span>
          </button>

          <div className="border-t border-gray-200" />

          <button
            onClick={() => {
              onDelete?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={16} />
            <span>Delete Step</span>
          </button>

        </div>
      )}
    </div>
  );
}

export default StepMenu;