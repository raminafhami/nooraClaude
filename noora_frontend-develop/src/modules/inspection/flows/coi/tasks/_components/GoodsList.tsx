import { memo, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaTrash } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import { messages } from "@/messages";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { allowEnglishChars } from "@/utils/string/allowEnglishChars";

import { Goods } from "../../models/Goods";
import { ids } from "../../models/Ids";
import { newGoodsItem } from "../../utils/newGoodsItem";

type FormData = {
  [ids.goods]: Goods;
};

function GoodsList() {
  const { control, resetField, setValue, watch } = useFormContext<FormData>();

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
          <div className="overflow-x-auto">
            <Table.Root>
              <Table.Head>
                <Table.Row className="text-right bg-gray-100">
                  <Table.Cell
                    as="th"
                    className="w-1 whitespace-nowrap"
                  ></Table.Cell>
                  <Table.Cell
                    as="th"
                    className="w-[40px] text-center whitespace-nowrap"
                  >
                    #
                  </Table.Cell>
                  <Table.Cell
                    as="th"
                    className="w-36 min-w-36 text-center whitespace-nowrap"
                  >
                    مقدار
                  </Table.Cell>
                  <Table.Cell
                    as="th"
                    className="w-36 min-w-36 text-center whitespace-nowrap"
                  >
                    نوع بسته بندی/
                    <br />
                    واحد ایزو
                  </Table.Cell>
                  <Table.Cell
                    as="th"
                    className="w-36 min-w-36 text-center whitespace-nowrap"
                  >
                    وزن خالص
                    <br />
                    (کیلوگرم)
                  </Table.Cell>
                  <Table.Cell
                    as="th"
                    className="w-36 min-w-36 text-center whitespace-nowrap"
                  >
                    وزن ناخالص
                    <br />
                    (کیلوگرم)
                  </Table.Cell>
                  <Table.Cell
                    as="th"
                    className="min-w-96 text-center whitespace-nowrap"
                  >
                    شرح کالای مورد بازرسی
                  </Table.Cell>
                  <Table.Cell
                    as="th"
                    className="w-44 min-w-44 text-center whitespace-nowrap"
                  >
                    شماره تعرفه گمرک/
                    <br />
                    کد بین المللی کالا
                  </Table.Cell>
                  <Table.Cell
                    as="th"
                    className="w-56 min-w-56 text-center whitespace-nowrap"
                  >
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
                                    },
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
                              render={({
                                field: { onChange, ...field },
                                fieldState,
                              }) => (
                                <>
                                  <Input
                                    className="text-center"
                                    dir="ltr"
                                    onChange={(e) =>
                                      onChange(
                                        allowEnglishChars(e, field.value),
                                      )
                                    }
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
                              render={({
                                field: { onChange, ...field },
                                fieldState,
                              }) => (
                                <>
                                  <Input
                                    className="text-center"
                                    dir="ltr"
                                    onChange={(e) =>
                                      onChange(
                                        allowEnglishChars(e, field.value),
                                      )
                                    }
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
                              name={`${ids.goods}.${i}.netWeight`}
                              render={({
                                field: { onChange, ...field },
                                fieldState,
                              }) => (
                                <>
                                  <Input
                                    className="text-center"
                                    dir="ltr"
                                    onChange={(e) =>
                                      onChange(
                                        allowEnglishChars(e, field.value),
                                      )
                                    }
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
                              name={`${ids.goods}.${i}.grossWeight`}
                              render={({
                                field: { onChange, ...field },
                                fieldState,
                              }) => (
                                <>
                                  <Input
                                    className="text-center"
                                    dir="ltr"
                                    onChange={(e) =>
                                      onChange(
                                        allowEnglishChars(e, field.value),
                                      )
                                    }
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
                              render={({
                                field: { onChange, ...field },
                                fieldState,
                              }) => (
                                <>
                                  <Textarea
                                    className="h-[2.5rem] min-h-[2.5rem] text-center"
                                    dir="ltr"
                                    onChange={(e) =>
                                      onChange(
                                        allowEnglishChars(e, field.value),
                                      )
                                    }
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
                              render={({
                                field: { onChange, ...field },
                                fieldState,
                              }) => (
                                <>
                                  <Textarea
                                    className="h-[2.5rem] min-h-[2.5rem] text-center"
                                    dir="ltr"
                                    onChange={(e) =>
                                      onChange(
                                        allowEnglishChars(e, field.value),
                                      )
                                    }
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
                              render={({
                                field: { onChange, ...field },
                                fieldState,
                              }) => (
                                <>
                                  <Textarea
                                    className="h-[2.5rem] min-h-[2.5rem] text-center"
                                    dir="ltr"
                                    onChange={(e) =>
                                      onChange(
                                        allowEnglishChars(e, field.value),
                                      )
                                    }
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
          </div>
        </Panel.Root>
      </div>

      <div className="col-span-full col-start-1">
        <Button
          type="button"
          onClick={() => {
            setValue(ids.goods, [
              ...(goods ?? []),
              newGoodsItem(),
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
