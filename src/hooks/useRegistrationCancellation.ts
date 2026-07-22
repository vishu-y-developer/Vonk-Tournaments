import { useRegistrations } from '@/providers/RegistrationProvider';
import { useCallback } from 'react';

export function useRegistrationCancellation() {
  const { cancelRegistration } = useRegistrations();

  const handleCancel = useCallback((registrationId: string, reason: string) => {
    return cancelRegistration(registrationId, reason);
  }, [cancelRegistration]);

  return {
    cancelRegistration: handleCancel
  };
}
