import { useEffect, useState } from "react";
import { FaUserCog } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Instance } from "@/felo/instances/models/Instance";
import { Loading } from "@/ui/Loader";

interface Props {
	open: boolean;
	setOpen: (s: boolean) => void;
	submit: (instance: Instance) => void;
	loading: boolean;
	data: Instance[];
}

function ConfirmCopyInstance({
	submit,
	loading: isLoading,
	open,
	data,
	setOpen,
}: Props) {
	const [selectedInstance, setSelectedInstance] = useState<string>();

	useEffect(() => {
		if (data.length === 1) {
			setSelectedInstance(data[0].id);
		}
	}, [data]);

	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						تعداد {data?.length} فرایند با شماره درخواست {data[0].caseNo} یافت
						شد:
					</DialogTitle>
				</DialogHeader>

				<div className="select-none">
					{data.length === 1 ? (
						<div className="cursor-default rounded-xl border border-gray-200 px-4 py-2">
							<div>فرایند {data[0].processName}</div>
						</div>
					) : (
						<div className="space-y-1 rounded-xl border border-gray-200 px-2 py-2">
							{data.map((instance) => (
								<div
									key={instance.id}
									className={`cursor-pointer rounded-lg px-2 transition-all ${
										selectedInstance === instance.id
											? "bg-gray-300"
											: "hover:bg-gray-100"
									}`}
									onClick={() => {
										selectedInstance === instance.id
											? setSelectedInstance(undefined)
											: setSelectedInstance(instance.id);
									}}
								>
									<div className="flex gap-2 py-1 text-black">
										<FaUserCog className="text-base text-black" />
										{instance.processName}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<DialogFooter className="gap-2">
					<Button variant="ghost" onClick={() => setOpen(false)}>
						انصراف
					</Button>

					<Button
						disabled={isLoading || !selectedInstance}
						variant="primary"
						onClick={() => submit(data.find((x) => x.id === selectedInstance)!)}
					>
						<span>ایجاد درخواست</span>
						{isLoading && <Loading size="xs" />}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { ConfirmCopyInstance };
