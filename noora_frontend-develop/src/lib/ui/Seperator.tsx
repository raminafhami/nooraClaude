import { twMerge } from "tailwind-merge";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export function Seperator({ className, ...props }: Props): React.ReactNode {
  return (
    <div
      className={twMerge(
        "w-full h-1 rounded-xl bg-gray-100 col-span-full shrink-0",
        className
      )}
      {...props}
    ></div>
  );
}
