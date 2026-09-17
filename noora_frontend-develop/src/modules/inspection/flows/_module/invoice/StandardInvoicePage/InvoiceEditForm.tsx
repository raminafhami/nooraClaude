import { memo, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { Textarea } from "@/form/textarea";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

import { ids } from "./InvoiceIds";

interface FormData {
	description: string;
}

export const InvoiceEditForm = memo(function InvoiceEditForm() {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const { parameters } = instance;

	const [isFormSuccessful, setFormSuccessful] = useState<boolean>(false);

	const { control, formState, handleSubmit, reset } = useForm<FormData>({
		defaultValues: {
			description: parameters[ids.invoiceDescription],
		},
	});

	const { isDirty, isSubmitSuccessful, isSubmitting } = formState;

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({ description: parameters[ids.invoiceDescription] });
		}
	}, [parameters, isSubmitSuccessful, reset]);

	useEffect(() => {
		if (!isSubmitSuccessful && isFormSuccessful && isDirty) {
			setFormSuccessful(false);
		}
	}, [isDirty, isFormSuccessful, isSubmitSuccessful]);

	return (
		<div className="space-y-6">
			<Head.Root>
				<Head.Title text="اطلاعات فاکتور" />
			</Head.Root>

			<form
				className="space-y-6"
				onSubmit={handleSubmit(async (data) => {
					const { description } = data;

					setFormSuccessful(false);

					try {
						await updateInstanceData(instance.id, {
							[ids.invoiceDescription]: description,
						});

						onInstanceUpdate({ [ids.invoiceDescription]: description });
						setFormSuccessful(true);
					} catch (err: any) {}
				})}
			>
				{isFormSuccessful && !isDirty && (
					<Alert variant="info">
						<AlertDescription>
							اطلاعات فاکتور با موفقیت بروزرسانی گردید.
						</AlertDescription>
					</Alert>
				)}

				<div>
					<div className="space-y-2">
						<label htmlFor="description">توضیحات:</label>
						<Controller
							control={control}
							name="description"
							render={({ field }) => <Textarea {...field} />}
						/>
					</div>
				</div>

				<div className="flex gap-x-2">
					<Button className="min-w-[6rem]" disabled={!isDirty}>
						{isSubmitting ? <Loading size="xs" /> : "بروزرسانی"}
					</Button>
				</div>
			</form>
		</div>
	);
});
