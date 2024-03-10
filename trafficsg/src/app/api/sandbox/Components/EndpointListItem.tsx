import { MethodTag } from "./MethodTag";
import { EndpointListItemProps } from "../types";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export const EndpointListItem: React.FC<EndpointListItemProps> = ({
  method,
  path,
  description,
  html
}) => {
  return (
    <div className="border-b border-gray-200 p-4 flex items-center justify-start space-x-4 bg-white">
      <MethodTag method={method} />
      <span className="font-mono text-sm">{path}</span>
      <span className="ml-auto text-sm">{description}</span>
    </div>
  );
};
