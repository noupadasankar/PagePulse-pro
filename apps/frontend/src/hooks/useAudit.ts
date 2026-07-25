import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useAudit() {
  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const result = await apiClient.submitAudit(url);
      return result;
    },
  });

  return {
    runAudit: mutation.mutate,
    runAuditAsync: mutation.mutateAsync,
    data: mutation.data,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}