import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "../api/client";

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
}
