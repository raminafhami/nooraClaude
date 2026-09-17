import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface RootProps extends HTMLAttributes<HTMLDivElement> {}

export function Root({ className, children, ...props }: RootProps) {
  return (
    <div
      className={twMerge(
        "px-1 border border-gray-100 rounded-xl bg-gray-200",
        className
      )}
      {...props}>
      {children}
    </div>
  );
}

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div className={twMerge("py-6 bg-white space-y-6", className)} {...props}>
      {children}
    </div>
  );
}

interface HeadProps extends HTMLAttributes<HTMLDivElement> {}

export function Head({ className, children, ...props }: HeadProps) {
  return (
    <div className={twMerge("px-6", className)} {...props}>
      {children}
    </div>
  );
}

interface BodyProps extends HTMLAttributes<HTMLDivElement> {}

export function Body({ className, children, ...props }: BodyProps) {
  return (
    <div className={twMerge("px-6", className)} {...props}>
      {children}
    </div>
  );
}
