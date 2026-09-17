"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroupByName } from "@/identity/groups/services/getGroupByName";
import getUserById from "@/identity/users/services/getUserById";
import { getUsers } from "@/identity/users/services/getUsers";
import updateUser from "@/identity/users/services/updateUser";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import {
	CustomerRelation,
	CustomerRelationStatus,
} from "@/inspection/customers/interfaces";
import Autocomplete from "@/ui/Autocomplete/Autocomplete";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { compareById } from "@/utils/Comparators";

import { RelationUser } from "./RelationUser";

type FormAction = "create" | "edit";

interface FormData {
	coordinator: RelationUser | null;
	marketer: RelationUser | null;
}

function getDefaultValues(relation: CustomerRelation | null) {
	return {
		coordinator: (relation?.coordinator as RelationUser | null) ?? null,
		marketer: (relation?.marketer as RelationUser | null) ?? null,
	};
}

interface Props {
	userId: string;
	relation: CustomerRelation | null;
	onEditCancel: () => void;
	onUpdate: () => void;
}

function RelationsForm({ userId, relation, onEditCancel, onUpdate }: Props) {
	const [submittedformAction, setSubmittedFormAction] =
		useState<FormAction>("create");
	const [isFormSuccessful, setFormSuccessful] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);

	const {
		control,
		formState,
		handleSubmit: onSubmit,
		reset,
		setError,
	} = useForm<FormData>({
		defaultValues: getDefaultValues(relation),
	});

	const { isDirty, isSubmitSuccessful, isSubmitting } = formState;

	const [coordinatorGroupId, setCoordinatorGroupId] = useState<string>("");
	const [coordinators, setCoordinators] = useState<RelationUser[]>([]);
	const coordinatorSearchTimeout = useRef<NodeJS.Timeout>();
	async function loadCoordinators(name: string) {
		clearTimeout(coordinatorSearchTimeout.current);
		await new Promise((resolve) => {
			coordinatorSearchTimeout.current = setTimeout(async () => {
				let users: RelationUser[] = [];

				if (name) {
					users = await getUsers({
						filters: {
							groups: coordinatorGroupId,
							...searchUserFullname(name),
						},
					}).then((users) =>
						users.map((user) => ({ id: user.id, name: user.fullname })),
					);
				}

				setCoordinators(users);
				resolve(null);
			}, 500);
		});
	}

	const [marketerGroupId, setMarketerGroupId] = useState<string>("");
	const [marketers, setMarketers] = useState<RelationUser[]>([]);
	const marketerSearchTimeout = useRef<NodeJS.Timeout>();
	async function loadMarketers(name: string) {
		clearTimeout(marketerSearchTimeout.current);
		await new Promise((resolve) => {
			marketerSearchTimeout.current = setTimeout(async () => {
				let users: RelationUser[] = [];

				if (name) {
					users = await getUsers({
						filters: {
							groups: marketerGroupId,
							...searchUserFullname(name),
						},
					}).then((users) =>
						users.map((user) => ({ id: user.id, name: user.fullname })),
					);
				}

				setMarketers(users);
				resolve(null);
			}, 500);
		});
	}

	async function handleSubmit(values: FormData) {
		try {
			const user = await getUserById(userId);

			let nextRelations: CustomerRelation[] = user.metadata?.relations ?? [];

			if (!relation) {
				if (nextRelations.length !== 0) {
					const lastRelation: CustomerRelation = {
						...nextRelations.pop()!,
						deactiveAt: new Date(),
						status: CustomerRelationStatus.Deactive,
					};

					nextRelations.push(lastRelation);
				}

				const relation: CustomerRelation = {
					coordinator: values.coordinator ? values.coordinator.id : null,
					marketer: values.marketer ? values.marketer.id : null,
					createAt: new Date(),
					deactiveAt: null,
					status: CustomerRelationStatus.Active,
				};

				nextRelations.push(relation);
			} else {
				const lastRelation: CustomerRelation = {
					...nextRelations.pop()!,
					coordinator: values.coordinator ? values.coordinator.id : null,
					marketer: values.marketer ? values.marketer.id : null,
				};

				nextRelations.push(lastRelation);
			}

			await updateUser(userId, {
				metadata: {
					relations: nextRelations,
				},
			});

			onUpdate();
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطایی در ثبت اطلاعات رخ داد.",
			});
		}
	}

	function handleReset() {
		setFormSuccessful(false);
		onEditCancel();
	}

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);

				const [coordinatorGroup, marketerGroup] = await Promise.all([
					getGroupByName(UserGroupType.Role, "coordinator"),
					getGroupByName(UserGroupType.Role, "marketer"),
				]);

				if (!coordinatorGroup) {
					throw new Error("نقش هماهنگ کننده یافت نشد.");
				} else {
					setCoordinatorGroupId(coordinatorGroup.id);
				}

				if (!marketerGroup) {
					throw new Error("نقش بازاریاب یافت نشد.");
				} else {
					setMarketerGroupId(marketerGroup.id);
				}
			} catch (err: any) {
				console.error(err);
				setError("root.server", {
					message: err?.message || "خطایی در دریافت اطلاعات رخ داد.",
				});
			} finally {
				setLoading(false);
			}
		})();
	}, [setError]);

	useEffect(() => {
		if (isSubmitSuccessful) {
			setFormSuccessful(true);
			setSubmittedFormAction(relation ? "edit" : "create");
			onEditCancel();
			reset(getDefaultValues(null));
		}
	}, [isSubmitSuccessful, onEditCancel, relation, reset]);

	useEffect(() => {
		reset(getDefaultValues(relation));
	}, [relation, reset]);

	useEffect(() => {
		if (isFormSuccessful && isDirty) {
			setFormSuccessful(false);
		}
	}, [isDirty, isFormSuccessful]);

	return (
		<div className="space-y-8 lg:col-span-1 xl:col-span-2">
			<Head.Root>
				<Head.Title>{!relation ? "افزودن ارتباط" : "ویرایش ارتباط"}</Head.Title>
			</Head.Root>

			{isLoading ? (
				<Loading verticalPlacement="start" size="sm">
					در حال دریافت اطلاعات...
				</Loading>
			) : (
				<form onSubmit={onSubmit(handleSubmit)}>
					<div className="space-y-4">
						{isFormSuccessful && (
							<Alert variant="info">
								<AlertDescription>
									{submittedformAction === "edit"
										? "ارتباط مورد نظر با موفقیت ویرایش گردید."
										: "ارتباط مورد نظر با موفقیت افزوده شد."}
								</AlertDescription>
							</Alert>
						)}

						<div className="flex gap-x-4">
							<label className="shrink-0 basis-24 pt-2" htmlFor="coordinator">
								هماهنگ کننده:
							</label>
							<div className="grow">
								<Controller
									control={control}
									name="coordinator"
									render={({ field, fieldState }) => (
										<>
											<Autocomplete
												compareFn={compareById}
												items={coordinators}
												label="name"
												onInput={loadCoordinators}
												{...field}
											/>
											<FieldError error={fieldState.error} />
										</>
									)}
								/>
							</div>
						</div>

						<div className="flex gap-x-4">
							<label className="shrink-0 basis-24 pt-2" htmlFor="marketer">
								بازاریاب:
							</label>
							<div className="grow">
								<Controller
									control={control}
									name="marketer"
									render={({ field, fieldState }) => (
										<>
											<Autocomplete
												compareFn={compareById}
												items={marketers}
												label="name"
												onInput={loadMarketers}
												{...field}
											/>
											<FieldError error={fieldState.error} />
										</>
									)}
								/>
							</div>
						</div>

						<div className="ms-28 flex gap-x-2">
							<Button
								className="flex w-24 items-center gap-2"
								disabled={!isDirty || isSubmitting}
							>
								{isSubmitting && <Loading size="xs" />}
								<span>{!relation ? "افزودن" : "بروزرسانی"}</span>
							</Button>

							{relation && (
								<Button
									disabled={isSubmitting}
									type="button"
									variant="ghost"
									onClick={handleReset}
								>
									انصراف
								</Button>
							)}
						</div>
					</div>
				</form>
			)}
		</div>
	);
}

export { RelationsForm };
