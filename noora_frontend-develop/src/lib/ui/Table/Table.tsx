import { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface RootProps extends HTMLAttributes<HTMLTableElement> {}

export function Root({ className, children, ...props }: RootProps) {
  return (
    <table
      className={twMerge(
        "w-full border-separate border-spacing-0 bg-white",
        className,
      )}
      {...props}
    >
      {children}
    </table>
  );
}

interface HeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function Head({ children, ...props }: HeadProps) {
  return <thead {...props}>{children}</thead>;
}

interface BodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function Body({ children, ...props }: BodyProps) {
  return <tbody {...props}>{children}</tbody>;
}

interface RowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function Row({ children, className, ...props }: RowProps) {
  return (
    <tr className={twMerge("group", className)} {...props}>
      {children}
    </tr>
  );
}

interface CellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  as?: "td" | "th";
  role?: "actions";
}

export function Cell({ className, children, as = "td", ...props }: CellProps) {
  return as === "td" ? (
    <td
      className={twMerge(
        "relative px-4 py-3 leading-6 border-b border-b-gray-100 transition-colors group-last:border-b-0 group-hover:bg-gray-50",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  ) : (
    <th
      className={twMerge("relative px-4 py-4 font-normal", className)}
      {...props}
    >
      {children}
    </th>
  );
}

interface ActionsProps extends HTMLAttributes<HTMLDivElement> {
  as?: "td" | "th";
}

export function Actions({
  className,
  children,
  as = "td",
  onClick,
  ...props
}: ActionsProps) {
  return (
    <div
      className={twMerge(
        "relative flex h-6 px-2 border-s-2 w-fit border-s-gray-300 rounded-lg text-xs items-center justify-center transition-colors group-hover:bg-gray-200",
        as === "td" && "bg-gray-100",
        as === "th" && "w-fit bg-gray-200",
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
}

interface ActionProps extends HTMLAttributes<HTMLDivElement> {}

export function Action({ className, children, ...props }: ActionProps) {
  return (
    <div
      className={twMerge(
        "flex min-w-[1.5rem] h-full transition-colors cursor-pointer items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
