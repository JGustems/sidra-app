'use client'

import { createContext, useContext, useRef, useState, ReactNode } from 'react'

interface EditContextType {
  registrarEdicio: (id: string) => void
  desregistrarEdicio: (id: string) => void
  hiHaEdicionsActives: () => boolean
  intentarCanviar: (callback: () => void) => void
}

const EditContext = createContext<EditContextType | null>(null)

export function EditProvider({ children }: { children: ReactNode }) {
  const editsActius = useRef<Set<string>>(new Set())
  const [, forceUpdate] = useState(0)

  function registrarEdicio(id: string) {
    editsActius.current.add(id)
    forceUpdate(n => n + 1)
  }

  function desregistrarEdicio(id: string) {
    editsActius.current.delete(id)
    forceUpdate(n => n + 1)
  }

  function hiHaEdicionsActives() {
    return editsActius.current.size > 0
  }

  function intentarCanviar(callback: () => void) {
    if (hiHaEdicionsActives()) {
      alert('Tens canvis sense desar. Desa o cancel·la l\'edició abans de continuar.')
      return
    }
    callback()
  }

  return (
    <EditContext.Provider value={{ registrarEdicio, desregistrarEdicio, hiHaEdicionsActives, intentarCanviar }}>
      {children}
    </EditContext.Provider>
  )
}

export function useEditContext() {
  const ctx = useContext(EditContext)
  if (!ctx) throw new Error('useEditContext must be used within EditProvider')
  return ctx
}
