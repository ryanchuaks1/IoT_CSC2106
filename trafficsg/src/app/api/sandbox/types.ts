export interface MethodTagProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
}

export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
}

export interface EndpointListItemProps extends Endpoint {}