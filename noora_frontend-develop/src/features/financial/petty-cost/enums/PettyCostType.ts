enum PettyCostType {
	Official = "official",
	Unofficial = "unofficial",
}

const pettyCostTypes: Record<PettyCostType, { title: string }> = {
	[PettyCostType.Official]: { title: "تنخواه" },
	[PettyCostType.Unofficial]: { title: "دستور پرداخت" },
};

export { PettyCostType, pettyCostTypes };
