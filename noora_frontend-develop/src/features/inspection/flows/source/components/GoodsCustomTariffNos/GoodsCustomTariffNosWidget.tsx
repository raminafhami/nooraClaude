import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaX } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/form/FieldError";
import { messages } from "@/messages";

import { ids } from "../../models/Ids";

interface FormData {
	[ids.goodsCustomTariffNos]: string;
}

function validateCustomTariffNo(text: string): boolean {
	return /^\d{8}$/.test(text);
}

function GoodsCustomTariffNosWidget({
	required = true,
}: {
	required?: boolean;
}) {
	const [text, setText] = useState<string>("");

	const textInput = useRef<HTMLInputElement>(null);
	const addBtn = useRef<HTMLButtonElement>(null);

	const {
		control,
		clearErrors,
		formState: { errors },
		setError,
		setValue,
		watch,
	} = useFormContext<FormData>();

	const { [ids.goodsCustomTariffNos]: fieldValue } = watch();
	const fieldValueArray: string[] = useMemo(() => {
		return fieldValue?.split(",").filter((x) => x) || [];
	}, [fieldValue]);

	useEffect(() => {
		if (typeof fieldValue === "undefined") {
			setValue(ids.goodsCustomTariffNos, "");
		}
	}, [fieldValue, setValue]);

	return (
		<FormField
			control={control}
			name={ids.goodsCustomTariffNos}
			render={({ field }) => (
				<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<div className="space-y-2">
						<label htmlFor={ids.goodsCustomTariffNos}>
							شماره تعرفه گمرکی کالاها:
						</label>
						<div className="group flex overflow-hidden rounded-xl border border-gray-200 transition focus-within:border-gray-300">
							<Input
								className="rounded-none border-0 border-e"
								id={ids.goodsCustomTariffNos}
								ref={textInput}
								value={text ?? ""}
								onChange={(e) => {
									const value = e.target.value.trim();

									const isValidNo = validateCustomTariffNo(value);
									if (value === "" || isValidNo) {
										clearErrors("root.customTariffNo");
									}

									setText(value);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addBtn.current?.click();
									}
								}}
							/>

							<Button
								ref={addBtn}
								className="h-10 border-none"
								disabled={!text}
								type="button"
								variant="outline"
								onClick={() => {
									clearErrors("root.customTariffNo");

									try {
										const isValidNo = validateCustomTariffNo(text);
										if (!isValidNo) {
											throw new Error(
												"شماره تعرفه گمرکی یک شماره 8 رقمی می باشد.",
											);
										}

										const nextValue = [...fieldValueArray, text].join(",");
										field.onChange(nextValue);

										setText("");
									} catch (err: any) {
										setError("root.customTariffNo", {
											message: err.message,
										});
									} finally {
										textInput.current?.focus();
									}
								}}
							>
								افزودن
							</Button>
						</div>

						<FieldError error={errors["root"]?.customTariffNo} />
					</div>

					<div className="rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
						{fieldValueArray.length !== 0 ? (
							fieldValueArray.map((valueItem) => (
								<div className="mt-1.5 first:mt-0" key={valueItem}>
									<div className="flex items-center gap-x-2">
										<div>
											<FaX
												className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-1 transition-colors hover:bg-red-100 hover:text-red-900"
												onClick={() => {
													field.onChange(
														fieldValueArray
															.filter((x) => x !== valueItem)
															.join(","),
													);
												}}
											/>
										</div>

										<div>{valueItem}</div>
									</div>
								</div>
							))
						) : (
							<div key="empty">-</div>
						)}
					</div>

					<FormMessage />
				</FormItem>
			)}
			rules={{
				required: required && messages.validation.required,
			}}
		/>
	);
}

const MemoizedGoodsCustomTariffNosWidget = memo(GoodsCustomTariffNosWidget);

export { MemoizedGoodsCustomTariffNosWidget as GoodsCustomTariffNosWidget };
