import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ContractAddendums } from "@/hrm/contract/components/ContractAddendums";
import { ContractView } from "@/hrm/contract/components/ContractView";
import { getUserSignature } from "@/hrm/contract/flows/personnel-contract/services/getUserSignature";
import { Contract } from "@/hrm/contract/models/Contract";
import { getContractById } from "@/hrm/contract/services/getContractById";
import { JobService } from "@/hrm/jobs/JobService";
import { JobDescription } from "@/hrm/jobs/models/JobDescription";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

interface Props {
  contractId: string;
}

function ContractDetails({ contractId }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contract, setContract] = useState<Contract>();
  const [personnel, setPersonnel] = useState<Personnel>();
  const [jobs, setJobs] = useState<JobDescription[]>();

  const [personnelSignature, setPersonnelSignature] = useState<
    string | undefined
  >();
  const [qaSignature, setQaSignature] = useState<string | undefined>();
  const [ceoSignature, setCeoSignature] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        // load contract
        const contract: Contract = await getContractById(contractId);
        setContract(contract);

        // load personnel
        const personnel = await getPersonnelById(contract.userId, ["user"]);
        setPersonnel(personnel);

        // load jobs
        const jobs = await JobService.get({
          filters: [
            {
              name: "_id",
              value: (contract?.jobs as any)?.map((x: any) => x.id),
            },
          ],
        });
        setJobs(jobs as JobDescription[]);

        // load personnel signature
        const personnelSignature = await getUserSignature(personnel.userId);
        setPersonnelSignature(personnelSignature);

        // load qa signature
        const qaApprover = contract.approvers?.find((x) => x.key === "qa");
        if (qaApprover) {
          const qaSignature = await getUserSignature(qaApprover?.userId);
          setQaSignature(qaSignature);
        }

        // load ceo signature
        const ceoApprover = contract.approvers?.find((x) => x.key === "ceo");
        if (ceoApprover) {
          const ceoSignature = await getUserSignature(ceoApprover?.userId);
          setCeoSignature(ceoSignature);
        }
      } catch (error) {
        console.error(error);
        toast.error("خطا در دریافت اطلاعات!");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [contractId]);

  if (isLoading) {
    return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
  }

  if (!contract || !personnel || !jobs) {
    return <></>;
  }

  return (
    <div className="space-y-8">
      <Head.Root>
        <Head.Title>نمایش قرارداد</Head.Title>
      </Head.Root>

      <div>
        <ContractView
          contract={contract}
          personnel={personnel}
          jobs={jobs}
          personnelSignature={personnelSignature}
          approverSignature={ceoSignature}
        />
      </div>

      <ContractAddendums
        contract={contract}
        personnel={personnel}
        jobs={jobs}
        signatures={{
          personnel: personnelSignature,
          qa: qaSignature,
        }}
      />
    </div>
  );
}

export { ContractDetails };
