enum PettyErrorCode {
	InvalidCategoryIds = "Some category IDs are invalid or deleted",
	NoActiveCategoryBudget = "there is not any active category-budget",
	NoParentCategoryBudget = "No active category budget found for parent category IDs",
	BudgetExpired = "The budget allocation period has expired",
	DeleteFailedHasCosts = "delete failed. This petty cash has at least one petty cost",
	PettyCashNotFound = "PettyCash not found",
	CannotReduceAmount = "You cannot reduce the pettyCash amount",
	UnauthorizedToModify = "You are not authorized to modify this cost",
	NoRecordsFound = "No petty cash records found.",
	InsufficientBalance = "You do not have enough balance to register a petty cost.",
	PettyCostNotFound = "petty cost not found!",
	CannotEditOfficialCost = "you cannot edit official cost",
	CategoryBudgetNotFound = "Category budget not found. Please ensure that all costs have both a categoryId and a spentDate.",
	FileNotAssociatedWithCost = "File not associated with this cost",
	CategoryNotFound = "category not found",
	SetSubcategoryBudgetNotAllowed = "you cannot set CategoryBudget for sub-category",
	CategoryBudgetConflict = "You have an active categoryBudget in this time range!",
	CategoryBudgetNotExist = "CategoryBudget not found !",
	NoActiveBudgetAtAll = "You do not have any active category budget.",
	CannotMakeChildCategory = "you cannot make this category as a child",
	FileNotAssociatedWithPettyCash = "File not associated with this pettyCash",
	NoParentCategoryBudgetWithIds = "No active category budget found for parent category IDs: {ids}",
	BudgetExpiredWithName = "The {budgetName} budget allocation period has expired.",
	UnauthorizedToModifyCash = "You are not able to modify this cash",
	CostDeleteNotAllowedPaidPending = "you are not allowed to delete paid or pending cost",
	CostDeleteNotAllowed = "you are not allowed to delete this cost",
	OfficialCostDeleteNotAllowed = "You are not allowed to delete official costs.",
	PaidCostDeleteNotAllowed = "You are not allowed to delete paid costs.",
	CostNotFound = "Cost does not exist",
	UnauthorizedToModifyCost = "You are not able to modify this cost",
}

const pettyErrorMessages: Record<PettyErrorCode, string> = {
	[PettyErrorCode.InvalidCategoryIds]:
		"برخی دسته‌بندی‌ها نامعتبر یا حذف شده‌اند.",
	[PettyErrorCode.NoActiveCategoryBudget]:
		"هیچ بودجه فعالی برای دسته‌بندی‌ها وجود ندارد.",
	[PettyErrorCode.NoParentCategoryBudget]:
		"هیچ بودجه فعالی برای دسته‌بندی‌های والد وجود ندارد.",
	[PettyErrorCode.BudgetExpired]:
		"دوره تخصیص بودجه برای این دسته‌بندی منقضی شده است.",
	[PettyErrorCode.DeleteFailedHasCosts]:
		"امکان حذف وجود ندارد. این تنخواه دارای هزینه است.",
	[PettyErrorCode.PettyCashNotFound]: "تنخواه مورد نظر یافت نشد.",
	[PettyErrorCode.CannotReduceAmount]: "امکان کاهش مبلغ تنخواه وجود ندارد.",
	[PettyErrorCode.UnauthorizedToModify]: "شما مجاز به ویرایش این هزینه نیستید.",
	[PettyErrorCode.NoRecordsFound]: "هیچ رکوردی برای تنخواه یافت نشد.",
	[PettyErrorCode.InsufficientBalance]:
		"موجودی کافی برای ثبت هزینه وجود ندارد.",
	[PettyErrorCode.PettyCostNotFound]: "هزینه مورد نظر یافت نشد.",
	[PettyErrorCode.CannotEditOfficialCost]:
		"امکان ویرایش هزینه رسمی وجود ندارد.",
	[PettyErrorCode.CategoryBudgetNotFound]:
		"بودجه دسته‌بندی یافت نشد. لطفاً مطمئن شوید هزینه‌ها categoryId و spentDate دارند.",
	[PettyErrorCode.FileNotAssociatedWithCost]: "فایل به این هزینه تعلق ندارد.",
	[PettyErrorCode.CategoryNotFound]: "دسته‌بندی یافت نشد.",
	[PettyErrorCode.SetSubcategoryBudgetNotAllowed]:
		"امکان تنظیم بودجه برای زیر‌دسته وجود ندارد.",
	[PettyErrorCode.CategoryBudgetConflict]:
		"در این بازه زمانی، بودجه‌ای فعال برای این دسته وجود دارد.",
	[PettyErrorCode.CategoryBudgetNotExist]: "بودجه دسته‌بندی موجود نیست.",
	[PettyErrorCode.NoActiveBudgetAtAll]: "هیچ بودجه فعالی برای شما وجود ندارد.",
	[PettyErrorCode.CannotMakeChildCategory]:
		"نمی‌توانید این دسته را به عنوان زیرمجموعه تنظیم کنید.",
	[PettyErrorCode.FileNotAssociatedWithPettyCash]:
		"فایل به این تنخواه تعلق ندارد.",
	[PettyErrorCode.NoParentCategoryBudgetWithIds]:
		"هیچ بودجه فعالی برای دسته‌بندی‌های والد (${ids}) یافت نشد.",
	[PettyErrorCode.BudgetExpiredWithName]:
		"دوره تخصیص بودجه برای بودجه ${budgetName} به پایان رسیده است.",
	[PettyErrorCode.UnauthorizedToModifyCash]:
		"شما مجاز به ویرایش این تنخواه نیستید.",
	[PettyErrorCode.CostDeleteNotAllowedPaidPending]:
		"امکان حذف هزینه پرداخت‌شده یا در حال بررسی وجود ندارد.",
	[PettyErrorCode.CostDeleteNotAllowed]: "امکان حذف این هزینه وجود ندارد.",
	[PettyErrorCode.OfficialCostDeleteNotAllowed]:
		"امکان حذف هزینه رسمی وجود ندارد.",
	[PettyErrorCode.PaidCostDeleteNotAllowed]:
		"امکان حذف هزینه پرداخت‌شده وجود ندارد.",
	[PettyErrorCode.CostNotFound]: "هزینه‌ای با این مشخصات یافت نشد.",
	[PettyErrorCode.UnauthorizedToModifyCost]:
		"شما مجاز به ویرایش این هزینه نیستید.",
};

export { PettyErrorCode, pettyErrorMessages };
