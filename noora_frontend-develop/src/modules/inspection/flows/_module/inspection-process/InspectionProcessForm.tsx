import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { SelectItem } from "@/entities/SelectItem";
import { transferInstanceFiles } from "@/felo/files/services/transferInstanceFiles";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { FieldError } from "@/form/FieldError";
import getUsersByGroupName from "@/identity/users/services/getUsersByGroupName";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import getGoodsInspectionFieldById from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldById";
import { Assignee } from "@/inspection/models/Assignee";
import { InspectionType } from "@/inspection/models/InspectionType";
import { initiateInspectionProcess } from "@/inspection/services/initiateInspectionProcess";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";
import { compareById } from "@/utils/Comparators";
import { zodResolver } from "@hookform/resolvers/zod";

import { ids } from "./InspectionProcessIds";

const schema = z.object({
	inspectionCoordinator: z.custom<Assignee>((data) => !!data, {
		message: messages.validation.required,
	}),
});

type FormData = z.infer<typeof schema>;

interface Props {
	inspectionType: InspectionType;
}

function InspectionProcessForm({ inspectionType }: Props) {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const {
		[ids.assignees]: assignees,
		[ids.inspectionMethod]: inspectionMethod,
		[ids.buyer]: buyer,
		[ids.customName]: customName,
		[ids.goodsDescriptions]: goodsDescriptions,
		[ids.goodsField]: goodsField,
		[ids.proformaNo]: proformaNo,
		[ids.proformaDate]: proformaDate,
		[ids.dischargerName]: dischargerName,
		[ids.dischargerPhoneNo]: dischargerPhoneNo,
	} = instance.parameters;

	const { control, handleSubmit: onSubmit } = useForm<FormData>({
		defaultValues: {
			inspectionCoordinator: assignees["inspectionCoordinator"] ?? undefined,
		},
		resolver: zodResolver(schema),
		reValidateMode: "onSubmit",
	});

	async function handleSubmit(values: FormData) {
		try {
			const inspectionProcess = await getProcessByKey("Inspectors");

			if (!inspectionProcess) {
				throw new Error("process-not-found");
			}

			const createdInstance = await initiateInspectionProcess({
				InspectionCaseNo: instance.caseNo,
				InspectionInstanceId: instance.id,
				InspectionType: inspectionType,
				InspectionExpert: values.inspectionCoordinator.id,
				InspectionExpertName: values.inspectionCoordinator.name,
				InspectionMethod: inspectionMethod || null,
				BuyerName: buyer.name,
				CustomName: customName || null,
				DescriptionOfGoods: (goodsDescriptions as string)
					.split(",")
					.map((x) => x.trim()),
				FieldOfGoods: getGoodsInspectionFieldById(goodsField)?.title || "",
				ProformaNo: proformaNo ?? "",
				ProformaDate: proformaDate ?? "",
				DischargerName: dischargerName ?? "",
				DischargerPhoneNo: dischargerPhoneNo ?? "",
			});

			await transferInstanceFiles({
				sourceInstanceId: instance.id,
				destinationInstanceId: createdInstance.id,
				files: [
					{
						sourceFieldName: "packing_list",
						destinationFieldName: "packing_list",
						destinationFolder: "docs",
					},
					{
						sourceFieldName: "warehouse_receipt",
						destinationFieldName: "warehouse_receipt",
						destinationFolder: "docs",
					},
				],
			});

			const updatedData = {
				[ids.assignees]: {
					...assignees,
					inspectionCoordinator: values.inspectionCoordinator,
				},
				[ids.inspectionInstanceId]: createdInstance.id,
				[ids.inspectionCaseNo]: createdInstance.caseNo,
			};

			await updateInstanceData(instance.id, updatedData);

			onInstanceUpdate(updatedData);
		} catch (err) {
			console.error(err);
		}
	}

	const [coordinators, setCoordinators] = useState<Assignee[]>();

	const coordinatorOptions = useMemo<SelectItem<Assignee>[]>(
		() =>
			coordinators?.map((x) => ({
				label: x.name,
				value: { id: x.id, name: x.name },
			})) ?? [],
		[coordinators],
	);

	useEffect(() => {
		(async () => {
			const users = await getUsersByGroupName("inspection-coordinator");
			setCoordinators(
				users.map((user) => ({ id: user.id, name: user.fullname })),
			);
		})();
	}, []);

	return (
		<form
			className="grid grid-cols-1 space-y-6 md:grid-cols-3 lg:grid-cols-4"
			onSubmit={onSubmit(handleSubmit)}
		>
			<div className="col-span-1 col-start-1 space-y-2">
				<label htmlFor="inspectionCoordinator">هماهنگ کننده بازرسی:</label>
				<Controller
					control={control}
					name="inspectionCoordinator"
					render={({ field, fieldState }) => (
						<>
							<Select
								compareFn={compareById}
								id={field.name}
								items={coordinatorOptions}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
				/>
			</div>

			<div className="col-span-full col-start-1 flex">
				<Button>ایجاد فرایند بازرسی</Button>
			</div>
		</form>
	);
}

export { InspectionProcessForm };
