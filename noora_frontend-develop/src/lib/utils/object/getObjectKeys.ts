import { GenericObject } from "@/ts/GenericObject";

function getObjectKeys<T extends GenericObject>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

export { getObjectKeys };
