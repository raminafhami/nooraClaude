function isNavigationProp<T extends object>(
	obj: T | string | null | undefined,
): obj is T {
	return !!obj && typeof obj === "object";
}

export { isNavigationProp };
