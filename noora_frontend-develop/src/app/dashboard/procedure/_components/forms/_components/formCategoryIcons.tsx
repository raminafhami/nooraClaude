import {
	FaBoxesStacked,
	FaBuildingShield,
	FaClipboardCheck,
	FaFileLines,
	FaPeopleGroup,
	FaScrewdriverWrench,
	FaUserTie,
} from "react-icons/fa6";

// Form cards show an icon per spec section 4. There's no per-form custom
// icon field - a category-keyed icon is simpler and still visually
// distinguishes form types, without adding an icon-picker to the builder.
const CATEGORY_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
	بازرسی: FaClipboardCheck,
	"منابع انسانی": FaPeopleGroup,
	اجرایی: FaUserTie,
	"تضمین کیفیت": FaBuildingShield,
	تولید: FaBoxesStacked,
	"نگهداری و تعمیرات": FaScrewdriverWrench,
};

function getFormCategoryIcon(categoryTitle?: string) {
	return (categoryTitle && CATEGORY_ICON[categoryTitle]) || FaFileLines;
}

export { getFormCategoryIcon };
