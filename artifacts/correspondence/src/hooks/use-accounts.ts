import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAccounts() {
  return useQuery({
    queryKey: ["correspondence", "accounts"],
    queryFn: api.listAccounts,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["correspondence", "accounts"] }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["correspondence", "accounts"] }),
  });
}
