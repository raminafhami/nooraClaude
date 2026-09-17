import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserStatus,
  userStatusOptions,
} from "@/identity/users/enums/UserStatus";
import { UserType, userTypeOptions } from "@/identity/users/models/UserType";
import { SelectItemType } from "@/types/SelectItem";
import { Panel } from "@/ui/Panel";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  searchTerm: z.string(),
  type: z.custom<UserType>().nullable(),
  status: z.custom<UserStatus>().nullable(),
});

type FormData = z.infer<typeof schema>;

const extendedUserTypeOptions: SelectItemType[] = [
  { value: "all", label: "همه" },
  ...userTypeOptions,
];

const extendedUserStatusOptions: SelectItemType[] = [
  { value: "all", label: "همه" },
  ...userStatusOptions,
];

interface Props {
  queryFilters: {
    searchTerm: string;
    type: UserType | null;
    status: UserStatus | null;
  };
  setQueryFilters: Dispatch<
    SetStateAction<{
      searchTerm: string;
      type: UserType | null;
      status: UserStatus | null;
    }>
  >;
}

function UsersFilter({ queryFilters, setQueryFilters }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<FormData>({
    defaultValues: {
      ...queryFilters,
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    formState: { isDirty, isSubmitted },
    handleSubmit: handleRhfSubmit,
    watch,
  } = form;
  const { searchTerm, type, status } = watch();

  function handleSubmit(values: FormData) {
    setQueryFilters({ ...values });
  }

  useEffect(() => {
    if (isDirty || isSubmitted) {
      formRef.current?.requestSubmit();
    }
  }, [isDirty, isSubmitted, searchTerm, type, status]);

  return (
    <Panel.Root className="px-0 pb-1">
      <Form {...form}>
        <form
          ref={formRef}
          className="flex p-6 bg-white rounded-xl flex-col sm:flex-row gap-3"
          onSubmit={handleRhfSubmit(handleSubmit)}
        >
          <FormField
            control={control}
            name="searchTerm"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>جستجو:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="جستجوی نام، کدملی و شماره تماس"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem className="xs:min-w-56 shrink-0">
                <FormLabel>نوع کاربر:</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? "all"}
                    onValueChange={(value) => {
                      field.onChange(value === "all" ? null : value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {extendedUserTypeOptions.map((x) => (
                        <SelectItem
                          key={x.value}
                          value={x.value}
                          visible={x.visible}
                        >
                          {x.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem className="xs:min-w-56 shrink-0">
                <FormLabel>وضعیت کاربر:</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? "all"}
                    onValueChange={(value) => {
                      field.onChange(value === "all" ? null : value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {extendedUserStatusOptions.map((x) => (
                        <SelectItem key={x.value} value={x.value}>
                          {x.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Panel.Root>
  );
}

export { UsersFilter };
