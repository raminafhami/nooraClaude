import { useRouter } from "next/navigation";
import { useContext, useMemo } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import MyModal from "@/ui/Modal/contextlessModal/Modal";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { TimeRelative } from "@/ui/Time";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { ApplicationContext } from "./ApplicationContext";
import { ApplicationItemDate } from "./ApplicationItemDate";

interface Props {
  isShow: boolean;
  setShow: (isShow?: any) => void;
}

export default function DoneTasksModal({ isShow, setShow }: Props) {
  const { identity } = useLoggedInUser();
  const router = useRouter();

  const {
    application: { tasks },
  } = useContext(ApplicationContext);

  const doneTasks = useMemo(
    () =>
      tasks
        .filter(
          (x) => x.task.status === "done" && x.task.userId === identity.id,
        )
        .reverse(),
    [identity.id, tasks],
  );

  function handleTaskOpen(id: string) {
    router.push(getDynamicUrl(`/dashboard/tasks/${id}`));
  }

  return (
    <>
      {
        <MyModal
          size="3xl"
          title="کارهای پایان یافته"
          content={
            <Panel.Root>
              <Table.Root>
                <Table.Head className="bg-gray-100">
                  <Table.Row>
                    <Table.Cell as="th">ردیف</Table.Cell>
                    <Table.Cell as="th">عنوان</Table.Cell>
                    <Table.Cell as="th">زمان ایجاد</Table.Cell>
                    <Table.Cell as="th">آخرین بروزرسانی</Table.Cell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {doneTasks?.length ? (
                    doneTasks.map((item, index: number) => (
                      <Table.Row
                        className="cursor-pointer"
                        key={index}
                        onClick={() => handleTaskOpen(item.task.taskId)}
                      >
                        <Table.Cell>{index + 1}</Table.Cell>
                        <Table.Cell>{item.task.name ?? "-"}</Table.Cell>
                        <Table.Cell>
                          <ApplicationItemDate
                            date={new Date(item.task.createdAt)}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <ApplicationItemDate
                            date={new Date(item.task.updatedAt)}
                          />
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={100}>موردی یافت نشد.</Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Panel.Root>
          }
          name="addTicket"
          onClose={() => setShow(false)}
          show={isShow}
        />
      }
    </>
  );
}
