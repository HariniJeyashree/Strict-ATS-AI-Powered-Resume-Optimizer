import { QueryClient, QueryFunctionContext } from "@tanstack/react-query";

// This function handles all GET requests automatically
export const getQueryFn = async ({ queryKey }: QueryFunctionContext) => {
  const res = await fetch(queryKey[0] as string);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Network response was not ok");
  }
  return res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});