"use client"

import * as React from "react"

interface Branch {
  id: number
  name: string
  address: string | null
  created_at: Date
  updated_at: Date
}

interface BranchContextType {
  currentBranchId: number | null
  currentBranch: Branch | null
  setCurrentBranch: (branch: Branch | null) => void
  setCurrentBranchId: (branchId: number | null) => void
}

const BranchContext = React.createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({
  children,
  initialBranch,
  initialBranchId,
}: {
  children: React.ReactNode
  initialBranch?: Branch | null
  initialBranchId?: number | null
}) {
  const [currentBranch, setCurrentBranch] = React.useState<Branch | null>(
    initialBranch || null
  )
  const [currentBranchId, setCurrentBranchId] = React.useState<number | null>(
    initialBranchId || null
  )

  // Update branchId when branch changes
  React.useEffect(() => {
    if (currentBranch) {
      setCurrentBranchId(currentBranch.id)
    } else {
      setCurrentBranchId(null)
    }
  }, [currentBranch])

  const value = React.useMemo(
    () => ({
      currentBranchId,
      currentBranch,
      setCurrentBranch,
      setCurrentBranchId,
    }),
    [currentBranchId, currentBranch]
  )

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  )
}

export function useBranch() {
  const context = React.useContext(BranchContext)
  console.log("You're currently in branch", context?.currentBranch)
  console.log("You're currently in branch name", context?.currentBranch?.name)
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider")
  }
  return context
}

export type { Branch }

