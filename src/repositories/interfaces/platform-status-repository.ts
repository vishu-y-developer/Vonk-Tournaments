import { PlatformSystemStatus } from '@/types';

export interface PlatformStatusRepository {
  get(): PlatformSystemStatus | null;
  save(status: PlatformSystemStatus): void;
}
