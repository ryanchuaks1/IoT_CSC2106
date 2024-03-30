// Import user-defined files
import { MethodTagProps } from "@/app/api/sandbox/types";

export const MethodTag: React.FC<MethodTagProps> = ({ method }) => {
  const color = {
    GET: "bg-green-500",
    POST: "bg-blue-500",
    PUT: "bg-yellow-500",
    DELETE: "bg-red-500",
  }[method];

  return (
    <span
      className={`inline-block px-3 py-1 text-white text-xs font-bold mr-3 rounded ${color}`}
    >
      {method}
    </span>
  );
};
