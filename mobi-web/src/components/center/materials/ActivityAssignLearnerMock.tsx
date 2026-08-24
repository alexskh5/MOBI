//mobi-web/src/components/center/materials/ActivityAssignLearner.tsx


import { useState } from "react";
import { X } from "lucide-react";

import AssignLearnerModal from "./AssignLearnerModal";

interface Learner {
  id: string;
  name: string;
  level: number;
}

function ActivityAssignLearner() {
  const [showLearnerModal, setShowLearnerModal] =
    useState(false);

  const [assignedLearners, setAssignedLearners] =
    useState<Learner[]>([]);

  // Placeholder data
  const learners: Learner[] = [
    {
      id: "1",
      name: "Harry Potter",
      level: 5,
    },
    {
      id: "2",
      name: "Ron Weasley",
      level: 3,
    },
    {
      id: "3",
      name: "Hermione Granger",
      level: 8,
    },
    {
      id: "4",
      name: "Luna Lovegood",
      level: 4,
    },
    {
      id: "5",
      name: "Pe Be",
      level: 2,
    },
    {
      id: "6",
      name: "Ga Le",
      level: 1,
    },
  ];

  const removeLearner = (
    learnerId: string
  ) => {
    setAssignedLearners(
      assignedLearners.filter(
        (learner) =>
          learner.id !==
          learnerId
      )
    );
  };

  return (
    <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

      {/* HEADER */}
      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">

        <h3 className="font-semibold text-xl">
          Assign activity to a specific learner/s
        </h3>

      </div>

      {/* BODY */}
      <div className="bg-white p-6">

        {/* ASSIGNED LEARNERS */}
        <div className="space-y-3 mb-6">

        {assignedLearners.map(
            (learner) => (
            <div
                key={learner.id}
                className="
                flex
                items-center
                justify-between
                bg-[#EADFF0]
                rounded-2xl
                px-4
                py-3
                "
            >

                <div className="flex items-center gap-3">

                <div
                className="
                    rounded-full
                    bg-white
                    border
                    border-[#C8B9D1]
                    flex
                    items-center
                    justify-center
                    text-lg
                "
                >
                👤
                </div>

                <span className="text-md">
                    {learner.name}
                </span>

                </div>

                <button
                onClick={() =>
                    removeLearner(
                    learner.id
                    )
                }
                className="
                    text-gray-500
                    hover:text-red-500
                "
                >
                <X size={18} />
                </button>

            </div>
            )
        )}

        </div>

        {/* BUTTON */}
        <div className="flex justify-center">

          <button
            onClick={() =>
              setShowLearnerModal(
                true
              )
            }
            className="bg-[#E59BE7] hover:bg-[#DA8EDD] px-6 py-2 rounded-xl"
          >
            + Learner
          </button>

        </div>

      </div>

        <AssignLearnerModal
        isOpen={showLearnerModal}
        onClose={() =>
            setShowLearnerModal(false)
        }
        learners={learners}
        assignedLearners={assignedLearners}
        setAssignedLearners={
            setAssignedLearners
        }
        />

    </div>
  );
}

export default ActivityAssignLearner;