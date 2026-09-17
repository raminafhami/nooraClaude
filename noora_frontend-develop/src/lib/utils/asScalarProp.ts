function asScalarProp<T>(obj: T): Exclude<T, object> {
	return obj as Exclude<T, object>;
}

export { asScalarProp };
