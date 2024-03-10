import React, { useState } from "react";

import { MethodTag } from "./MethodTag";
import { EndpointListItemProps } from "../types";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export const EndpointListItem: React.FC<EndpointListItemProps> = ({
  method,
  path,
  description,
  html
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <div className="p-4 flex items-center justify-start space-x-4 bg-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <MethodTag method={method} />
        <span className="font-mono text-sm">{path}</span>
        <span className="ml-auto text-sm">{description}</span>
      </div>
      {isOpen && (
        <div className="p-5 bg-gray-100">
          <div className="flex items-center rounded-lg bg-slate-800 p-2">
            <input type="text" className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none p-2 rounded-lg-full" placeholder="Type your API URL here..." value={serverUrl+path}/>
            <button className="bg-gray-700 text-white px-4 py-2 rounded-r-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">Run</button>
          </div>
          <div className="mt-4 p-2">{html}</div>
        </div>
      )}
    </div>
  );
};
