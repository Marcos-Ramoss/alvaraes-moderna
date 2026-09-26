import { cn } from "@/lib/utils";

type LoadingLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  alt?: string;
};

export function LoadingLogo({
  className,
  size = "md",
  alt = "Carregando...",
}: LoadingLogoProps) {
  const sizeClasses = {
    sm: "size-24 p-4",
    md: "size-36 p-6",
    lg: "size-44 p-8",
  }[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-white shadow-2xl animate-pulse",
        sizeClasses,
        className
      )}
    >
      <img
        src="/logo.png"
        alt={alt}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export default LoadingLogo;
