"use client";

import { useCallback, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from "@/components/ui/command";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { addParticipantsToCourse } from "@/courses/services/addParticipantsToCourse";
import { User } from "@/identity/users/models/User";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import searchUserPhoneNo from "@/identity/users/utils/searchUserPhoneNo";
import { cn } from "@/lib/utils";

import { useCourseContext } from "../useCourseContext";

function CourseParticipantAddDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<Conditional mount={open} delay>
				<CourseParticipantAddForm onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

function CourseParticipantAddForm({ onClose }: { onClose: () => void }) {
	const { course } = useCourseContext();

	const [isPending, setIsPending] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [participants, setParticipants] = useState<User[]>([]);

	const handleParticipantAdd = useCallback((participant: User) => {
		setParticipants((previous) => {
			const dupParticipant = previous.some((x) => x.id === participant.id);
			if (dupParticipant) {
				return previous;
			}

			return [...previous, participant];
		});
	}, []);

	const handleParticipantRemove = useCallback(
		(_: unknown, participant: User) => {
			const nextParticipants = participants.filter(
				(x) => x.id !== participant.id,
			);

			setParticipants(nextParticipants);
		},
		[participants],
	);

	async function handleSubmit() {
		try {
			setIsPending(true);
			setErrorMessage(undefined);

			await addParticipantsToCourse(
				course.id,
				participants.map((x) => x.id),
			);
			onClose();
		} catch (err: any) {
			console.error(err);
			setErrorMessage(
				err?.message || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<DialogContent
			className="max-w-screen-lg"
			onInteractOutside={(event) => {
				if (participants.length) {
					event.preventDefault();
				}
			}}
		>
			<DialogHeader>
				<DialogTitle>افزودن شرکت کنندگان جدید</DialogTitle>
			</DialogHeader>

			<fieldset className="space-y-8" disabled={isPending}>
				<div className="grid grid-cols-12 gap-6">
					<UserSelect onSelect={handleParticipantAdd} />
				</div>

				<div className="-mx-6">
					<Table
						slotProps={{
							root: {
								className: "border-x-0 rounded-none",
							},
						}}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-1">#</TableHead>
								<TableHead>نام</TableHead>
								<TableHead className="w-36">کد ملی</TableHead>
								<TableHead className="w-36">شماره همراه</TableHead>
								<TableHead className="w-64">پست الکترونیک</TableHead>
								<TableHead className="w-1">عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{participants.length ? (
								participants.map((participant, index) => (
									<TableRow key={participant.id} className="whitespace-nowrap">
										<TableCell>{index + 1}</TableCell>
										<TableCell>{participant.fullname}</TableCell>
										<TableCell className="tracking-wide">
											{participant.nationalCode || "-"}
										</TableCell>
										<TableCell className="tracking-wide">
											{participant.phoneNo || "-"}
										</TableCell>
										<TableCell>
											<div className="w-full max-w-64 overflow-hidden text-ellipsis">
												{participant.email || "-"}
											</div>
										</TableCell>
										<TableCell>
											<TooltipProvider>
												<TableActions>
													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	className="h-full focus-within:text-red-600 hover:text-red-600 active:text-red-700"
																	size="icon"
																	variant="ghost"
																	onClick={handleParticipantRemove.bind(
																		null,
																		undefined,
																		participant,
																	)}
																>
																	<FaTrash />
																</Button>
															</TooltipTrigger>
															<TooltipContent>حذف</TooltipContent>
														</TableAction>
													</Tooltip>
												</TableActions>
											</TooltipProvider>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell className="text-muted-foreground" colSpan={100}>
										هنوز هیچ شرکت کننده جدیدی ثبت نشده است.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{errorMessage && (
					<DestructiveAlert>
						<AlertDescription>{errorMessage}</AlertDescription>
					</DestructiveAlert>
				)}

				<div className="flex flex-col gap-3 xs:flex-row-reverse">
					<Button
						className="min-w-24"
						disabled={!participants.length}
						variant="primary"
						onClick={handleSubmit}
					>
						<Spinner color="white" loading={isPending} size="sm">
							افزودن
						</Spinner>
					</Button>

					<Button variant="ghost" onClick={() => onClose()}>
						بازگشت
					</Button>
				</div>
			</fieldset>
		</DialogContent>
	);
}

function UserSelect({ onSelect }: { onSelect: (participant: User) => void }) {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [value, setValue] = useState<string>("");
	const [debouncedValue] = useDebounce(value, 500);
	const [participants, setParticipants] = useState<User[]>();

	const handleSelect = useCallback(
		(_: unknown, participant: User) => {
			onSelect(participant);
			setValue("");
			setIsOpen(false);
		},
		[onSelect],
	);

	useEffect(() => {
		(async () => {
			if (!debouncedValue) {
				setParticipants(undefined);
				return;
			}

			try {
				setIsPending(true);

				const participants = await getUsers({
					filters: {
						$or: [
							searchUserFullname(debouncedValue),
							searchUserPhoneNo(debouncedValue),
						],
					},
					pagination: { page: 0, pageSize: 100 },
				});

				setParticipants(participants.items);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات کاربران رخ داد.");
			} finally {
				setIsPending(false);
			}
		})();
	}, [debouncedValue]);

	return (
		<div className="col-span-full space-y-2">
			<div>
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<Button variant="default" role="combobox">
							انتخاب از کاربران
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-full min-w-96 p-0">
						<Command shouldFilter={false}>
							<CommandInput
								value={value}
								slotProps={{
									root: { className: cn(!participants && "border-b-0") },
								}}
								onValueChange={setValue}
							/>
							<CommandList>
								{isPending && <CommandLoading>در حال جستجو...</CommandLoading>}
								{participants && (
									<CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>
								)}
								<CommandGroup>
									{participants?.map((participant) => (
										<CommandItem
											value={participant.id}
											key={participant.id}
											onSelect={handleSelect.bind(null, undefined, participant)}
										>
											{participant.fullname}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}

export { CourseParticipantAddDialog };
