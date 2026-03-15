import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Check } from "../../../shared/schema.js";

export function useChecks() {
  return useQuery<Check[]>({
    queryKey: ["/api/checks"],
    queryFn: async () => (await fetch("/api/checks")).json()
  });
}

export function useCreateCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { resumeText: string; jobDescription: string }) => {
      const res = await fetch("/api/checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/checks"] })
  });
}