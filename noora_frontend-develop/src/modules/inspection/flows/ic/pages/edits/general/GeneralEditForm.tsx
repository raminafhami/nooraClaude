import { Check, ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
} from "@/components/ui/command";
import { DateInput } from "@/components/ui/date-input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { banks } from "@/data/banks";
import { customs } from "@/data/customs";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { goodsInspectionFieldOptions } from "@/inspection/data/goodsInspectionFields";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";
import { getDirtyValues } from "@/utils/object/getDirtyValues";
import { getObjectKeys } from "@/utils/object/getObjectKeys";

import { GoodsCustomTariffNosWidget } from "../../../components/GoodsCustomTariffNos/GoodsCustomTariffNosWidget";
import { GoodsDescriptionsWidget } from "../../../components/GoodsDescriptions/GoodsDescriptionsWidget";
import { ids } from "../../../models/Ids";
import {
	InspectionMethod,
	inspectionMethodOptions,
} from "../../../models/InspectionMethod";

const schema = z.object({
  [ids.inspectionMethod]: z.custom<InspectionMethod>(
    Boolean,
    messages.validation.required,
  ),
  [ids.proformaNo]: z.string().min(1, messages.validation.required),
  [ids.proformaDate]: z.string().min(1, messages.validation.required),
  [ids.registrationOrderNo]: z.string().min(1, messages.validation.required),
  [ids.registrationOrderDate]: z.string().min(1, messages.validation.required),
  [ids.bankName]: z.string(),
  [ids.bankBranch]: z.string(),
  [ids.customName]: z.string().min(1, messages.validation.required),
  [ids.goodsField]: z.string().min(1, messages.validation.required),
  [ids.invoiceFob]: z.string().min(1, messages.validation.required),
  [ids.dischargerName]: z.string(),
  [ids.dischargerPhoneNo]: z.string(),
  [ids.buyerNameEn]: z.string().min(1, messages.validation.required),
  [ids.seller]: z.string().min(1, messages.validation.required),
  [ids.applicant]: z.string().min(1, messages.validation.required),
  [ids.shipper]: z.string().min(1, messages.validation.required),
  [ids.invoiceNo]: z.string(),
  [ids.invoiceDate]: z.string(),
  [ids.insuranceCompany]: z.string(),
  [ids.insurancePolicyNo]: z.string(),
  [ids.billOfLadingNo]: z.string().min(1, messages.validation.required),
  [ids.billOfLadingDate]: z.string().min(1, messages.validation.required),
  [ids.billOfLadingQuantity]: z.string().min(1, messages.validation.required),
  [ids.grossWeight]: z.string().min(1, messages.validation.required),
  [ids.netWeight]: z.string(),
  [ids.packing]: z.string().min(1, messages.validation.required),
  [ids.shippedFrom]: z.string().min(1, messages.validation.required),
  [ids.shippedTo]: z.string().min(1, messages.validation.required),
  [ids.countryOfOrigin]: z.string().min(1, messages.validation.required),
  [ids.goodsCustomTariffNos]: z.string().min(1, messages.validation.required),
  [ids.inspectionPlace]: z.string().min(1, messages.validation.required),
  [ids.inspectionDate]: z.string().min(1, messages.validation.required),
  [ids.inspectionQualityDescription]: z
    .string()
    .min(1, messages.validation.required),
  [ids.inspectionRemarkDescription]: z
    .string()
    .min(1, messages.validation.required),
  [ids.certificateConclusion]: z.string().min(1, messages.validation.required),
});

type FormData = z.infer<typeof schema>;

function getDefaultValues(parameters: FormData): Partial<FormData> {
  return getObjectKeys(schema.keyof().Values).reduce<Partial<FormData>>(
    (prev, key) => {
      if (typeof parameters[key] !== "undefined") {
        prev[key] = parameters[key] as any;
      }

      return prev;
    },
    {},
  );
}

function GeneralEditForm() {
  const { instance, onInstanceUpdate } = useInspectionContext();

  const form = useForm<FormData>({
    defaultValues: getDefaultValues(instance.parameters),
  });
  const { control, formState, handleSubmit: onSubmit, reset, setError } = form;
  const { dirtyFields, errors, isDirty, isSubmitting, isSubmitSuccessful } =
    formState;

  async function handleSubmit(values: FormData) {
    try {
      const dirtyFieldValues = getDirtyValues(dirtyFields, values);
      await updateInstanceData(instance.id, dirtyFieldValues);
      onInstanceUpdate(dirtyFieldValues);
      toast.success("اطلاعات با موفقیت بروزرسانی شد.");
    } catch (err: any) {
      console.error(err);
      setError("root.server", {
        message:
          err?.message || "خطای نامشخصی در هنگام بروزرسانی اطلاعات رخ داد.",
      });
    }
  }

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(getDefaultValues(instance.parameters));
    }
  }, [instance.parameters, isSubmitSuccessful, reset]);

  return (
    <div className="space-y-6">
      <Head.Root>
        <Head.Title text="ویرایش اطلاعات" />
      </Head.Root>

      <Form {...form}>
        <form className="space-y-6" onSubmit={onSubmit(handleSubmit)}>
          <div className="grid grid-cols-12 gap-x-4 md:gap-x-10 gap-y-6">
            <FormField
              control={control}
              name={ids.inspectionMethod}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>روش بازرسی:</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {inspectionMethodOptions.map((x) => (
                          <SelectItem key={x.value} value={x.value}>
                            {x.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.proformaNo}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    شماره پروفرما{" "}
                    <span className="text-xs" dir="ltr">
                      (Proforma Invoice No.)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.proformaDate}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    تاریخ پروفرما{" "}
                    <span className="text-xs">(Proforma Invoice Date)</span>:
                  </FormLabel>
                  <FormControl>
                    <DateInput calendarType="gregorian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.registrationOrderNo}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    شماره ثبت سفارش{" "}
                    <span className="text-xs" dir="ltr">
                      (Registration Order No.)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.registrationOrderDate}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    تاریخ ثبت سفارش{" "}
                    <span className="text-xs">(Registration Order Date)</span>:
                  </FormLabel>
                  <FormControl>
                    <DateInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.bankName}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    نام بانک <span className="text-xs">(Bank Name)</span>:
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((x) => (
                          <SelectItem key={x.value} value={x.value}>
                            {x.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.bankBranch}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    شعبه بانک <span className="text-xs">(Bank Branch)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.customName}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    گمرک <span className="text-xs">(Custom)</span>:
                  </FormLabel>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size="lg"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full px-3 justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? customs.find((x) => x.value === field.value)
                                  ?.label
                              : "انتخاب گمرک"}
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="جستجوی گمرک..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>هیچ گمرکی یافت نشد.</CommandEmpty>
                            <CommandGroup>
                              {customs.map((x) => (
                                <CommandItem
                                  value={x.label}
                                  key={x.value}
                                  onSelect={field.onChange}
                                >
                                  <Check
                                    className={cn(
                                      "me-2 h-4 w-4",
                                      x.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {x.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.goodsField}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    نوع کالاها <span className="text-xs">(Field of Goods)</span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {goodsInspectionFieldOptions.map((x) => (
                          <SelectItem
                            key={x.value}
                            value={x.value}
                            visible={x.visible || x.value === field.value}
                          >
                            {x.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.invoiceFob}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    FOB فاکتور (یورو){" "}
                    <span className="text-xs">(Invoice FOB)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.dischargerName}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>نام ترخیص کار:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.dischargerPhoneNo}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>شماره تماس ترخیص کار:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.buyerNameEn}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    خریدار <span className="text-xs">(Buyer)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.seller}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    فروشنده <span className="text-xs">(Seller)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.applicant}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    متقاضی <span className="text-xs">(Applicant)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.shipper}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    ارسال کننده <span className="text-xs">(Shipper)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.invoiceNo}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    شماره فاکتور{" "}
                    <span className="text-xs" dir="ltr">
                      (Invoice No.)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.invoiceDate}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    تاریخ فاکتور <span className="text-xs">(Invoice Date)</span>
                    :
                  </FormLabel>
                  <FormControl>
                    <DateInput calendarType="gregorian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.insuranceCompany}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    شرکت بیمه{" "}
                    <span className="text-xs">(Insurance Company)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.insurancePolicyNo}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    شماره بیمه نامه{" "}
                    <span className="text-xs" dir="ltr">
                      (Insurance Policy No.)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.billOfLadingNo}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    شماره بارنامه{" "}
                    <span className="text-xs" dir="ltr">
                      (B/L No.)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.billOfLadingDate}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    تاریخ بارنامه <span className="text-xs">(B/L Date)</span>:
                  </FormLabel>
                  <FormControl>
                    <DateInput calendarType="gregorian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.billOfLadingQuantity}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    مقدار ارسال شده به ازای هر بارنامه{" "}
                    <span className="text-xs">
                      (Quantity Shipped as per B/L)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.grossWeight}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    وزن ناخالص <span className="text-xs">(Gross Weight)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.netWeight}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    وزن خالص <span className="text-xs">(Net Weight)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.packing}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    بسته بندی <span className="text-xs">(Packing)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.shippedFrom}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    ارسال شده از <span className="text-xs">(Shipped from)</span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.shippedTo}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    ارسال شده به <span className="text-xs">(Shipped to)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.countryOfOrigin}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    کشور مبدأ{" "}
                    <span className="text-xs">(Country of Origin)</span>:
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <GoodsCustomTariffNosWidget />

            <GoodsDescriptionsWidget />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.inspectionPlace}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    محل بازرسی{" "}
                    <span className="text-xs" dir="ltr">
                      (Place of Inspection)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input className="text-right" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.inspectionDate}
              render={({ field }) => (
                <FormItem className="col-span-full xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 !col-start-1">
                  <FormLabel>
                    تاریخ بازرسی{" "}
                    <span className="text-xs">(Inspection Date)</span>:
                  </FormLabel>
                  <FormControl>
                    <DateInput calendarType="gregorian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Seperator className="mt-5" />

            <FormField
              control={control}
              name={ids.inspectionQualityDescription}
              render={({ field }) => (
                <FormItem className="col-span-full col-start-1">
                  <FormLabel>
                    کیفیت{" "}
                    <span className="text-xs" dir="ltr">
                      (Quality)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.inspectionRemarkDescription}
              render={({ field }) => (
                <FormItem className="col-span-full col-start-1">
                  <FormLabel>
                    ملاحظات{" "}
                    <span className="text-xs" dir="ltr">
                      (Remark)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={ids.certificateConclusion}
              render={({ field }) => (
                <FormItem className="col-span-full col-start-1">
                  <FormLabel>
                    نتیجه{" "}
                    <span className="text-xs" dir="ltr">
                      (Conclusion)
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Textarea dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {errors.root?.server && (
            <DestructiveAlert>
              <AlertDescription>{errors.root.server.message}</AlertDescription>
            </DestructiveAlert>
          )}

          <div>
            <Button className="flex gap-2" disabled={!isDirty || isSubmitting}>
              {isSubmitting && <Loading size="xs" />} اعمال تغییرات
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export { GeneralEditForm };
