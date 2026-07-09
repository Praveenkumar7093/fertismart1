import { Sprout } from "lucide-react";

interface FertiSmartLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const FertiSmartLogo = ({ 
  size = "md", 
  className = "", 
  showText = true 
}: FertiSmartLogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl", 
    xl: "text-3xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg`}>
        <Sprout className="h-3/4 w-3/4 text-white" />
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent ${textSizes[size]}`}>
          FertiSmart
        </span>
      )}
    </div>
  );
};

export default FertiSmartLogo;
