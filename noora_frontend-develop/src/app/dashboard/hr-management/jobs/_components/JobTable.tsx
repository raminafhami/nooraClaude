"use client";

import { useMemo } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import hasSystemPermission from "@/auth/utils/hasSystemPermission";
import { JobDescription } from "@/hrm/jobs/models/Job";
import { jobDepartments } from "@/hrm/jobs/models/JobDepartment";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import JobTableRowActions from "./JobTableRowActions";

interface Props {
  error: string | null;
  loading: boolean;
  offset: number;
  jobs: JobDescription[];
  onDelete: () => void;
}

export default function JobTable({
  error,
  jobs,
  loading,
  offset,
  onDelete,
}: Props) {
  const { identity } = useLoggedInUser();

  const canDelete = useMemo(() => {
    return hasSystemPermission(identity);
  }, [identity]);

  return (
    <Panel.Root>
      <Table.Root>
        <Table.Head>
          <Table.Row className="text-right bg-gray-100">
            <Table.Cell as="th" className="w-20"></Table.Cell>
            <Table.Cell as="th" className="w-12">
              ردیف
            </Table.Cell>
            <Table.Cell as="th" className="w-52">
              کد شناسایی
            </Table.Cell>
            <Table.Cell as="th" className="w-28">
              جایگاه سازمانی
            </Table.Cell>
            <Table.Cell as="th" className="">
              عنوان شغلی
            </Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {jobs.length !== 0 || (!loading && !error) ? (
            jobs.length !== 0 ? (
              jobs.map((job, index) => (
                <Table.Row key={job.id}>
                  <Table.Cell>
                    <JobTableRowActions
                      jobId={job.id}
                      canDelete={canDelete}
                      onDelete={onDelete}
                    />
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {offset + index + 1}
                  </Table.Cell>
                  <Table.Cell className="pe-6 text-left">{job.code}</Table.Cell>
                  <Table.Cell>
                    {jobDepartments.find((x) => x.value === job.department)
                      ?.label ?? "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {job.name}
                    {job.metadata?.goodsInspectionField &&
                      ` (حوزه بازرسی کالا: ${job.metadata.goodsInspectionField})`}
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row key="empty">
                <Table.Cell></Table.Cell>
                <Table.Cell colSpan={100}>سمت شغلی ای یافت نشد.</Table.Cell>
              </Table.Row>
            )
          ) : loading ? (
            <Table.Row key="loading">
              <Table.Cell></Table.Cell>
              <Table.Cell colSpan={100}>
                <Loading size="sm">در حال بارگذاری اطلاعات...</Loading>
              </Table.Cell>
            </Table.Row>
          ) : (
            error && (
              <Table.Row key="error">
                <Table.Cell></Table.Cell>
                <Table.Cell colSpan={100}>
                  دریافت اطلاعات با خطا روبرو شد.
                </Table.Cell>
              </Table.Row>
            )
          )}
        </Table.Body>
      </Table.Root>
    </Panel.Root>
  );
}
