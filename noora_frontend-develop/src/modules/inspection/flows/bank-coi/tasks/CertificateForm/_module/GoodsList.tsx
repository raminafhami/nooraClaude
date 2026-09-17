import { memo, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaPlus, FaTrash } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import { messages } from "@/messages";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";

function GoodsList() {
  const { control, resetField, setValue, trigger, watch } =
    useFormContext<FormData>();

  const { [ids.goods]: goods } = watch();

  useEffect(() => {
    if (!goods) {
      resetField(ids.goods, { defaultValue: [] });
    }
  }, [goods, resetField]);

  return (
    <>
      <div className="col-span-full col-start-1 space-y-2">
        <label>
          کالاها <span className="text-xs">(Goods)</span>:
        </label>
        <Panel.Root>
          <Table.Root>
            <Table.Head>
              <Table.Row className="text-right bg-gray-100">
                <Table.Cell className="w-1" as="th"></Table.Cell>
                <Table.Cell className="w-1 text-center" as="th">
                  #
                </Table.Cell>
                <Table.Cell className="w-32 text-center" as="th">
                  مقدار
                </Table.Cell>
                <Table.Cell className="w-56 text-center" as="th">
                  نوع بسته بندی/
                  <br />
                  واحد ایزو
                </Table.Cell>
                <Table.Cell className="w-96 text-center" as="th">
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
              {goods && goods.length !== 0 ? (
                <>
                  {goods.map((g: any, i: number) => {
                    return (
                      <Table.Row key={g.id}>
                        <Table.Cell className="group-hover:bg-inherit">
                          <Table.Actions className="group-hover:bg-gray-100">
                            <Table.Action
                              className="transition hover:text-red-500"
                              onClick={() => {
                                setValue(
                                  ids.goods,
                                  [...goods.filter((_, j) => i !== j)],
                                  {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  }
                                );
                              }}
                            >
                              <FaTrash />
                            </Table.Action>
                          </Table.Actions>
                        </Table.Cell>
                        <Table.Cell className="group-hover:bg-inherit">
                          {i + 1}
                        </Table.Cell>
                        <Table.Cell className="group-hover:bg-inherit">
                          <Controller
                            control={control}
                            name={`${ids.goods}.${i}.qty`}
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  className="text-center"
                                  dir="ltr"
                                  {...field}
                                />
                                <FieldError error={fieldState.error} />
                              </>
                            )}
                            rules={{ required: messages.validation.required }}
                            shouldUnregister
                          />
                        </Table.Cell>
                        <Table.Cell className="group-hover:bg-inherit">
                          <Controller
                            control={control}
                            name={`${ids.goods}.${i}.packingOrUnit`}
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  className="text-center"
                                  dir="ltr"
                                  {...field}
                                />
                                <FieldError error={fieldState.error} />
                              </>
                            )}
                            rules={{ required: messages.validation.required }}
                            shouldUnregister
                          />
                        </Table.Cell>
                        <Table.Cell className="group-hover:bg-inherit">
                          <Controller
                            control={control}
                            name={`${ids.goods}.${i}.description`}
                            render={({ field, fieldState }) => (
                              <>
                                <Textarea
                                  className="h-[2.5rem] min-h-[2.5rem] text-center"
                                  dir="ltr"
                                  {...field}
                                />
                                <FieldError error={fieldState.error} />
                              </>
                            )}
                            rules={{ required: messages.validation.required }}
                            shouldUnregister
                          />
                        </Table.Cell>
                        <Table.Cell className="group-hover:bg-inherit">
                          <Controller
                            control={control}
                            name={`${ids.goods}.${i}.customTariffNoOrHsCode`}
                            render={({ field, fieldState }) => (
                              <>
                                <Textarea
                                  className="h-[2.5rem] min-h-[2.5rem] text-center"
                                  dir="ltr"
                                  {...field}
                                />
                                <FieldError error={fieldState.error} />
                              </>
                            )}
                            rules={{ required: messages.validation.required }}
                            shouldUnregister
                          />
                        </Table.Cell>
                        <Table.Cell className="group-hover:bg-inherit">
                          <Controller
                            control={control}
                            name={`${ids.goods}.${i}.document`}
                            render={({ field, fieldState }) => (
                              <>
                                <Textarea
                                  className="h-[2.5rem] min-h-[2.5rem] text-center"
                                  dir="ltr"
                                  {...field}
                                />
                                <FieldError error={fieldState.error} />
                              </>
                            )}
                            rules={{ required: messages.validation.required }}
                            shouldUnregister
                          />
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
                          {goods
                            .map((x) => parseInt(x.qty) || 0)
                            .reduce((s, q) => s + q, 0)}
                        </div>
                      </div>
                    </div>
                  </Table.Cell>
                </Table.Row> */}
                </>
              ) : (
                <Table.Row key="null">
                  <Table.Cell className="text-center" colSpan={100}>
                    کالایی یافت نشد!
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Panel.Root>
      </div>

      <div className="col-span-full col-start-1">
        <Button
          type="button"
          onClick={() => {
            setValue(ids.goods, [
              ...(goods ?? []),
              {
                id: crypto.randomUUID(),
                qty: "",
                packingOrUnit: "",
                description: "",
                customTariffNoOrHsCode: "",
                document: "",
              },
            ]);
          }}
        >
          افزودن
        </Button>
      </div>
    </>
  );
}

export default memo(GoodsList);
