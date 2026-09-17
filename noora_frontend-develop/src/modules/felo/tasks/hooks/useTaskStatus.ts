"use client";

import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

function useTaskStatus<T extends string>(
	statusFieldId: string,
	options: Partial<{
		isPositive: (status: T) => boolean;
		isNegative: (status: T) => boolean;
	}> = {},
): {
	isNeutral: boolean;
	isPositive: boolean;
	isNegative: boolean;
	isPositiveOrNeutral: boolean;
	isNegativeOrNeutral: boolean;
} {
	const [{ verifiyPositivity, verifiyNegativity }] = useState(() => {
		return {
			verifiyPositivity:
				options.isPositive ??
				((status: T) =>
					["forward", "confirm", "accept"].some((x) => status.startsWith(x))),

			verifiyNegativity:
				options.isNegative ??
				((status: T) =>
					["return", "reject", "cancel"].some((x) => status.startsWith(x))),
		};
	});

	const { watch } = useFormContext();

	const status: T | null | undefined = watch(statusFieldId);

	const result = useMemo(() => {
		const isNeutral = !status;
		const isPositive = !isNeutral && verifiyPositivity(status);
		const isNegative = !isNeutral && verifiyNegativity(status);

		return {
			isNeutral,
			isPositive,
			isNegative,
			isPositiveOrNeutral: isNeutral || isPositive,
			isNegativeOrNeutral: isNeutral || isNegative,
		};
	}, [status, verifiyPositivity, verifiyNegativity]);

	return result;
}

export { useTaskStatus };
