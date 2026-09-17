import * as React from "react";

import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";

const Table = React.forwardRef<
	HTMLTableElement,
	{
		loading?: boolean;
		pagination?: React.ReactNode;
		slotProps?: Partial<{
			root: React.HTMLAttributes<HTMLDivElement>;
			wrapper: React.HTMLAttributes<HTMLDivElement>;
		}>;
	} & React.HTMLAttributes<HTMLTableElement>
>(({ className, loading = false, pagination, slotProps, ...props }, ref) => {
	const { className: wrapperClassName, ...wrapperProps } =
		slotProps?.wrapper ?? {};
	const { className: rootClassName, ...rootProps } = slotProps?.root ?? {};

	return (
		<div
			className={cn("relative space-y-6", wrapperClassName)}
			{...wrapperProps}
		>
			<div
				className={cn(
					"relative w-full cursor-default overflow-auto rounded-2xl border border-gray-200 bg-white",
					loading && "blur-md",
					rootClassName,
				)}
				{...rootProps}
			>
				<table
					ref={ref}
					className={cn(
						"w-full caption-bottom rounded-2xl bg-white",

						className,
					)}
					{...props}
				/>
			</div>

			{pagination && (
				<div className={cn(loading && "invisible")}>{pagination}</div>
			)}

			{loading && (
				<div className="absolute inset-0 !m-0">
					<Loading horizontalPlacement="center" />
				</div>
			)}
		</div>
	);
});
Table.displayName = "Table";

const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead
		ref={ref}
		className={cn("bg-gray-100 [&_tr]:border-b", className)}
		{...props}
	/>
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody
		ref={ref}
		className={cn("[&_tr:last-child]:border-0", className)}
		{...props}
	/>
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tfoot
		ref={ref}
		className={cn(
			"border-t bg-muted/50 font-normal [&>tr]:last:border-b-0",
			className,
		)}
		{...props}
	/>
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement> & {
		"data-static"?: boolean;
		"data-state"?: "selected" | ({} & string);
	}
>(({ className, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			"border-b transition-colors data-[state=selected]:bg-gradient-to-l data-[state=selected]:from-primary-100 data-[state=selected]:to-white",
			!props["data-static"] && "hover:bg-muted/50",
			className,
		)}
		{...props}
	/>
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<th
		ref={ref}
		className={cn(
			"h-12 px-4 text-start align-middle font-normal text-muted-foreground first-of-type:ps-6 last-of-type:pe-6 [&:has([role=checkbox])]:pe-0",
			className,
		)}
		{...props}
	/>
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			"p-4 align-middle first-of-type:ps-6 last-of-type:pe-6 [&:has([role=checkbox])]:pe-0",
			className,
		)}
		{...props}
	/>
));
TableCell.displayName = "TableCell";

const TableActions = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, onClick, ...props }, ref) => {
	return (
		<div
			className={cn(
				"relative flex h-6 w-fit cursor-default items-center justify-center rounded-lg border-s-2 border-s-gray-300 bg-gray-100 px-2 text-xs transition-colors group-hover:bg-gray-200",
				className,
			)}
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(e);
			}}
			{...props}
		>
			{children}
		</div>
	);
});
TableActions.displayName = "TableActions";

const TableAction = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
	return (
		<div
			className={cn(
				"flex h-full min-w-[1.5rem] cursor-pointer items-center justify-center transition-colors",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
});
TableAction.displayName = "TableAction";

const TableCaption = React.forwardRef<
	HTMLTableCaptionElement,
	React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
	<caption
		ref={ref}
		className={cn("mt-4 text-muted-foreground", className)}
		{...props}
	/>
));
TableCaption.displayName = "TableCaption";

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableActions,
	TableAction,
	TableCaption,
};
