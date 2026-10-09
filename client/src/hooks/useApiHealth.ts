import { useQuery } from '@tanstack/react-query';
import { healthService } from '../services/healthService';

export function useApiHealth(refetchInterval = 10000) {
  return useQuery({
    queryKey: ['api-health'],
    queryFn: () => healthService.getHealth(),
    refetchInterval,
  });
}
