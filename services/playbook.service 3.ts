import { api } from '@/services/api';
import type { PlaybookWeek } from '@/types/playbook';

export const playbookService = {
  getAll: () => api.get<PlaybookWeek[]>('/playbook'),
};