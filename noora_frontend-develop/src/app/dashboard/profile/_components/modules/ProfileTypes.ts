import { AiOutlineAudit, AiOutlinePropertySafety } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { HiOutlineNewspaper } from "react-icons/hi";
import { PiUserList } from "react-icons/pi";
import { TbProgressHelp } from "react-icons/tb";

const ProfileTypes = [
  {
    name: "اطلاعات",
    color: "",
    icon: AiOutlineAudit,
    value: "information",
  },
  {
    name: "ورود و خروج",
    color: "",
    icon: AiOutlineAudit,
    value: "attendance",
  },
  {
    name: "گزارش گیری",
    color: "",
    icon: AiOutlineAudit,
    value: "entriesHistory",
  },
  {
    name: "درخواست‌ها",
    color: "",
    icon: AiOutlineAudit,
    value: "request",
  },
  {
    name: "مدارک",
    color: "",
    icon: AiOutlineAudit,
    value: "documents",
  },
  {
    name: "تنظیمات ورود",
    color: "",
    icon: AiOutlineAudit,
    value: "login",
  },
  {
    name: "قراردادها",
    color: "",
    icon: AiOutlineAudit,
    value: "contracts",
  },
  {
    name: "ارزیابی",
    color: "",
    icon: AiOutlineAudit,
    value: "myForms",
  },
];

export default ProfileTypes;
