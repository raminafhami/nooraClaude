enum PropertyStatus {
	Active = "active",
	UnderMaintenance = "underMaintenance",
	Decommissioned = "decommissioned",
}

const propertyStatuses: Record<PropertyStatus, { title: string }> = {
	[PropertyStatus.Active]: { title: "فعال" },
	[PropertyStatus.UnderMaintenance]: { title: "در دست تعمیر" },
	[PropertyStatus.Decommissioned]: { title: "اسقاط شده" },
};

export { PropertyStatus, propertyStatuses };
