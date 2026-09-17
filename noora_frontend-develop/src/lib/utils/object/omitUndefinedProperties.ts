import { GenericObject } from "@/ts/GenericObject";

function omitUndefinedProperties<T extends GenericObject>(obj: T): Partial<T> {
  Object.keys(obj).forEach((key) =>
    obj[key] === undefined ? delete obj[key] : {},
  );

  return obj;
}

export { omitUndefinedProperties };
