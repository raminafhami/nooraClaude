import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import {
  PhaseLetterFormByAuthor,
  PhaseLetterReviewByDirector,
  PhaseLetterReviewByManager,
  PhaseLetterView,
} from "./phases";

export function getSecretariatOutgoingOutsideLetterTaskDetails(
  task: Task,
): TaskDetailsReturn {
  switch (task.key) {
    case "LetterFormByAuthor":
      return PhaseLetterFormByAuthor;
    case "LetterReviewByManager":
      return PhaseLetterReviewByManager;
    case "LetterReviewByDirector":
      return PhaseLetterReviewByDirector;
    case "LetterViewByAuthor":
    case "LetterViewByManager":
    case "LetterArchiveBySecretary":
      return PhaseLetterView;
    default:
      throw new Error();
  }
}
