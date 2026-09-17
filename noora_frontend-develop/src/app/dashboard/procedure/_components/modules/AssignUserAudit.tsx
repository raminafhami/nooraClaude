import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import GetAllUsers from "@/api/users/getAllUsers";
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
import { User } from "@/identity/users/models/User";
import { cn } from "@/lib/utils";

interface AssignUserAuditProps {
  setIds: (ids: Person[]) => void;
  ids: Person[];
}

export type Person = {
  branchId: null | string;
  name: string;
  lastname: string;
  username: string;
  nationalCode: string;
  email: string;
  phoneNo: string;
  type: string;
  groups: string[];
  id: string;
};

export default function AssignUserAudit({ setIds, ids }: AssignUserAuditProps) {
  const [searchedName, setSearchedName] = useState<string>("");
  const [dropDownData, setDropDownData] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);

  async function getUserGroups() {
    try {
      const res = await GetAllUsers({
        page: 0,
        size: 9999,
        searchByName: searchedName || undefined,
        isActive: true,
        type: "personnel",
      });
      setDropDownData(res.result?.data || []);
    } catch (err) {
      toast.error("An error occurred!");
    }
  }

  function groupSelector(user: Person) {
    if (!ids.some((existingUser) => existingUser.id === user.id)) {
      setIds([...ids, user]);
    } else {
      removeFromAssignTo(user);
    }
  }

  function removeFromAssignTo(user: Person) {
    setIds(ids.filter((existingUser) => existingUser.id !== user.id));
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getUserGroups();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchedName]);

  useEffect(() => {
    getUserGroups();
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
            پرسنل
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]">
          <Command>
            <input
              className="w-[280px] mx-2 text-[.9rem] pl-[2.8rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis border-gray-300 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
              type="text"
              placeholder="پرسنل"
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
                  key={user.id}
                  value={`${user.name} ${user.lastname}`}
                  onSelect={() => groupSelector(user)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      ids.some((u) => u.id === user.id)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {user.name} {user.lastname}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {/* {ids.length > 0 && (
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
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {user.name} {user.lastname}
                  </TableCell>
                  <TableCell>
                    <BsFillTrashFill
                      data-tooltip-id={user.id}
                      size={17}
                      className="text-red-500 inline cursor-pointer mr-2 focus:outline-0"
                      onClick={() => removeFromAssignTo(user)}
                    />
                    <Tooltip id={user.id}>Remove</Tooltip>
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
