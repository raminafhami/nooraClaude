import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserGroup } from "@/identity/groups/models/Group";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroups } from "@/identity/groups/services/getGroups";
import { cn } from "@/lib/utils";

interface AssignGroupAuditProps {
  setIds: (ids: any) => void;
  ids: any;
}

export default function AssignGroupAudit({
  setIds,
  ids,
}: AssignGroupAuditProps) {
  const [searchedName, setSearchedName] = useState<string>("");
  const [dropDownData, setDropDownData] = useState<UserGroup[]>([]);
  const [open, setOpen] = useState(false);

  async function fetchUserGroups() {
    try {
      const res = await getGroups(UserGroupType.Group);
      let arr: any = [];
      res?.map((item) => {
        arr.push({
          permissions: [],
          title: item?.title,
          name: item?.name,
          type: item?.type,
          parentId: item?.parent,
          metadata: item?.metadata,
          id: item?.id,
        });
      });
      setDropDownData(arr);
    } catch (err) {
      toast.error("An error occurred!");
    }
  }

  function handleGroupSelect(groupId: any) {
    if (!ids.some((u: any) => u.id === groupId.id)) {
      setIds([...ids, groupId]);
    } else {
      handleGroupRemove(groupId);
    }
  }

  function handleGroupRemove(groupId: any) {
    setIds(ids.filter((id: any) => id?.id !== groupId?.id));
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUserGroups();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchedName]);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  return (
    <div className="flex flex-col mb-10 relative mx-[1rem]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between text-[.9rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0">
            گروه
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]">
          <Command>
            <input
              className="w-[280px] mx-2 text-[.9rem] pl-[2.8rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis border-gray-300 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
              type="text"
              placeholder="گروه"
              onChange={(event) =>
                setSearchedName(
                  event.target.value.trim().replace(/\s\s+/g, " "),
                )
              }
              value={searchedName}
            />
            <CommandEmpty>No user found...</CommandEmpty>
            <CommandGroup className="max-h-[20rem] overflow-y-auto">
              {dropDownData.map((user, index) => (
                <CommandItem
                  key={index}
                  value={user?.id}
                  onSelect={() => handleGroupSelect(user)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      ids.some((u: any) => u.id === user.id)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {user?.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Uncomment this section if you want to display the table of selected users
      {ids.length > 0 && (
        <div className="flex flex-wrap mt-6">
          <Table>
            <TableCaption>Users added to the project</TableCaption>
            <TableHeader>
              <TableRow className="text-right bg-gray-100 select-none">
                <TableHead className="text-right">No.</TableHead>
                <TableHead className="text-right">User</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ids.map((user, index) => (
                <TableRow key={user}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user}</TableCell>
                  <TableCell>
                    <BsFillTrashFill
                      data-tooltip-id={user}
                      size={17}
                      className="text-red-500 inline cursor-pointer mr-2 focus:outline-0"
                      onClick={() => handleGroupRemove(user)}
                    />
                    <Tooltip id={user}>Remove</Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )} */}
    </div>
  );
}
