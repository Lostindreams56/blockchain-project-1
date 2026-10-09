import { useQuery } from '@tanstack/react-query';
import { healthService } from '../services/healthService';

export function useReadiness(refetchInterval = 10000) {
  return useQuery({
    queryKey: ['api-readiness'],
    queryFn: () => healthService.getReadiness(),
    refetchInterval,
  });
}
