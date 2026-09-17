"use client";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { ids } from "../../models/Ids";

export function GoodsStatic() {
	const { task } = useTaskContext();

	return (
		<Panel.Root>
			<Table.Root>
				<Table.Head>
					<Table.Row className="bg-gray-100 text-right">
						<Table.Cell className="w-1 text-center" as="th">
							ردیف
						</Table.Cell>
						<Table.Cell className="w-32 text-center" as="th">
							مقدار
						</Table.Cell>
						<Table.Cell className="w-56 text-center" as="th">
							نوع بسته بندی/
							<br />
							واحد ایزو
						</Table.Cell>
						<Table.Cell className="text-center" as="th">
							شرح کالای مورد بازرسی
						</Table.Cell>
						<Table.Cell className="w-40 text-center" as="th">
							شماره تعرفه گمرک/
							<br />
							کد بین المللی کالا
						</Table.Cell>
						<Table.Cell className="w-60 text-center" as="th">
							سند استاندارد/معیار:
							<br />
							تاریخ نسخه
						</Table.Cell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{task.data[ids.goods].map((g: any, i: number) => {
						return (
							<Table.Row key={i}>
								<Table.Cell className="py-5 text-center group-hover:bg-inherit">
									{i + 1}
								</Table.Cell>
								<Table.Cell className="py-5 group-hover:bg-inherit">
									<div dir="ltr" className="text-center">
										{g.qty}
									</div>
								</Table.Cell>
								<Table.Cell className="py-5 group-hover:bg-inherit">
									<div dir="ltr" className="text-center">
										{g.packingOrUnit}
									</div>
								</Table.Cell>
								<Table.Cell className="py-5 group-hover:bg-inherit">
									<div dir="ltr" className="whitespace-pre-wrap text-center">
										{g.description}
									</div>
								</Table.Cell>
								<Table.Cell className="py-5 group-hover:bg-inherit">
									<div dir="ltr" className="whitespace-pre-wrap text-center">
										{g.customTariffNoOrHsCode}
									</div>
								</Table.Cell>
								<Table.Cell className="py-5 group-hover:bg-inherit">
									<div dir="ltr" className="whitespace-pre-wrap text-center">
										{g.document}
									</div>
								</Table.Cell>
							</Table.Row>
						);
					})}
					{/* <Table.Row key="footer">
            <Table.Cell
              className="py-0 relative group-hover:bg-inherit"
              colSpan={100}
            >
              <div className="relative grid w-full top-4 px-12 rounded-xl bg-gray-100 grid-cols-12 gap-x-6 transition">
                <div className="flex py-4 col-span-3">
                  <div>مجموع:</div>
                  <div className="ms-3">
                    {task.data[ids.goods]
                      .map((x: any) => x.qty)
                      .reduce((s: number, q: number) => {
                        return +s + +q;
                      }, +0)}
                  </div>
                </div>
              </div>
            </Table.Cell>
          </Table.Row> */}
				</Table.Body>
			</Table.Root>
		</Panel.Root>
	);
}
