type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

type MergeUnion<T> = {
	[K in keyof UnionToIntersection<T>]: UnionToIntersection<T>[K];
};

type IsSingleKeyObjectUnion<T> = T extends any
	? T extends object
		? keyof T extends infer K
			? K extends string
				? [K] extends [keyof T]
					? true
					: false
				: false
			: false
		: false
	: false;

type NormalizeUnionObjectProps<T> = {
	[K in keyof T]: T[K] extends object
		? IsSingleKeyObjectUnion<T[K]> extends true
			? MergeUnion<T[K]>
			: T[K]
		: T[K];
};

type IsPlainObject<T> = T extends object
	? T extends any[]
		? false
		: T extends (...args: any[]) => any
			? false
			: true
	: false;

type NestedPaths<T> = T extends object
	? {
			[K in keyof T & (string | number)]: IsPlainObject<T[K]> extends true
				? `${K}` | `${K}.${NestedPaths<T[K]>}`
				: `${K}`;
		}[keyof T & (string | number)]
	: never;

type FirstPathSegment<P extends string> = P extends `${infer Head}.${string}`
	? Head
	: P;

type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? T[K] extends object
			? { [R in Rest]: PathValue<T[K], Rest> }
			: never
		: never
	: P extends keyof T
		? T[P]
		: never;

type PickPaths<T, Paths extends readonly string[]> = NormalizeUnionObjectProps<{
	[P in Paths[number] as FirstPathSegment<P>]: PathValue<T, P>;
}>;

function pick<T extends object, const K extends readonly NestedPaths<T>[]>(
	obj: T,
	keys: K,
): PickPaths<T, K> {
	const result = {} as PickPaths<T, K>;

	for (const path of keys) {
		const parts = path.split(".");
		let src: any = obj;
		let dst: any = result;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!(part in src)) break;

			if (i === parts.length - 1) {
				dst[part] = src[part];
			} else {
				if (!(part in dst)) dst[part] = {};
				src = src[part];
				dst = dst[part];
			}
		}
	}

	return result;
}

function createPicker<T extends object>() {
	return <const K extends readonly NestedPaths<T>[]>(keys: K) => {
		return (obj: T): PickPaths<T, K> => pick(obj, keys);
	};
}

export { pick, createPicker };
