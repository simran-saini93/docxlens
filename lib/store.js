import { create } from 'zustand'

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const useDocStore = create((set, get) => ({
  docs:        [],
  referenceId: null,
  error:       null,
  // Processing state: null | { filename, status }
  processing:  null,

  addDoc: (doc) => set((s) => {
    if (s.docs.length >= 5) return s
    const newDocs = [...s.docs, { ...doc, id: generateId() }]
    return { docs: newDocs, referenceId: s.referenceId ?? newDocs[0].id, error: null }
  }),

  removeDoc: (id) => set((s) => {
    const newDocs  = s.docs.filter((d) => d.id !== id)
    const newRefId = s.referenceId === id ? (newDocs[0]?.id ?? null) : s.referenceId
    return { docs: newDocs, referenceId: newRefId }
  }),

  updateDocName: (id, name) => set((s) => ({
    docs: s.docs.map((d) => (d.id === id ? { ...d, name } : d)),
  })),

  setReference:  (id)    => set({ referenceId: id }),
  setError:      (error) => set({ error }),
  clearError:    ()      => set({ error: null }),
  setProcessing: (p)     => set({ processing: p }),
  clearAll:      ()      => set({ docs: [], referenceId: null, error: null, processing: null }),
  canAddMore:    ()      => get().docs.length < 5,
}))
