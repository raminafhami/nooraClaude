import { getObjectKeys } from "@/utils/object/getObjectKeys";

interface TaskLike {
  data: {
    [key: string]: any;
  };
}

function isFieldInTaskData({ data }: TaskLike, fieldName: string) {
  return getObjectKeys(data).includes(fieldName);
}

export { isFieldInTaskData };
