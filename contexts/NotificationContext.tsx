'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface ConfirmOptions {
  message: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

interface NotificationContextType {
  showAlert: (message: string, type?: NotificationType, duration?: number) => void
  showConfirm: (options: ConfirmOptions) => void
  hideAlert: (id: string) => void
  hideConfirm: () => void
  notifications: Notification[]
  confirmDialog: ConfirmOptions | null
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children, locale = 'he' }: { children: ReactNode; locale?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [confirmDialog, setConfirmDialog] = useState<ConfirmOptions | null>(null)

  const showAlert = (message: string, type: NotificationType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const notification: Notification = { id, type, message, duration }

    console.log('📢 Showing alert:', { id, type, message, duration })
    setNotifications((prev) => [...prev, notification])

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        hideAlert(id)
      }, duration)
    }
  }

  const showConfirm = (options: ConfirmOptions) => {
    setConfirmDialog(options)
  }

  const hideAlert = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const hideConfirm = () => {
    setConfirmDialog(null)
  }

  return (
    <NotificationContext.Provider
      value={{
        showAlert,
        showConfirm,
        hideAlert,
        hideConfirm,
        notifications,
        confirmDialog,
      }}
    >
      {children}

      {/* Render Notifications */}
      <div className="fixed top-4 left-1/2 z-[99999] w-full max-w-lg -translate-x-1/2 space-y-2 px-4" dir={locale === 'he' ? 'rtl' : 'ltr'}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`animate-slide-down rounded-lg p-5 shadow-2xl transition-all border-2 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-900'
                : notification.type === 'error'
                  ? 'bg-red-50 border-red-400 text-red-900'
                  : notification.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-900'
                    : 'bg-blue-50 border-blue-400 text-blue-900'
            }`}
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl flex-shrink-0">
                  {notification.type === 'success' && '✓'}
                  {notification.type === 'error' && '✕'}
                  {notification.type === 'warning' && '⚠'}
                  {notification.type === 'info' && 'ℹ'}
                </span>
                <p className="text-base font-semibold break-words leading-relaxed">{notification.message}</p>
              </div>
              <button
                onClick={() => hideAlert(notification.id)}
                className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition"
                aria-label={locale === 'he' ? 'סגור' : 'Закрыть'}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4" dir={locale === 'he' ? 'rtl' : 'ltr'}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-scale-in">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-2xl">⚠</span>
              </div>
            </div>

            {/* Message */}
            <p className="mb-6 text-center text-base font-medium text-gray-900">
              {confirmDialog.message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  confirmDialog.onCancel?.()
                  hideConfirm()
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {confirmDialog.cancelText || (locale === 'he' ? 'ביטול' : 'Отмена')}
              </button>
              <button
                onClick={async () => {
                  hideConfirm() // Close dialog first
                  await confirmDialog.onConfirm() // Then execute action (which may show error alert)
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
              >
                {confirmDialog.confirmText || (locale === 'he' ? 'אישור' : 'Подтвердить')}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
