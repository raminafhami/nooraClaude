"use client";

import moment from "jalali-moment";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Contract } from "@/hrm/contract/models/Contract";
import { JobDescription } from "@/hrm/jobs";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import downloadTemplate from "@/template-engine/utils/downloadTemplate";

function ContractView({
	contract,
	personnel,
	jobs,
	personnelSignature,
	approverSignature,
}: {
	contract: Contract;
	personnel: Personnel;
	jobs: JobDescription[];
	personnelSignature?: string;
	approverSignature?: string;
}) {
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleClick() {
		try {
			setIsPending(true);

			await downloadTemplate({
				name: "hr/personnel-contract.html",
				output: `قرارداد ${personnel.fullname} شماره ${contract.contractNo}`,
				data: {
					contract: {
						...contract,
						startDate: moment(contract.startDate).format("jYYYY/jMM/jDD"),
						endDate: moment(contract.endDate).format("jYYYY/jMM/jDD"),
						signDate: moment(contract.signDate).format("jYYYY/jMM/jDD"),
					},
					personnel,
					jobs,
					approverSignature,
					personnelSignature,
				},
			});
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دانلود قرارداد رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="flex flex-col items-start">
			<Button disabled={isPending} type="button" onClick={handleClick}>
				<Spinner loading={isPending} size="sm">
					دانلود قرارداد
				</Spinner>
			</Button>
		</div>
	);
}

export { ContractView };
