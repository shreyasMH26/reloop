import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const typeConfig: Record<
  ToastType,
  { icon: React.ReactNode; bg: string; border: string; text: string }
> = {
  success: {
    icon: <CheckCircle2 size={18} className="text-sage-500 shrink-0" />,
    bg: 'bg-white',
    border: 'border-sage-200',
    text: 'text-charcoal-900',
  },
  error: {
    icon: <XCircle size={18} className="text-rose-500 shrink-0" />,
    bg: 'bg-white',
    border: 'border-rose-200',
    text: 'text-charcoal-900',
  },
  info: {
    icon: <Info size={18} className="text-charcoal-500 shrink-0" />,
    bg: 'bg-white',
    border: 'border-cream-300',
    text: 'text-charcoal-900',
  },
  warning: {
    icon: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
    bg: 'bg-white',
    border: 'border-amber-200',
    text: 'text-charcoal-900',
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timerRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timerRefs.current[id])
    delete timerRefs.current[id]
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev.slice(-4), { id, type, message }])
      timerRefs.current[id] = setTimeout(() => dismiss(id), 4000)
    },
    [dismiss]
  )

  const contextValue: ToastContextValue = {
    toast: addToast,
    success: (m) => addToast(m, 'success'),
    error: (m) => addToast(m, 'error'),
    info: (m) => addToast(m, 'info'),
    warning: (m) => addToast(m, 'warning'),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 items-end sm:items-end max-w-xs w-full sm:w-auto"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const cfg = typeConfig[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`flex items-start gap-3 ${cfg.bg} border ${cfg.border} rounded-xl shadow-modal px-4 py-3 w-full sm:w-80`}
                role="alert"
              >
                {cfg.icon}
                <p className={`flex-1 text-sm font-medium ${cfg.text}`}>
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="p-0.5 rounded text-charcoal-400 hover:text-charcoal-700 transition-colors shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
