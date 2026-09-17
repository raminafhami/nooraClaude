export function compareById(a: any, b: any) {
  return compareByProp("id")(a, b);
}

export function compareByValue(a: any, b: any) {
  return compareByProp("value")(a, b);
}

export function compareByProp(prop: string) {
  return (a: any, b: any) => {
    if (!a || typeof a !== "object" || !b || typeof b !== "object") {
      return false;
    }

    return a[prop] === b[prop];
  };
}
