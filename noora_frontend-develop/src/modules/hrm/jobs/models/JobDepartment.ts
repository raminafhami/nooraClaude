const JobDepartment = {
	AccommodationInspection: "accommodation-inspection",
	Consultant: "consultant",
	ConstructionLab: "construction-lab",
	CorrosionInspection: "corrosion-inspection",
	CraneInspection: "crane-inspection",
	Financial: "financial",
	GoodsInpection: "goods-inspection",
	HalalProductCertificationBody: "halal-product-certification-body",
	HumanRecources: "human-recources",
	IT: "it",
	Management: "management",
	QualityAssurance: "quality-assurance",
	SoftwareDevelopment: "software-development",
	Training: "training",
	VehicleTypeConfirmationInspection: "vehicle-type-confirmation-inspection",
	WeldingInspection: "welding-inspection",
	LiftInspection: "lift-inspection",
	EnergyConsumptionStandardInspection: "energy-consumption-standard-inspection",
} as const;

type JobDepartment = (typeof JobDepartment)[keyof typeof JobDepartment];

const jobDepartments: {
	value: JobDepartment;
	label: string;
}[] = [
	{
		value: JobDepartment.Management,
		label: "مدیریت",
	},
	{
		value: JobDepartment.Consultant,
		label: "مشاوره",
	},
	{
		value: JobDepartment.ConstructionLab,
		label: "آزمایشگاه ساختمانی",
	},
	{
		value: JobDepartment.Financial,
		label: "مالی",
	},
	{
		value: JobDepartment.GoodsInpection,
		label: "بازرسی کالا",
	},
	{
		value: JobDepartment.AccommodationInspection,
		label: "بازرسی مراکز اقامتی (هتل، آپارتمان، زائرسرا)",
	},
	{
		value: JobDepartment.CorrosionInspection,
		label: "بازرسی خوردگی",
	},
	{
		value: JobDepartment.WeldingInspection,
		label: "بازرسی جوش و انجام آزمون های غیرمخرب",
	},
	{
		value: JobDepartment.CraneInspection,
		label: "بازرسی انواع جرثقیل و لیفتراک",
	},
	{
		value: JobDepartment.VehicleTypeConfirmationInspection,
		label: "بازرسی خودرو و نیرو محرکه",
	},
	{
		value: JobDepartment.LiftInspection,
		label: "بازرسی آسانسور",
	},
	{
		value: JobDepartment.EnergyConsumptionStandardInspection,
		label: "بازرسی تعیین معیار مصرف انرژی",
	},
	{
		value: JobDepartment.HumanRecources,
		label: "منابع انسانی و اداری",
	},
	{
		value: JobDepartment.IT,
		label: "فناوری اطلاعات",
	},
	{
		value: JobDepartment.QualityAssurance,
		label: "تضمین کیفیت",
	},
	{
		value: JobDepartment.SoftwareDevelopment,
		label: "توسعه نرم افزار",
	},
	{
		value: JobDepartment.Training,
		label: "آموزش",
	},
	{
		value: JobDepartment.HalalProductCertificationBody,
		label: "نهاد گواهی کننده محصولات (حلال)",
	},
];

export { JobDepartment, jobDepartments };
