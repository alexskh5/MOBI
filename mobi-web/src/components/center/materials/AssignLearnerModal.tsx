import { useState } from "react";
import { Search } from "lucide-react";

interface Learner {
  id: string;
  name: string;
  level: number;
}

interface AssignLearnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  learners: Learner[];
  assignedLearners: Learner[];
  setAssignedLearners: React.Dispatch<
    React.SetStateAction<Learner[]>
  >;
}

function AssignLearnerModal({
  isOpen,
  onClose,
  learners,
  assignedLearners,
  setAssignedLearners,
}: AssignLearnerModalProps) {

  const [showFilterMenu, setShowFilterMenu] =
    useState(false);

  const [filterOption, setFilterOption] =
    useState("A-Z");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedLearners, setSelectedLearners] =
    useState<string[]>([]);

  const filteredLearners =
    learners.filter((learner) =>
        learner.name
        .toLowerCase()
        .includes(
            searchTerm.toLowerCase()
        )
  );

  const sortedLearners = [
    ...filteredLearners,
  ];

  if (filterOption === "A-Z") {
    sortedLearners.sort(
        (a, b) =>
        a.name.localeCompare(
            b.name
        )
    );
  }

  if (filterOption === "Z-A") {
    sortedLearners.sort(
        (a, b) =>
        b.name.localeCompare(
            a.name
        )
    );
  }

  if (filterOption === "Level ↑") {
    sortedLearners.sort(
      (a, b) => a.level - b.level
    );
  }

  if (filterOption === "Level ↓") {
    sortedLearners.sort(
      (a, b) => b.level - a.level
    );
  }

  if (
    filterOption ===
    "Assigned"
    ) {
    sortedLearners.splice(
        0,
        sortedLearners.length,
        ...sortedLearners.filter(
        (learner) =>
            assignedLearners.some(
            (item) =>
                item.id ===
                learner.id
            )
        )
    );
  }

  if (
    filterOption ===
    "Not Assigned"
    ) {
    sortedLearners.splice(
        0,
        sortedLearners.length,
        ...sortedLearners.filter(
        (learner) =>
            !assignedLearners.some(
            (item) =>
                item.id ===
                learner.id
            )
        )
    );
  }

  const toggleLearner = (
    learnerId: string
  ) => {

    if (
      selectedLearners.includes(
        learnerId
      )
    ) {

      setSelectedLearners(
        selectedLearners.filter(
          (id) =>
            id !== learnerId
        )
      );

    } else {

      setSelectedLearners([
        ...selectedLearners,
        learnerId,
      ]);

    }
  };

  const handleAssign = () => {

    const selectedObjects =
      learners.filter((learner) =>
        selectedLearners.includes(
          learner.id
        )
      );

    const merged =
      [...assignedLearners];

    selectedObjects.forEach(
      (learner) => {

        const exists =
          merged.some(
            (item) =>
              item.id ===
              learner.id
          );

        if (!exists) {
          merged.push(
            learner
          );
        }
      }
    );

    setAssignedLearners(
      merged
    );

    setSelectedLearners([]);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-[#F5EEF6] rounded-[30px] w-full max-w-xl mx-4 p-8">

        <h2 className="text-3xl font-semibold mb-6">
          Assign Learners
        </h2>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm mb-5">

          <Search size={20} />

          <input
            type="text"
            placeholder="Search learner..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full outline-none bg-transparent"
          />

        </div>

        {/* list */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#D9D9D9]">

        {/* Header Row */}
        <div className="relative flex items-center justify-between px-5 py-3 border-b border-[#E5E5E5]">

            <label className="flex items-center gap-2 cursor-pointer">

            <input
                type="checkbox"
                className="
                    h-4
                    w-4
                    accent-[#D68BE0]
                "
                checked={
                sortedLearners.length > 0 &&
                selectedLearners.length ===
                    sortedLearners.length
                }
                onChange={() => {
                if (
                    selectedLearners.length ===
                    sortedLearners.length
                ) {
                    setSelectedLearners([]);
                } else {
                    setSelectedLearners(
                    sortedLearners.map(
                        (learner) =>
                        learner.id
                    )
                    );
                }
                }}
            />

            <span>Select All</span>

            </label>

            <div className="relative">

            <button
                onClick={() =>
                setShowFilterMenu(
                    !showFilterMenu
                )
                }
                className="
                text-sm
                flex
                items-center
                gap-2
                "
            >
                Sort List
                <span>▾</span>
            </button>

            {showFilterMenu && (
                <div
                className="
                    absolute
                    top-full
                    right-0
                    mt-2
                    w-44
                    bg-white
                    border
                    border-[#AAB7DA]
                    rounded-xl
                    shadow-lg
                    overflow-hidden
                    z-20
                "
                >
                {[
                    "A-Z",
                    "Z-A",
                    "Level ↑",
                    "Level ↓",
                    "Assigned",
                    "Not Assigned",
                ].map((option) => (
                    <button
                    key={option}
                    onClick={() => {
                        setFilterOption(
                        option
                        );
                        setShowFilterMenu(
                        false
                        );
                    }}
                    className="
                        w-full
                        text-left
                        px-4
                        py-2
                        hover:bg-[#F5EEF6]
                    "
                    >
                    {option}
                    </button>
                ))}
                </div>
            )}

            </div>

        </div>

        {/* Learner List */}
        <div className="max-h-72 overflow-y-auto">

            {sortedLearners.map(
            (learner) => (

                <button
                key={learner.id}
                onClick={() =>
                    toggleLearner(
                    learner.id
                    )
                }
                className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    border-b
                    border-[#E5E5E5]
                    hover:bg-[#F8F4F8]
                    text-left
                "
                >

                <input
                type="checkbox"
                className="
                    h-4
                    w-4
                    accent-[#D68BE0]
                "
                checked={selectedLearners.includes(
                    learner.id
                )}
                readOnly
                />

                  <div className="flex-1 flex items-center justify-between">

                    <span>
                      {learner.name}
                    </span>

                    <span className="text-sm text-gray-500">
                      Level {learner.level}
                    </span>

                  </div>

                </button>

            )
            )}

        </div>

        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center">

          <p className="text-gray-500">
            Selected:
            {" "}
            {selectedLearners.length}
          </p>

          <div className="flex gap-4">

            <button
              onClick={onClose}
              className="
                px-6
                py-3
                bg-white
                rounded-2xl
              "
            >
              Cancel
            </button>

            <button
              onClick={handleAssign}
              className="
                px-6
                py-3
                bg-[#E59BE7]
                rounded-2xl
              "
            >
              Assign Selected
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AssignLearnerModal;