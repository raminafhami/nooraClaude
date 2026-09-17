import { useCallback, useState } from "react";
import {
  FaBan,
  FaCopy,
  FaEllipsis,
  FaEye,
  FaRegThumbsUp,
} from "react-icons/fa6";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { User } from "@/identity/users/models/User";
import { userType } from "@/identity/users/models/UserType";
import { updateUserActive } from "@/identity/users/services/updateUserActive";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";
import { Table } from "@/ui/Table";
import { formatString } from "@/utils/string/formatString";

interface Props {
  user: User;
  index: number;
  onChange: () => void;
}

function UsersTableRow({ user, index, onChange }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleActiveChange = useCallback(
    async (isActive: boolean) => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        await updateUserActive(user.id, isActive);

        toast.success(
          formatString(
            "حساب کاربری {0} با موفقیت {1} شد.",
            user.fullname,
            isActive ? "فعال" : "غیرفعال",
          ),
        );

        onChange();
      } catch (e) {
        toast.error("خطایی ناشناخته ای رخ داد.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, user.id, user.fullname, onChange],
  );

  return (
    <Table.Row className="whitespace-nowrap">
      <Table.Cell>{index}</Table.Cell>
      <Table.Cell>
        <DynamicLink href={`/dashboard/admin/users/${user.id}`}>
          {user.fullname}
        </DynamicLink>
      </Table.Cell>
      <Table.Cell>{userType[user.type].title}</Table.Cell>
      <Table.Cell>{user.nationalCode || "-"}</Table.Cell>
      <Table.Cell>{user.phoneNo}</Table.Cell>
      <Table.Cell>{user.email || "-"}</Table.Cell>
      <Table.Cell>
        <span
          className={cn(
            "px-2 py-0.5 rounded-lg text-xs",
            user.isActive
              ? "text-blue-900 bg-blue-100"
              : "text-red-900 bg-red-100",
          )}
        >
          {user.isActive ? "فعال" : "غیرفعال"}
        </span>
      </Table.Cell>
      <Table.Cell></Table.Cell>
      <Table.Cell>
        <Table.Actions>
          <Table.Action className="hover:text-blue-500">
            <DynamicLink
              className="flex w-6 h-full items-center justify-center"
              href={`/dashboard/admin/users/${user.id}`}
              title="مشاهده کاربر"
            >
              <FaEye />
            </DynamicLink>
          </Table.Action>
          <Table.Action
            className="hover:text-blue-500"
            title="کپی شناسه کاربر"
            onClick={() => {
              navigator.clipboard.writeText(user.id);
              toast.success("شناسه کاربر مورد نظر با موفقیت کپی شد.");
            }}
          >
            <FaCopy />
          </Table.Action>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-full">
              <Table.Action>
                <FaEllipsis />
              </Table.Action>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" side="left">
              <DropdownMenuItem
                className="flex gap-2 items-center"
                disabled={isLoading}
                onSelect={(e) => {
                  e.preventDefault();
                  handleActiveChange(!user.isActive);
                }}
              >
                <div className="flex grow gap-2 items-center">
                  {user.isActive ? <FaBan /> : <FaRegThumbsUp />}
                  <span>
                    {formatString(
                      "{0} کردن حساب کاربری",
                      user.isActive ? "غیرفعال" : "فعال",
                    )}
                  </span>
                </div>
                {isLoading && <Loading className="w-fit" size="xs" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Table.Actions>
      </Table.Cell>
    </Table.Row>
  );
}

export { UsersTableRow };
