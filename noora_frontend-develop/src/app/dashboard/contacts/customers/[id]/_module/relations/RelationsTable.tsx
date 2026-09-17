import persian from "react-date-object/calendars/persian";
import { FaPencilAlt } from "react-icons/fa";
import { DateObject } from "react-multi-date-picker";

import {
  CustomerRelation,
  CustomerRelationStatus,
} from "@/inspection/customers/interfaces/CustomerRelation";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

function RelationsTable({
  loading,
  relations,
  onEdit,
}: {
  loading: boolean;
  relations: CustomerRelation[];
  onEdit: (index: number) => void;
}) {
  return (
    <div className="lg:col-span-2 xl:col-span-5 space-y-8">
      <Head.Root>
        <Head.Title>ارتباط ها</Head.Title>
      </Head.Root>

      {loading && relations.length !== 0 && (
        <Loading className="h-fit" size="sm">
          در حال دریافت و بروزرسانی اطلاعات...
        </Loading>
      )}

      <Panel.Root>
        <Table.Root>
          <Table.Head>
            <Table.Row className="text-right bg-gray-100">
              <Table.Cell as="th" className="w-12"></Table.Cell>
              <Table.Cell as="th" className="w-12">
                ردیف
              </Table.Cell>
              <Table.Cell as="th" className="w-56">
                هماهنگ کننده
              </Table.Cell>
              <Table.Cell as="th" className="w-56">
                بازاریاب
              </Table.Cell>
              <Table.Cell as="th" className="w-36">
                از تاریخ
              </Table.Cell>
              <Table.Cell as="th" className="w-36">
                تا تاریخ
              </Table.Cell>
              <Table.Cell as="th" className="w-24">
                وضعیت
              </Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {relations.length !== 0 ? (
              relations.map((relation, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    {relation.status === CustomerRelationStatus.Active && (
                      <Table.Actions>
                        <Table.Action
                          onClick={() => {
                            onEdit(i);
                          }}
                        >
                          <FaPencilAlt />
                        </Table.Action>
                      </Table.Actions>
                    )}
                  </Table.Cell>
                  <Table.Cell>{i + 1}</Table.Cell>
                  <Table.Cell>
                    {(relation.coordinator as any)?.name || "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {(relation.marketer as any)?.name || "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {new DateObject({
                      date: relation.createAt,
                      format: "YYYY/MM/DD",
                      calendar: persian,
                    }).toString()}
                  </Table.Cell>
                  <Table.Cell>
                    {(relation.deactiveAt &&
                      new DateObject({
                        date: relation.deactiveAt,
                        format: "YYYY/MM/DD",
                        calendar: persian,
                      }).toString()) ||
                      "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {relation.status === CustomerRelationStatus.Deactive
                      ? "غیرفعال"
                      : "فعال"}
                  </Table.Cell>
                </Table.Row>
              ))
            ) : loading ? (
              <Table.Row key="loading">
                <Table.Cell colSpan={100}>
                  <Loading size="sm">در حال دریافت اطلاعات...</Loading>
                </Table.Cell>
              </Table.Row>
            ) : (
              <Table.Row key="empty">
                <Table.Cell colSpan={100}>هیچ ارتباطی وجود ندارد.</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Panel.Root>
    </div>
  );
}

export { RelationsTable };
