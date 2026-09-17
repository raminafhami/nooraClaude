import moment from "jalali-moment";

import { getFirstOfJalaliMonth } from "@/utils/date/getFirstOfJalaliMonth";
import { getFirstOfJalaliYear } from "@/utils/date/getFirstOfJalaliYear";

const currentJYear = moment().jYear();

const getFirstOfMonth = (month: number) => {
	return getFirstOfJalaliMonth(month).format("YYYY-MM-DD");
};

const getFirstOfYear = (year: number) => {
	return getFirstOfJalaliYear(year).format("YYYY-MM-DD");
};

const timeFrames = [
	["ماهانه", "monthly"],
	["فصلی", "seasonal"],
	["سالانه", "yearly"],
];

const monthlyTimeFrames = [
	{
		label: "فروردین",
		value: getFirstOfMonth(0),
	},
	{
		label: "اردیبهشت",
		value: getFirstOfMonth(1),
	},
	{
		label: "خرداد",
		value: getFirstOfMonth(2),
	},
	{
		label: "تیر",
		value: getFirstOfMonth(3),
	},
	{
		label: "مرداد",
		value: getFirstOfMonth(4),
	},
	{
		label: "شهریور",
		value: getFirstOfMonth(5),
	},
	{
		label: "مهر",
		value: getFirstOfMonth(6),
	},
	{
		label: "آبان",
		value: getFirstOfMonth(7),
	},
	{
		label: "آذر",
		value: getFirstOfMonth(8),
	},
	{
		label: "دی",
		value: getFirstOfMonth(9),
	},
	{
		label: "بهمن",
		value: getFirstOfMonth(10),
	},
	{
		label: "اسفند",
		value: getFirstOfMonth(11),
	},
];

const seasonalTimeFrames = [
	{
		label: "بهار",
		value: getFirstOfMonth(0),
	},
	{
		label: "تابستان",
		value: getFirstOfMonth(3),
	},
	{
		label: "پاییز",
		value: getFirstOfMonth(6),
	},
	{
		label: "زمستان",
		value: getFirstOfMonth(9),
	},
];

const yearlyTimeFrames = Array.from({ length: 4 }, (_, i) => {
	const year = currentJYear + i;
	return {
		label: `${year}`,
		value: getFirstOfYear(year),
	};
});

export { monthlyTimeFrames, seasonalTimeFrames, yearlyTimeFrames, timeFrames };
