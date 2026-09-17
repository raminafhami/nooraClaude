import { AiOutlineAudit } from "react-icons/ai";
import { HiOutlineNewspaper } from "react-icons/hi";
import { TbProgressHelp } from "react-icons/tb";

const CategoryTypes = [
	{
		value: "دستورالعمل",
		code: "WI",
	},
	{
		value: "روش اجرایی",
		code: "PR",
	},
	{
		value: "قرارداد",
		code: "CT",
	},
	{
		value: "خط مشی کیفیت",
		code: "QP",
	},
	{
		value: "اهداف کیفیت",
		code: "QG",
	},
	{
		value: "تعهدنامه بی طرفی",
		code: "IS",
	},
	{
		value: "منشور اخلاقی",
		code: "CO",
	},
	{
		value: "چارت سازمانی",
		code: "OC",
	},
	{
		value: "نظامنامه کیفیت",
		code: "QM",
	},
	{
		value: "فرم",
		code: "FR",
	},
	{
		value: "ممیزی داخلی",
		code: "RI",
	},
];

export default CategoryTypes;

export const ProcedureTabs = [
	{
		name: "ممیزی داخلی",
		color: "",
		icon: AiOutlineAudit,
		value: "audit",
	},
	{
		name: "روش های اجرایی و دستورالعملها",
		color: "",
		icon: TbProgressHelp,
		value: "instructions",
	},
	// {
	//   name: "شناسایی مخاطرات",
	//   color: "",
	//   icon: FaPlus,
	//   value: "riskIdentification",
	// },
	{
		name: "پایش ها",
		color: "",
		icon: HiOutlineNewspaper,
		value: "monitors",
	},
	// {
	//   name: "فهرست تامین کنندگان",
	//   color: "",
	//   icon: FaPlus,
	//   value: "suppliers",
	// },
	// {
	//   name: "فهرست پیمانکاران فرعی",
	//   color: "",
	//   icon: PiUserList,
	//   value: "subcontractors",
	// },
	// {
	//   name: "فهرست شکایات و رسیدگی مجدد",
	//   color: "",
	//   icon: FaPlus,
	//   value: "complaints",
	// },
	// {
	//   name: "بازنگری مدیریت",
	//   color: "",
	//   icon: FaPlus,
	//   value: "managementReview",
	// },
];
