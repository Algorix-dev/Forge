'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  name: string
  archetype: string
  reflection: string
  insight: string
  modules: string[]
  moduleReason: string
  role: string
  interviewAnswers: Record<string, string>
  forgeScore: number
  commitments: Commitment[]
  frictionLogs: FrictionLog[]
  debriefs: Debrief[]
  onboarded: boolean
  joinedAt: string
  connections: Connection[]
  location?: string
  focus?: string
  meetUpIntent?: boolean
}

export interface Connection {
  id: string
  name: string
  archetype: string
  forgeScore: number
  activeCommitmentsCount: number
  location?: string
  focus?: string
  meetUpIntent?: boolean
}

export interface Commitment {
  id: string
  title: string
  why: string
  definition: string
  deadline: string
  cost: string
  status: 'active' | 'completed' | 'broken' | 'abandoned'
  progress: number
  createdAt: string
  updatedAt: string
  partnerId?: string
  visibility: 'private' | 'circle'
}

export interface FrictionLog {
  id: string
  description: string
  category: string
  commitmentId?: string
  createdAt: string
}

export interface Debrief {
  id: string
  commitmentId?: string
  what: string
  well: string
  differently: string
  lesson: string
  aiInsight: string
  createdAt: string
}

interface ForgeStore {
  user: UserProfile | null
  setUser: (user: Omit<UserProfile, 'connections'> & { connections?: Connection[] }) => void
  updateUser: (updates: Partial<UserProfile>) => void
  addCommitment: (commitment: Commitment) => void
  updateCommitment: (id: string, updates: Partial<Commitment>) => void
  addFrictionLog: (log: FrictionLog) => void
  addDebrief: (debrief: Debrief) => void
  reset: () => void
}

export const MOCK_CONNECTIONS: Connection[] = [
  { id: 'conn_1', name: 'Marcus', archetype: 'THE AMBITIOUS STARTER', forgeScore: 84, activeCommitmentsCount: 2, location: 'Lagos, Nigeria', focus: 'Fintech Startup', meetUpIntent: true },
  { id: 'conn_2', name: 'Sarah', archetype: 'THE CONSISTENT PERFORMER', forgeScore: 92, activeCommitmentsCount: 3, location: 'San Francisco, USA', focus: 'Deep Work & Writing', meetUpIntent: true },
  { id: 'conn_3', name: 'David', archetype: 'THE UNCONVENTIONAL BUILDER', forgeScore: 78, activeCommitmentsCount: 1, location: 'London, UK', focus: 'Solo Software & Design', meetUpIntent: false },
]

const defaultUser: Partial<UserProfile> = {
  forgeScore: 0,
  commitments: [],
  frictionLogs: [],
  debriefs: [],
  onboarded: false,
  connections: MOCK_CONNECTIONS,
}

export const useForgeStore = create<ForgeStore>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user: { ...defaultUser, ...user } as UserProfile }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      addCommitment: (commitment) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, commitments: [commitment, ...state.user.commitments] }
            : null,
        })),

      updateCommitment: (id, updates) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                commitments: state.user.commitments.map((c) =>
                  c.id === id ? { ...c, ...updates } : c
                ),
              }
            : null,
        })),

      addFrictionLog: (log) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, frictionLogs: [log, ...state.user.frictionLogs] }
            : null,
        })),

      addDebrief: (debrief) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, debriefs: [debrief, ...state.user.debriefs] }
            : null,
        })),

      reset: () => set({ user: null }),
    }),
    { name: 'forge-store' }
  )
)
