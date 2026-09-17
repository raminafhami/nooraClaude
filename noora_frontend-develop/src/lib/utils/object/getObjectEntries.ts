import { GenericObject } from "@/ts/GenericObject";

function getObjectEntries<T extends GenericObject>(
  obj: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

export { getObjectEntries };
