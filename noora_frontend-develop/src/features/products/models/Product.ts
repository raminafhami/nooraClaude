import { ProductCategory } from "./ProductCategory";

type Product = {
	id: string;
	name: string;
	category: ProductCategory;
	stockQuantity: number;
	alertThreshold?: number | null;
};

export type { Product };
