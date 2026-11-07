import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { linksRepository } from "./repository";
export function useLinks() {
  return useQuery({ queryKey: ["links"], queryFn: linksRepository.list });
}
export function useCreateLink() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: linksRepository.create,
    onSuccess: () => client.invalidateQueries({ queryKey: ["links"] }),
  });
}
export function useDeleteLink() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: linksRepository.remove,
    onSuccess: () => client.invalidateQueries({ queryKey: ["links"] }),
  });
}
