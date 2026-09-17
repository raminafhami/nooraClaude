import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroupByName } from "@/identity/groups/services/getGroupByName";
import { getUsers } from "@/identity/users/services/getUsers";
import updateUser from "@/identity/users/services/updateUser";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import { LiaisonRelation } from "@/liaison-relations/models/LiaisonRelation";
import { LiaisonRelationStatus } from "@/liaison-relations/models/LiaisonRelationStatus";
import { LiaisonRelationUser } from "@/liaison-relations/models/LiaisonRelationUser";
import Autocomplete from "@/ui/Autocomplete/Autocomplete";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { compareById } from "@/utils/Comparators";

import { useBranchContext } from "../BranchContext";

interface Props {
	relation: LiaisonRelation | null;
	onEditCancel: () => void;
}

export function BranchRelationsForm({ relation, onEditCancel }: Props) {
	const { branch, relations, onRelationsUpdate } = useBranchContext();

	const [isFormSuccessful, setFormSuccessful] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);

	const {
		control,
		formState,
		handleSubmit: onSubmit,
		reset,
		setError,
		watch,
	} = useForm<FormData>({
		defaultValues: getDefaultValues(relation),
	});

	const { isDirty, isSubmitSuccessful, isSubmitting } = formState;

	const [coordinatorGroupId, setCoordinatorGroupId] = useState<string>("");
	const [coordinators, setCoordinators] = useState<LiaisonRelationUser[]>([]);
	const coordinatorSearchTimeout = useRef<NodeJS.Timeout>();
	async function loadCoordinators(name: string) {
		clearTimeout(coordinatorSearchTimeout.current);
		await new Promise((resolve) => {
			coordinatorSearchTimeout.current = setTimeout(async () => {
				let users: LiaisonRelationUser[] = [];

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
	const [marketers, setMarketers] = useState<LiaisonRelationUser[]>([]);
	const marketerSearchTimeout = useRef<NodeJS.Timeout>();
	async function loadMarketers(name: string) {
		clearTimeout(marketerSearchTimeout.current);
		await new Promise((resolve) => {
			marketerSearchTimeout.current = setTimeout(async () => {
				let users: LiaisonRelationUser[] = [];

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
		let newRelations: LiaisonRelation[] = relations ? [...relations] : [];

		try {
			if (!relation) {
				if (newRelations.length !== 0) {
					const lastRelation: LiaisonRelation = {
						...newRelations.pop()!,
						deactiveAt: new Date(),
						status: LiaisonRelationStatus.Deactive,
					};

					newRelations.push(lastRelation);
				}

				const newRelation: LiaisonRelation = {
					coordinator: values.coordinator ? { ...values.coordinator } : null,
					marketer: values.marketer ? { ...values.marketer } : null,
					createAt: new Date(),
					deactiveAt: null,
					status: LiaisonRelationStatus.Active,
				};

				newRelations.push(newRelation);
			} else {
				const lastRelation: LiaisonRelation = {
					...newRelations.pop()!,
					coordinator: values.coordinator ? { ...values.coordinator } : null,
					marketer: values.marketer ? { ...values.marketer } : null,
				};

				newRelations.push(lastRelation);
			}

			await updateUser(branch.managerId!, {
				metadata: {
					relations: [
						...newRelations.map((x) => ({
							...x,
							coordinator: x.coordinator?.id || null,
							marketer: x.marketer?.id || null,
						})),
					],
				},
			});

			onRelationsUpdate([...newRelations]);
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

			const values = relation ? watch() : getDefaultValues(null);
			reset(values);
		}
	}, [isSubmitSuccessful, relation, reset, watch]);

	useEffect(() => {
		reset(getDefaultValues(relation));
	}, [relation, reset]);

	useEffect(() => {
		if (isFormSuccessful && isDirty) {
			setFormSuccessful(false);
		}
	}, [isDirty, isFormSuccessful]);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>{!relation ? "افزودن ارتباط" : "ویرایش ارتباط"}</Head.Title>
			</Head.Root>

			{isLoading ? (
				<Loading size="sm">در حال دریافت اطلاعات...</Loading>
			) : (
				<form onSubmit={onSubmit(handleSubmit)}>
					<div className="space-y-4">
						{isFormSuccessful && (
							<Alert variant="info">
								<AlertDescription>
									{relation
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
							<Button className="w-24" disabled={!isDirty || isSubmitting}>
								{isSubmitting ? (
									<Loading
										horizontalPlacement="center"
										intent="white"
										size="sm"
									/>
								) : !relation ? (
									"افزودن"
								) : (
									"بروزرسانی"
								)}
							</Button>

							{relation && (
								<Button type="button" variant="outline" onClick={handleReset}>
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

interface FormData {
	coordinator: LiaisonRelationUser | null;
	marketer: LiaisonRelationUser | null;
}

function getDefaultValues(relation: LiaisonRelation | null) {
	return {
		coordinator: relation?.coordinator ?? null,
		marketer: relation?.marketer ?? null,
	};
}
