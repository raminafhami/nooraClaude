export const userTaskKeys = [
    { processDefinitionKey: "Inspection_Case_IC", taskKey: "InformationFormByExpert" },
    { processDefinitionKey: "Inspection_Case_LC", taskKey: "InformationForm" },
    { processDefinitionKey: "Inspection_Case_Bank_COI", taskKey: "InitialForm" },
    { processDefinitionKey: "Inspection_Case_SC", taskKey: "InformationForm" },
    { processDefinitionKey: "Inspection_Case_COI", taskKey: "InformationFormByAdmin" },
  ];

  export function detectBankAccountName(bankAccountCode: string) {
    if (!bankAccountCode) return '';
    const dlCode = bankAccountCode.split('::')[1];
    const slCode = bankAccountCode.split('::')[0];

    const bankAccounts = [
      {
        title: 'سپه / نورا (171800185402)',
        slCode: '111005',
        dlCode: '001',
      },
      {
        title: 'ملی / فریما فرخ مهر',
        slCode: '111005',
        dlCode: '002',
      },
      {
        title: 'ملی / هومن علایی (0226892601006)',
        slCode: '111005',
        dlCode: '003',
      },
      {
        title: 'سپه / کارت خوان',
        slCode: '111005',
        dlCode: '004',
      },
      {
        title: 'تجارت / نورا (2904059288)',
        slCode: '111005',
        dlCode: '007',
      },
      {
        title: 'تجارت / نورا (2904357033)',
        slCode: '111005',
        dlCode: '008',
      },
      {
        title: 'پاسارگاد / هومن علائی (216/8000/14020257/1)',
        slCode: '111005',
        dlCode: '009',
      },
      {
        title: 'پاسارگاد / کیارش شبدیز (320800514951)',
        slCode: '111005',
        dlCode: '016',
      },
      {
        title: 'توسعه تعاون / نورا (313.311.7117546.1)',
        slCode: '111005',
        dlCode: '017',
      },
      {
        title: 'تجارت / کارت خوان',
        slCode: '111005',
        dlCode: '019',
      },
      {
        title: 'درگاه پرداخت',
        slCode: '111005',
        dlCode: '020',
      },
    ];

    const account = bankAccounts.find(
      (acc) => acc.dlCode === dlCode && acc.slCode === slCode,
    );
    return account ? account.title : undefined;
  }

  export function detectGoodFieldByKey(key: string): string {
    if (!key) return '';
    const goods = [
      {
        id: '2e5ffd970b9343ab90274c42',
        title: 'مواد نفتی و پتروشیمی',
        isDeleted: false,
      },
      {
        id: '5b7453ddf56a4c1aa0aafab6',
        title: 'محصولات معدنی غیرفلزی و مصالح ساختمانی',
        isDeleted: false,
      },
      {
        id: 'ec67038b799c4ab39c0591b0',
        title: 'کانی های معدنی',
        isDeleted: false,
      },
      {
        id: 'c738278336fd4fef9154bcd7',
        title: 'محصولات پلیمری (لاستیکی و پلاستیکی)',
        isDeleted: false,
      },
      {
        id: '8285bfe7c06843cbbd0b1bb7',
        title: 'محصولات شیمیایی',
        isDeleted: false,
      },
      {
        id: '7bc164cb9b5e4c3da1b04abc',
        title: 'چوب و فرآورده های چوبی، سلولزی و کاغذ',
        isDeleted: false,
      },
      {
        id: '7988bc0626874c189e024f17',
        title: 'نساجی و چرم',
        isDeleted: false,
      },
      {
        id: '69cc6555c7df4db0a5ae08a3',
        title: 'لوازم و تجهیزات مکانیکی، اجزا و قطعات آن',
        isDeleted: false,
      },
      {
        id: 'e9051a95820140d5a5ef5362',
        title: 'فلزات معمولی و مصنوعات آنها',
        isDeleted: false,
      },
      {
        id: 'd9553aa0ae9f4f7d8d013bba',
        title: 'وسایط نیرو محرکه، اجزا و قطعات آنها',
        isDeleted: false,
      },
      {
        id: 'e03ec950dea14613af1b361c',
        title: 'لوازم و تجهیزات ورزشی و تفریحی',
        isDeleted: false,
      },
      {
        id: '365fc9521dcb4eb38e3d5b38',
        title: 'لوازم و تجهیزات برقی، اجزا و قطعات آنها',
        isDeleted: false,
      },
      {
        id: '45e5bee17773498097b12ed6',
        title: 'تجهیزات اندازه گیری و ابزار دقیق',
        isDeleted: false,
      },
      {
        id: '9a255de481134b258eb6d55b',
        title: 'محصولات کشاورزی غیرخوراکی',
        isDeleted: false,
      },
      {
        id: 'f913f181f9ae42638f1d11e1',
        title: 'وسایل و تجهیزات پزشکی',
        isDeleted: false,
      },
      {
        id: '91036e2f871843d9a380474f',
        title: 'روغن و چربی های خوراکی',
        isDeleted: false,
      },
      {
        id: '871250a8d555498ebc555170',
        title: 'غلات',
        isDeleted: false,
      },
      {
        id: '1a822f18079c46f297c5b042',
        title: 'فراورده های غذایی و محصولات کشاورزی و افزودنی خوراکی',
        isDeleted: false,
      },
      {
        id: '3bc8ee00bf9e4d299f15b0c9',
        title: 'آرایشی و بهداشتی',
        isDeleted: false,
      },
      {
        id: '430005',
        title: 'تایر',
        isDeleted: true,
      },
      {
        id: '430023',
        title: 'صنعتی/ابزار دقیق',
        isDeleted: true,
      },
      {
        id: '430026',
        title: 'صنعتی/تجهیزات آزمایشگاهی',
        isDeleted: true,
      },
      {
        id: '430022',
        title: 'صنعتی/تجهیزات مکانیکی',
        isDeleted: true,
      },
      {
        id: '430025',
        title: 'صنعتی/صنایع فلزی',
        isDeleted: true,
      },
      {
        id: '430014',
        title: 'لوازم و تجهیزات الکتریکی و الکترونیکی',
        isDeleted: true,
      },
      {
        id: '430013',
        title: 'لوازم و تجهیزات ورزشی',
        isDeleted: true,
      },
      {
        id: '430012',
        title: 'لوازم و تجهیزات پزشکی',
        isDeleted: true,
      },
      {
        id: '433024',
        title: 'ماشین آلات صنعتی(خط تولید)',
        isDeleted: true,
      },
      {
        id: '430015',
        title: 'مصرفی/اثاثیه و لوازم برقی',
        isDeleted: true,
      },
      {
        id: '430010',
        title: 'مصرفی/سلولزی',
        isDeleted: true,
      },
      {
        id: '430016',
        title: 'مصرفی/قطعات خودرو',
        isDeleted: true,
      },
      {
        id: '430020',
        title: 'مصرفی/قطعات موتوور سیکلت',
        isDeleted: true,
      },
      {
        id: '430017',
        title: 'مصرفی/لوازم اداری',
        isDeleted: true,
      },
      {
        id: '430007',
        title: 'مصرفی/لوازم تحریر',
        isDeleted: true,
      },
      {
        id: '430019',
        title: 'مصرفی/لوازم شیشه ای و سرامیکی',
        isDeleted: true,
      },
      {
        id: '430018',
        title: 'مصرفی/لوازم و محصولات آرایشی و بهداشتی',
        isDeleted: true,
      },
      {
        id: '430021',
        title: 'مصرفی/محصولات شوینده',
        isDeleted: true,
      },
      {
        id: '430008',
        title: 'مصرفی/مواد شیمیایی',
        isDeleted: true,
      },
      {
        id: '430011',
        title: 'مصرفی/نساجی و چرم',
        isDeleted: true,
      },
      {
        id: '430009',
        title: 'مصرفی/پلیمری',
        isDeleted: true,
      },
      {
        id: '430001',
        title:
          'مواد غذایی، محصولات کشاورزی و روغن های گیاهی/ مواد غذایی، محصولات کشاورزی،روغن های گیاهی',
        isDeleted: true,
      },
      {
        id: '430002',
        title: 'مواد معدنی / مصالح ساختمانی غیر فلزی ',
        isDeleted: true,
      },
      {
        id: '430006',
        title: 'مواد معدنی/کانی ها',
        isDeleted: true,
      },
    ];

    const good = goods.find((g) => g.id === key);
    return good ? good.title : undefined;
  }
