import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type DeferredSaleInput = z.infer<typeof api.deferred.sales.create.input>;

export function useDeferredSales() {
  return useQuery({
    queryKey: [api.deferred.sales.list.path],
    queryFn: async () => {
      const res = await fetch(api.deferred.sales.list.path, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return api.deferred.sales.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDeferredSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DeferredSaleInput) => {
      const res = await fetch(api.deferred.sales.create.path, {
        method: api.deferred.sales.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return api.deferred.sales.create.responses[201].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.deferred.sales.list.path] });
    },
  });
}

export function useUpdateDeferredSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<DeferredSaleInput>) => {
      const url = buildUrl(api.deferred.sales.update.path, { id });
      const res = await fetch(url, {
        method: api.deferred.sales.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return api.deferred.sales.update.responses[200].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.deferred.sales.list.path] });
    },
  });
}

export function useDeleteDeferredSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.deferred.sales.delete.path, { id });
      const res = await fetch(url, { method: api.deferred.sales.delete.method, credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.deferred.sales.list.path] });
    },
  });
}

