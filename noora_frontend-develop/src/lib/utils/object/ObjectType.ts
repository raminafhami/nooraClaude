type ObjectType<
  TKey extends string | number | symbol = string | number | symbol,
  TValue = any,
> = {
  [key in TKey]: TValue;
};

export type { ObjectType };
