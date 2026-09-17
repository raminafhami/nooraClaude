import { Types } from 'mongoose';
import { IndustryTypes, ProjectType } from 'src/common/const/enums';

export const industries = [
  {
    _id: new Types.ObjectId('65131335c5b4320012345678'),
    name: 'تولیدی',
    type: IndustryTypes.MAIN,
  },
  {
    _id: new Types.ObjectId('65131335c5b4320012345679'),
    name: 'خدماتی',
    type: IndustryTypes.MAIN,
  },
  {
    _id: new Types.ObjectId('65131335c5b432001234567a'),
    name: 'مصرفی',
    type: IndustryTypes.MAIN,
  },
];

export const productionSubIndustries = [
  {
    name: 'دارویی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'سیم و کابل',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'شیمیایی و پتروشیمی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'فلزات اساسی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'کاغذ',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'لاستیک و پلاستیک',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'لوازم پزشکی و علمی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'مبلمان',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'محصولات فلزی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'مصالح ساختمانی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'معدن کاوی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'نساجی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'نفت و گاز',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'جهیزات دفاعی و فضا نوردی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'تکنولوژی های پیشرفته',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'ماشین آلات و تجهیزات صنعتی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'مهندسی ساختمان عملیات عمرانی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
  {
    name: 'وسایل نقلیه و خدمات وابسته',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345678'),
  },
];

export const servicesSubIndustries = [
  {
    name: 'امنیتی و دفاعی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'پست',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'تحقیقات و تحصیلات تکمیلی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'سلامت و بهداشت',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'آژانس ها ی خدمات مسافرتی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'انتشارات و رسانه ها',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'بانک',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'بیمه',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'حمل و نقل و انبارداری',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'خدمات حرفه ای و مشاوره',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'خدمات شهری',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'سرگرمی و تفریحات',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'مخابرات',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
  {
    name: 'هتل داری و رستوران',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b4320012345679'),
  },
];

export const consumerSubIndustries = [
  {
    name: 'عمده فروشی و پخش',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b432001234567a'),
  },
  {
    name: 'کفش و محصولات چرمی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b432001234567a'),
  },
  {
    name: 'لوازم خانگی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b432001234567a'),
  },
  {
    name: 'محصولات آرایشی و بهداشتی',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b432001234567a'),
  },
  {
    name: 'مواد غذایی، آشامیدنی و دخانیات',
    type: IndustryTypes.SUB,
    parentId: new Types.ObjectId('65131335c5b432001234567a'),
  },
];

export const activityProject = [
  {
    _id: new Types.ObjectId('6701313e7d85eab881b3a44d'),
    name: 'فعالیت های مربوط به خریداران نورا آزما بین الملل',
    statuses: [
      { name: 'برنامه ریزی شده', order: 1 },
      { name: 'لغو شده', order: 2 },
      { name: 'انجام شده', order: 3 },
    ],
    members: [],
    type: ProjectType.ACTIVITY,
    createdBy: '64fc34ccac4d2e3326f95a5c',
  },
];
