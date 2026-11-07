import React from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div
          className={
            variant === 'danger'
              ? 'flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center'
              : 'flex-shrink-0 w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center'
          }
        >
          {variant === 'danger' ? (
            <AlertTriangle size={20} className="text-rose-500" />
          ) : (
            <Info size={20} className="text-sage-500" />
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-charcoal-900 mb-1">{title}</h3>
          <p className="text-sm text-charcoal-500 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
