"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { toast } from "sonner";

import GetAllProductById from "@/api/products/getAllProductById";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";
import { Panel } from "@/ui/Panel";

import DeleteProduct from "./_components/modal/DeleteProduct";
import { ProductPage } from "./_components/ProductPage";

interface SearchAttributeProps {
	expertiseId?: string;
}

export default function TrainingPage() {
	const [product, setProduct] = useState<any>();
	const [loading, setLoading] = useState<boolean>(false);
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();
	const [deleteModal, setDeleteActionModal] = useState<boolean>(false);

	const params = useParams();

	const getProduct = useCallback(async () => {
		setLoading(true);
		try {
			if (params.id) {
				let res = GetAllProductById({ id: params.id as string });
				res.then((res) => {
					if (res) {
						setProduct(res.result);
						setLoading(false);
					}
				});
			}
		} catch (e) {
			toast.error("خطایی در دریافت دسته بندی ها رخ داد!");
			setLoading(false);
		}
	}, [params.id]);
	useEffect(() => {
		getProduct();
	}, [searchAttribute, getProduct]);
	return (
		<>
			{deleteModal && (
				<DeleteProduct
					setShow={setDeleteActionModal}
					isShow={deleteModal}
					data={product}
				/>
			)}
			<Layout.Root>
				<Layout.Head title={""}>
					<div className="flex w-full justify-end gap-x-3">
						<Button
							variant="destructive"
							onClick={() => setDeleteActionModal(true)}
						>
							حذف
						</Button>

						<DynamicLink href="/dashboard/storage?tab=product">
							<Button>
								<IoIosArrowRoundBack size={30} />
							</Button>
						</DynamicLink>
					</div>
				</Layout.Head>
				<Layout.Content>
					<Panel.Root className="border-none p-0">
						<Panel.Container className="py-0">
							<ProductPage
								loading={loading}
								product={product}
								setSearch={setSearchAttribute}
								getData={getProduct}
								setLoading={setLoading}
							/>
						</Panel.Container>
					</Panel.Root>
				</Layout.Content>
			</Layout.Root>
		</>
	);
}
