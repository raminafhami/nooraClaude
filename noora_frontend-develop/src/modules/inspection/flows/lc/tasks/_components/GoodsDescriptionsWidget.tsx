import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaTimes } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { messages } from "@/messages";

import { ids } from "../../models/Ids";

interface FormData {
	[ids.goodsDescriptions]: string;
}

interface Props {
	required?: boolean;
}

export const GoodsDescriptionsWidget = memo(function GoodsDescriptionsWidget({
	required = true,
}: Props) {
	const [description, setDescription] = useState<string>("");

	const descriptionInp = useRef<HTMLInputElement>(null);
	const addBtn = useRef<HTMLButtonElement>(null);

	const {
		formState: { errors },
		register,
		setValue,
		watch,
	} = useFormContext<FormData>();
	const fields = watch();

	const { [ids.goodsDescriptions]: goodsDescriptionsString } = fields;
	const goodsDescriptions: string[] = useMemo(() => {
		return goodsDescriptionsString?.split(",").filter((x) => x) || [];
	}, [goodsDescriptionsString]);

	useEffect(() => {
		register(ids.goodsDescriptions, {
			required: required && messages.validation.required,
		});
	}, [register, required]);

	useEffect(() => {
		if (goodsDescriptionsString === undefined) {
			setValue(ids.goodsDescriptions, "");
		}
	}, [goodsDescriptionsString, setValue]);

	return (
		<div className="col-span-6 col-start-1 space-y-2">
			<div className="space-y-2">
				<label htmlFor="description">شرح کالاها:</label>
				<div className="group flex overflow-hidden rounded-xl border border-gray-200 transition focus-within:border-gray-300">
					<Input
						className="rounded-none border-0 border-e"
						id="authority"
						ref={descriptionInp}
						value={description ?? ""}
						onChange={(e) => {
							setDescription(e.target.value);
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
						className="rounded-none border-none"
						disabled={!description}
						size="lg"
						type="button"
						variant="outline"
						onClick={() => {
							setValue(
								ids.goodsDescriptions,
								goodsDescriptionsString
									? `${goodsDescriptionsString},${description}`
									: description,
							);
							setDescription("");
							descriptionInp.current?.focus();
						}}
					>
						افزودن
					</Button>
				</div>
			</div>

			<div className="rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
				{goodsDescriptions.length !== 0 ? (
					goodsDescriptions.map((description) => (
						<div className="mt-1.5 first:mt-0" key={description}>
							<div className="flex items-center">
								<div>
									<FaTimes
										className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-red-100 hover:text-red-900"
										onClick={() => {
											setValue(
												ids.goodsDescriptions,
												goodsDescriptions
													.filter((x) => x !== description)
													.join(","),
											);
										}}
									/>
								</div>

								<div className="ms-2">{description}</div>
							</div>
						</div>
					))
				) : (
					<div key="empty">-</div>
				)}
			</div>

			<FieldError error={errors[ids.goodsDescriptions]} />
		</div>
	);
});
