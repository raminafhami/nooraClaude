"use client";

import { FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Pagination as PaginationRoot,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";

import PaginationSizes from "./models/paginationSizes";

interface PaginationProps {
	items: number;
	currentPage: number;
	size: number;
	setSize?: ((i: number) => void) | null;
	onPageChange: (i: number) => void;
	loading?: boolean;
	className?: string;
}

export default function Pagination({
	items,
	currentPage,
	size,
	onPageChange,
	loading,
	className,
	setSize,
}: PaginationProps) {
	const pagesCount = Math.ceil(items / size);

	// if (pagesCount === 1) return null;

	const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);

	const firstPage = 1;

	const nextPage = Math.min(currentPage + 2, items);

	const prevPage = Math.max(currentPage, firstPage);

	const lastPage = pages.length;

	if (loading) {
		return <Loading className="animate-bounce justify-center" size="sm" />;
	}

	return (
		<PaginationRoot
			className={`flex flex-col items-center justify-center gap-1.5 bg-transparent px-6 sm:flex-row ${className}`}
		>
			{pages?.length > 1 && (
				<PaginationContent
					className="isolate flex w-full flex-col gap-x-1.5 gap-y-3 sm:w-auto sm:flex-row"
					aria-label="Pagination"
				>
					<PaginationItem
						className={cn(
							"relative inline-flex h-9 w-full cursor-pointer select-none items-center gap-1 rounded-xl bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto",
							currentPage + 1 === firstPage && "cursor-default",
						)}
						onClick={() =>
							currentPage + 1 > firstPage && onPageChange(prevPage - 1)
						}
					>
						<FaChevronRight size={10} />
						صفحه قبل
					</PaginationItem>

					<div className="flex w-full flex-col items-center gap-1.5 xs:flex-row sm:w-auto">
						<div className="flex w-full flex-1 grow items-center gap-1.5 sm:w-auto">
							<PaginationItem
								key={firstPage}
								onClick={() => onPageChange(firstPage - 1)}
								aria-current="page"
								className={cn(
									"relative flex h-9 w-full items-center rounded-xl bg-white px-4 pb-2 pt-2.5 sm:inline-flex sm:w-auto",
									currentPage + 1 === firstPage
										? "bg-blue-500 text-white hover:select-none hover:bg-blue-500"
										: "cursor-pointer text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
								)}
							>
								{firstPage}
							</PaginationItem>

							{...pages?.slice(prevPage - 1, nextPage).map(
								(pg: number) =>
									pg !== firstPage &&
									pg !== lastPage &&
									pg !== [...pages]?.slice(-3, -1)[0] &&
									pg !== [...pages]?.slice(-3, -1)[1] && (
										<PaginationItem
											key={pg}
											onClick={() => onPageChange(pg - 1)}
											aria-current="page"
											className={`relative flex h-9 w-full items-center rounded-xl bg-white px-4 pb-2 pt-2.5 sm:inline-flex sm:w-auto ${
												currentPage + 1 === pg
													? "bg-blue-500 text-white hover:select-none hover:bg-blue-500"
													: "cursor-pointer text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
											}`}
										>
											{pg}
										</PaginationItem>
									),
							)}
						</div>

						{pages?.length > 3 && (
							<div className="flex w-full flex-1 shrink items-center justify-center gap-1.5 xs:w-auto xs:flex-none">
								<PaginationItem
									key={"..."}
									aria-current="page"
									className={`relative inline-flex w-full items-center shadow-none xs:w-auto`}
								>
									<PaginationEllipsis />
								</PaginationItem>
							</div>
						)}

						<div className="flex w-full flex-1 grow items-center gap-1.5 sm:w-auto">
							{...pages?.slice(-3, lastPage).map(
								(pg: number) =>
									pg !== firstPage && (
										<PaginationItem
											key={pg}
											onClick={() => onPageChange(pg - 1)}
											aria-current="page"
											className={`relative flex h-9 w-full items-center rounded-xl bg-white px-4 pb-2 pt-2.5 sm:inline-flex sm:w-auto ${
												currentPage + 1 === pg
													? "bg-blue-500 text-white hover:select-none hover:bg-blue-500"
													: "cursor-pointer text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
											}`}
										>
											{pg}
										</PaginationItem>
									),
							)}
						</div>
					</div>

					<PaginationItem
						onClick={() =>
							currentPage + 1 < [...pages].slice(-1)[0] &&
							onPageChange(nextPage - 1)
						}
						className={`h-9 w-full select-none sm:w-auto ${
							currentPage + 1 < [...pages].slice(-1)[0] &&
							"cursor-pointer bg-white"
						} relative inline-flex items-center gap-1 rounded-xl px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0`}
					>
						صفحه بعد
						<FaChevronLeft size={10} />
					</PaginationItem>
				</PaginationContent>
			)}

			{setSize && !loading && (
				<DropdownMenu>
					<DropdownMenuTrigger
						className={`relative inline-flex w-full select-none items-center justify-center rounded-xl px-4 py-2 text-gray-400 shadow-md ring-1 ring-inset ring-gray-300 transition-colors duration-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 sm:w-auto`}
					>
						{size ? (size > 100 ? "همه" : size) : "تعداد نمایش"}
						<FaChevronDown className="ms-2" size={10} />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{PaginationSizes.map((size) => (
							<DropdownMenuItem
								key={size.label}
								className="cursor-pointer justify-center hover:bg-gray-200"
								onClick={() => {
									setSize(size.value);
									onPageChange(0);
								}}
							>
								{size.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</PaginationRoot>
	);
}
