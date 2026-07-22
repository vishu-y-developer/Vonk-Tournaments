import { useState, useCallback } from 'react';
import { useRegistrations } from '@/providers/RegistrationProvider';
import { Tournament, Player, Team, Registration } from '@/types';

export function useRegistrationFlow(tournament: Tournament, player: Player) {
  const { submitRegistration } = useRegistrations();

  const [step, setStep] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedRosterIds, setSelectedRosterIds] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | undefined>(undefined);
  const [consent, setConsent] = useState({
    rulesReviewed: false,
    infoCorrect: false,
    isDemoUnderstood: false,
    refundPolicyAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRegistration, setSuccessRegistration] = useState<Registration | null>(null);

  const nextStep = useCallback(() => setStep((s) => s + 1), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  const handleConsentChange = useCallback((key: keyof typeof consent, value: boolean) => {
    setConsent((c) => ({ ...c, [key]: value }));
  }, []);

  const allConsentChecked = consent.rulesReviewed && consent.infoCorrect && consent.isDemoUnderstood && consent.refundPolicyAccepted;

  const executeRegistration = useCallback(() => {
    setIsSubmitting(true);
    setError(null);

    return new Promise<{ success: boolean; error?: string; registration?: Registration }>((resolve) => {
      setTimeout(() => {
        const res = submitRegistration({
          tournament,
          player,
          team: selectedTeam,
          selectedRosterIds: selectedRosterIds.length > 0 ? selectedRosterIds : undefined,
          selectedSlotNumber: selectedSlot,
          consent: allConsentChecked
        });

        setIsSubmitting(false);
        if (res.success && res.registration) {
          setSuccessRegistration(res.registration);
          nextStep();
        } else {
          setError(res.error || 'Failed to complete registration.');
        }
        resolve(res);
      }, 800);
    });
  }, [submitRegistration, tournament, player, selectedTeam, selectedRosterIds, selectedSlot, allConsentChecked, nextStep]);

  const resetFlow = useCallback(() => {
    setStep(1);
    setSelectedTeam(null);
    setSelectedRosterIds([]);
    setSelectedSlot(undefined);
    setConsent({
      rulesReviewed: false,
      infoCorrect: false,
      isDemoUnderstood: false,
      refundPolicyAccepted: false
    });
    setIsSubmitting(false);
    setError(null);
    setSuccessRegistration(null);
  }, []);

  return {
    step,
    nextStep,
    prevStep,
    selectedTeam,
    setSelectedTeam,
    selectedRosterIds,
    setSelectedRosterIds,
    selectedSlot,
    setSelectedSlot,
    consent,
    handleConsentChange,
    allConsentChecked,
    isSubmitting,
    error,
    successRegistration,
    executeRegistration,
    resetFlow
  };
}
