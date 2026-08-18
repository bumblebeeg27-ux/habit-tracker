import { create } from 'zustand';
import { ProfileDraft } from '../db/repositories/userProfile';

type OnboardingState = {
  draft: Partial<ProfileDraft>;
  update: (patch: Partial<ProfileDraft>) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  draft: {},
  update: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  reset: () => set({ draft: {} }),
}));
