// mobi-web/src/components/center/materials/ActivityAssignLearner.tsx

import {
  useEffect,
  useState,
} from "react";


import type {
  Dispatch,
  SetStateAction,
} from "react";

import { getLearners } from "../../../services/learner/learnerApi";

import type {
  LearnerListItem,
} from "../../../services/learner/learnerApi";



interface ActivityAssignLearnerProps {
  selectedLearners: string[];

  setSelectedLearners: Dispatch<
    SetStateAction<string[]>
  >;

  assignmentType:
    | "center_library"
    | "assigned_only";

  setAssignmentType: Dispatch<
    SetStateAction<
      "center_library" | "assigned_only"
    >
  >;
}

function ActivityAssignLearner({
  selectedLearners,
  setSelectedLearners,
  assignmentType,
  setAssignmentType,
}: ActivityAssignLearnerProps) {

  const [loading, setLoading] =
    useState(true);

  const [learners, setLearners] =
    useState<LearnerListItem[]>([]);


  useEffect(() => {
    async function loadLearners() {
      try {
        const response =
          await getLearners({
            page: 1,
            limit: 100,
          });

        setLearners(response.learners);
      } catch (error) {
        console.error(
          "Unable to load learners:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadLearners();
  }, []);

  function toggleLearner(
    id: string,
  ) {
    setSelectedLearners(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (learnerId) =>
                learnerId !== id,
            )
          : [
              ...previous,
              id,
            ],
    );
  }


  return (
    <div className="bg-white border border-[#E59BE7] rounded-[30px] p-6">

      <h2 className="font-itim text-3xl mb-6">
        Assign Learners
      </h2>

      <div className="space-y-3 mb-6">

        <label className="flex items-center gap-3">

          <input
            type="radio"
            checked={
              assignmentType ===
              "center_library"
            }
            onChange={() =>
              setAssignmentType(
                "center_library",
              )
            }
          />

          <span>
            Available in Center Library
          </span>

        </label>

        <label className="flex items-center gap-3">

          <input
            type="radio"
            checked={
              assignmentType ===
              "assigned_only"
            }
            onChange={() =>
              setAssignmentType(
                "assigned_only",
              )
            }
          />

          <span>
            Assigned Learners Only
          </span>

        </label>

      </div>

      <div className="border rounded-xl max-h-72 overflow-y-auto p-4">

        {loading && (
          <p>Loading learners...</p>
        )}

        {!loading &&
          learners.length === 0 && (
            <p>
              No learners found.
            </p>
          )}

        {!loading &&
          learners.map((learner) => (
            <label
              key={learner.id}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedLearners.includes(
                  learner.id,
                )}
                onChange={() =>
                  toggleLearner(
                    learner.id,
                  )
                }
              />

              <span>
                {learner.firstName}{" "}
                {learner.lastName}
              </span>

            </label>
          ))}

      </div>

      <div className="mt-5 text-sm text-gray-500">

        Selected:
        {" "}
        {selectedLearners.length}

      </div>

    </div>
  );
}

export default ActivityAssignLearner;