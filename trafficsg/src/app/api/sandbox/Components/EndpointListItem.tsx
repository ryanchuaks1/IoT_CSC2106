import React, { useState } from "react";

import { MethodTag } from "./MethodTag";
import { EndpointListItemProps } from "../types";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export const EndpointListItem: React.FC<EndpointListItemProps> = ({
  method,
  path,
  description,
  html,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<string>("");
  const [results, setResults] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(serverUrl + path);

  const handleRunClick = async () => {
    try {
      let response;
      console.log(inputValue);

      if (method === "GET") {
        response = await fetch(inputValue);
      } else if (method === "POST") {
        response = await fetch(inputValue, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
        });
      } else if (method === "PUT") {
        response = await fetch(inputValue, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
        });
      } else if (method === "DELETE") {
        response = await fetch(inputValue, {
          method: "DELETE",
        });
      }

      if (response) {
        const data = await response.json();
        setResults(JSON.stringify(data, null, 2));
      }
    } catch (error: any) {
      setResults(`Error: ${error.message}`);
    }
  };

  return (
    <div className="border-b border-gray-200">
      <div
        className="p-4 flex items-center justify-start space-x-4 bg-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MethodTag method={method} />
        <span className="font-mono text-sm">{path}</span>
        <span className="ml-auto text-sm">{description}</span>
      </div>
      {isOpen && (
        <div className="p-5 bg-gray-100">
          <div className="flex items-center rounded-lg bg-slate-800 p-2">
            <input
              type="text"
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none p-2 rounded-lg-full"
              placeholder="Type your API URL here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded-r-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              onClick={handleRunClick}
            >
              Run
            </button>
          </div>
          {(method == "POST" || method == "PUT") && (
            <div className="p-2">
              <div className="mt-4 text-md font-medium">Payload</div>
              <textarea
                className="mt-2 p-2 w-full rounded-lg"
                placeholder="Type your JSON payload here..."
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
              ></textarea>
            </div>
          )}
          {results && (
            <pre className="mt-4 p-2 text-xs text-gray-800">{results}</pre>
          )}
          {html && <div className="mt-4 p-2">{html}</div>}
        </div>
      )}
    </div>
  );
};
