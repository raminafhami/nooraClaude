"use client";

import { memo, useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import Pagination from "./Pagination";

interface PageAndSize {
	page: number;
	pageSize: number;
}

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_SIZE = 10;

function usePagination<T = any>(
	onChange: (
		page: number,
		pageSize: number,
	) => readonly [T[], number] | Promise<readonly [T[], number]>,
	initialPage?: number,
	initialPageSize?: number,
) {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [items, setItems] = useState<T[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	const [page, setPage] = useState<number>(initialPage || DEFAULT_PAGE);
	const [pageSize, setPageSize] = useState<number>(
		initialPageSize || DEFAULT_PAGE_SIZE,
	);

	const [queuedPage, setQueuedPage] = useState<PageAndSize | null>({
		page,
		pageSize,
	});
	const [isRefetching, setRefetching] = useState<boolean>(true);

	function handlePageChange(nextPage?: number, nextPageSize?: number) {
		setQueuedPage((previous) => ({
			page: nextPage ?? previous?.page ?? page,
			pageSize: nextPageSize ?? previous?.pageSize ?? pageSize,
		}));
	}

	const PaginationWrapper = memo(function PaginationWrapper({
		className,
		setSize,
		size,
		...props
	}: Omit<
		React.ComponentPropsWithoutRef<typeof Pagination>,
		"items" | "currentPage" | "size" | "onPageChange"
	> & { size?: number }) {
		return (
			<Pagination
				className={cn("mx-auto mt-2", className)}
				items={totalCount}
				currentPage={page}
				size={size ?? pageSize}
				onPageChange={(v) => handlePageChange(v, undefined)}
				loading={isLoading}
				setSize={
					setSize === null ? undefined : (v) => handlePageChange(undefined, v)
				}
				{...props}
			/>
		);
	});

	const handleChange = useCallback(
		async (page: number, pageSize: number, status: { isMounted: boolean }) => {
			try {
				setError(null);

				const [items, totalCount] = await onChange(page, pageSize);

				if (!status.isMounted) return;

				setItems(items);
				setTotalCount(totalCount);

				setPage(page);
				setPageSize(pageSize);

				setRefetching(false);
				setQueuedPage(null);
			} catch (err: any) {
				console.error(err);
				setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
			}
		},
		[onChange],
	);

	const handleRefetch = useCallback(
		(page?: number) => {
			setQueuedPage({ page: page ?? 0, pageSize });
		},
		[pageSize],
	);

	useEffect(() => {
		setRefetching(true);
	}, [handleChange]);

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		setLoading(true);

		const status: { isMounted: boolean } = {
			isMounted: true,
		};

		(async () => {
			if (queuedPage) {
				await handleChange(queuedPage.page, queuedPage.pageSize, status);
			} else if (isRefetching) {
				await new Promise((resolve) => {
					timeout = setTimeout(async () => {
						await handleChange(0, pageSize, status);
						resolve(null);
					}, 500);
				});
			}

			if (status.isMounted) {
				setLoading(false);
			}
		})();

		return () => {
			clearTimeout(timeout);
			status.isMounted = false;
		};
	}, [handleChange, isRefetching, pageSize, queuedPage]);

	return {
		error,
		isLoading,
		items,
		offset: page * pageSize,
		page,
		pageSize,
		refetch: handleRefetch,
		totalCount,
		Pagination: PaginationWrapper,
		setPage: handlePageChange,
	};
}

export { usePagination };
