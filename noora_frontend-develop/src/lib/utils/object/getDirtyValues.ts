import { ObjectType } from "./ObjectType";

function getDirtyValues<T extends ObjectType>(
  dirtyFields: Partial<{ [key in keyof T]: boolean | undefined }>,
  values: T,
): Partial<typeof values> {
  const dirtyValues = Object.keys(dirtyFields).reduce((prev, key) => {
    // Unsure when RFH sets this to `false`, but omit the field if so.
    if (!dirtyFields[key]) return prev;

    return {
      ...prev,
      [key]:
        typeof dirtyFields[key] === "object"
          ? getDirtyValues(dirtyFields[key], values[key])
          : values[key],
    };
  }, {});

  return dirtyValues;
}

export { getDirtyValues };
