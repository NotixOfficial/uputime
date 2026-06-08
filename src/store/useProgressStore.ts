import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { ProcedureProgress } from '../data/types';
import { procedureById } from '../data/procedures';
import { nowISO } from '../utils/date';

interface ProgressState {
  /** Napredak po postupku, ključ = procedureId. */
  byProcedure: Record<string, ProcedureProgress>;

  startProcedure: (procedureId: string) => void;
  toggleDocumentOwned: (procedureId: string, documentId: string) => void;
  toggleStepCompleted: (procedureId: string, stepId: string) => void;
  setDocumentDeadline: (procedureId: string, documentId: string, deadline: string) => void;
  getProgress: (procedureId: string) => ProcedureProgress | undefined;
}

function ensure(state: ProgressState, procedureId: string): ProcedureProgress {
  const existing = state.byProcedure[procedureId];
  if (existing) return existing;
  const proc = procedureById(procedureId);
  return {
    procedureId,
    ownedDocumentIds: proc
      ? proc.documents.filter(d => d.defaultStatus === 'have').map(d => d.id)
      : [],
    completedStepIds: [],
    documentDeadlines: {},
    startedAt: nowISO(),
    updatedAt: nowISO(),
  };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      byProcedure: {},

      startProcedure: procedureId =>
        set(state => {
          if (state.byProcedure[procedureId]) return state;
          return {
            byProcedure: {
              ...state.byProcedure,
              [procedureId]: ensure(state, procedureId),
            },
          };
        }),

      toggleDocumentOwned: (procedureId, documentId) =>
        set(state => {
          const p = ensure(state, procedureId);
          const owned = p.ownedDocumentIds.includes(documentId)
            ? p.ownedDocumentIds.filter(id => id !== documentId)
            : [...p.ownedDocumentIds, documentId];
          return {
            byProcedure: {
              ...state.byProcedure,
              [procedureId]: { ...p, ownedDocumentIds: owned, updatedAt: nowISO() },
            },
          };
        }),

      toggleStepCompleted: (procedureId, stepId) =>
        set(state => {
          const p = ensure(state, procedureId);
          const done = p.completedStepIds.includes(stepId)
            ? p.completedStepIds.filter(id => id !== stepId)
            : [...p.completedStepIds, stepId];
          return {
            byProcedure: {
              ...state.byProcedure,
              [procedureId]: { ...p, completedStepIds: done, updatedAt: nowISO() },
            },
          };
        }),

      setDocumentDeadline: (procedureId, documentId, deadline) =>
        set(state => {
          const p = ensure(state, procedureId);
          const documentDeadlines = { ...p.documentDeadlines };
          if (deadline) {
            documentDeadlines[documentId] = deadline;
          } else {
            delete documentDeadlines[documentId]; // prazan rok = brisanje
          }
          return {
            byProcedure: {
              ...state.byProcedure,
              [procedureId]: { ...p, documentDeadlines, updatedAt: nowISO() },
            },
          };
        }),

      getProgress: procedureId => get().byProcedure[procedureId],
    }),
    { name: 'uputime.progress', storage: zustandStorage },
  ),
);

/** Procenat završenih koraka za postupak (0-100). */
export function stepPercent(procedureId: string): number {
  const proc = procedureById(procedureId);
  const progress = useProgressStore.getState().byProcedure[procedureId];
  if (!proc || proc.steps.length === 0) return 0;
  const done = progress?.completedStepIds.length ?? 0;
  return Math.round((done / proc.steps.length) * 100);
}
