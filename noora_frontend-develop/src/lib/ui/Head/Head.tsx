import { twMerge } from "tailwind-merge";

interface RootProps {
  children: React.ReactNode;
  className?: string;
}

export function Root({ children, className }: RootProps) {
  return (
    <div
      className={twMerge(
        "flex flex-col sm:flex-row gap-3 sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TitleProps {
  children?: React.ReactNode;
  text?: string;
}

export function Title({ children, text }: TitleProps) {
  if (text) {
    return (
      <div className="flex h-8 gap-x-3 items-center">
        <span className="text-base/8">{text}</span>
        {children}
      </div>
    );
  }

  return <div className="h-8 text-base/8">{children}</div>;
}

interface NavProps {
  children: React.ReactNode;
  className?: string;
}

export function Nav({ children, className }: NavProps) {
  return (
    <div className={twMerge("flex gap-x-3 items-center", className)}>
      {children}
    </div>
  );
}
