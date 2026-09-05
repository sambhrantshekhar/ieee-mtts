import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./button"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent scrolling when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1220] p-6 shadow-2xl shadow-black/50"
          >
            <h2 className="font-heading text-xl font-bold tracking-tight text-white">{title}</h2>
            {description && (
              <p className="mt-3 text-sm text-muted-foreground">{description}</p>
            )}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="font-mono text-xs uppercase tracking-wider"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="sheen-btn font-mono text-xs uppercase tracking-wider"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
