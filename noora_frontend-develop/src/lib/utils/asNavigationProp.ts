function asNavigationProp<T>(obj: T | string | string[]): T {
	return obj as T;
}

export { asNavigationProp };
