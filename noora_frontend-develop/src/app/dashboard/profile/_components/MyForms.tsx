import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { HiOutlinePresentationChartLine } from "react-icons/hi";
import { TiInfoOutline } from "react-icons/ti";
import { toast } from "sonner";

import GetAllForms from "@/api/forms/getAllForms";
import GetPersonnelFormResults from "@/api/forms/getPersonnelFormResults";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { EvaluationTable } from "../../procedure/_components/evaluation-form/_components/EvaluationTable";

interface Data {
	avgScore: number;
	status: string;
	form: {
		title: string;
		certificateCode: string;
		id: string;
	};
	id: string;
}

export default function MyForms({}) {
	const { identity } = useLoggedInUser();

	const [personnelInfo, setPersonnelInfo] = useState<any>();
	const [results, setResults] = useState<Data[]>();
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(999);
	const [loading, setLoading] = useState<boolean>(false);
	const [reslutShow, setReslutShow] = useState<boolean>(false);
	const [pendingShow, setPendingShow] = useState<boolean>(true);
	const todayDate = moment(new Date()).locale("en").format("YYYY/MM/DD");
	function resultBtn() {
		setReslutShow(true);
		setPendingShow(false);
	}
	function pendingBtn() {
		setPendingShow(true);
		setReslutShow(false);
	}

	async function getFormResult() {
		setLoading(true);
		try {
			let res = await GetPersonnelFormResults({
				page: 0,
				size: 999,
			});
			if (res) {
				setResults(res.result.data);
				setLoading(false);
			}
		} catch (e) {
			toast.error("خطایی رخ داد");
			setLoading(false);
		}
	}

	useEffect(() => {
		let getId;
		try {
			if (identity.id && !reslutShow) {
				let res = GetAllForms({
					page: currentPage,
					size: size,
					userId: identity.id,
				});
				res.then((response) => {
					if (response) {
						setPersonnelInfo(response.result.data);
						setItems(response.result.count - 1);
					}
				});
			}
		} catch (e) {
			toast.error("خطایی رخ داد!");
		}
	}, [currentPage, identity.id, reslutShow, size]);

	useEffect(() => {
		if (reslutShow) {
			getFormResult();
		}
	}, [reslutShow]);
	return (
		<div>
			<div className="mb-[1rem] flex gap-x-3">
				<Button onClick={() => pendingBtn()}>
					<TiInfoOutline className="ml-1" size={15} />
					فرم های من
				</Button>
				<Button onClick={() => resultBtn()}>
					<HiOutlinePresentationChartLine className="ml-2" size={13} />
					نتایج من
				</Button>
			</div>
			{reslutShow && (
				<Layout.Content className="mt-10 select-none p-0">
					<Panel.Root className="scrollbar-thin scrollbar-thumb-gray-100 scrollbar-thumb-rounded-lg h-[22rem] overflow-auto">
						<Panel.Container>
							<Table.Root>
								<Table.Head>
									<Table.Cell>ردیف</Table.Cell>
									<Table.Cell>نام ارزیابی</Table.Cell>
									<Table.Cell>وضعیت</Table.Cell>
									<Table.Cell>نمره</Table.Cell>
								</Table.Head>

								{loading ? (
									<Table.Row>
										<Table.Cell>
											<Loading size={"sm"} />
										</Table.Cell>
									</Table.Row>
								) : results?.length ? (
									results?.map((result, index: number) => (
										<Table.Row key={index}>
											<Table.Cell>{index + 1}</Table.Cell>
											<Table.Cell>{result.form.title}</Table.Cell>
											<Table.Cell>{result.status}</Table.Cell>
											<Table.Cell>{result.avgScore}</Table.Cell>
										</Table.Row>
									))
								) : (
									<Table.Row>
										<Table.Cell>نتیجه ای یافت نشد...</Table.Cell>
									</Table.Row>
								)}
							</Table.Root>
						</Panel.Container>
					</Panel.Root>
				</Layout.Content>
			)}
			{pendingShow && personnelInfo?.length
				? personnelInfo.map(
						(form: any, index: number) =>
							todayDate <
								moment(form.endDate).locale("en").format("YYYY/MM/DD") && (
								<EvaluationTable
									key={index}
									loading={loading}
									form={form}
									isEditMode={true}
									index={index}
									formId={form.id}
								/>
							),
					)
				: reslutShow
					? ""
					: "موردی یافت نشد..."}
			{/* {!reslutShow && (
        <div>
          <Pagination
            items={items}
            currentPage={currentPage}
            size={size}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        </div>
      )} */}
		</div>
	);
}
