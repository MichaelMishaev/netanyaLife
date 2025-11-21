'use client'

import { useState } from 'react'
import {
  toggleCategoryActive,
  deleteCategory,
  deleteSubcategory,
  reorderSubcategories,
} from '@/lib/actions/admin'
import CategoryForm from './CategoryForm'
import SubcategoryForm from './SubcategoryForm'
import MoveBusinessesModal from './MoveBusinessesModal'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'

interface CategoryManagementCardProps {
  category: any
  locale: string
  isSuperAdmin: boolean
  allCategories: any[]
}

export default function CategoryManagementCard({
  category,
  locale,
  isSuperAdmin,
  allCategories,
}: CategoryManagementCardProps) {
  const router = useRouter()
  const { showAlert, showConfirm } = useNotification()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSubcategories, setShowSubcategories] = useState(false)
  const [showBusinesses, setShowBusinesses] = useState(false)
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([])
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [localSubcategories, setLocalSubcategories] = useState(category.subcategories || [])

  const businesses = category.businesses || []

  // Toggle business selection
  const toggleBusinessSelection = (businessId: string) => {
    setSelectedBusinessIds((prev) =>
      prev.includes(businessId)
        ? prev.filter((id) => id !== businessId)
        : [...prev, businessId]
    )
  }

  // Select all businesses
  const selectAllBusinesses = () => {
    setSelectedBusinessIds(businesses.map((b: any) => b.id))
  }

  // Deselect all businesses
  const deselectAllBusinesses = () => {
    setSelectedBusinessIds([])
  }

  // Get selected businesses for modal
  const selectedBusinesses = businesses.filter((b: any) =>
    selectedBusinessIds.includes(b.id)
  )

  const name = locale === 'he' ? category.name_he : category.name_ru

  // Get next display order for subcategories
  const nextSubcategoryOrder = localSubcategories.length > 0
    ? Math.max(...localSubcategories.map((s: any) => s.display_order)) + 1
    : 1

  const handleToggleActive = async () => {
    setIsUpdating(true)
    await toggleCategoryActive(category.id, locale)
    setIsUpdating(false)
  }

  const handleDelete = async () => {
    const confirmMessage =
      locale === 'he'
        ? `האם אתה בטוח שברצונך למחוק את "${name}"?`
        : `Вы уверены, что хотите удалить "${name}"?`

    showConfirm({
      message: confirmMessage,
      onConfirm: async () => {
        console.log('🗑️ Starting delete for category:', category.id, name)
        setIsUpdating(true)
        const result = await deleteCategory(category.id, locale)
        setIsUpdating(false)

        console.log('🗑️ Delete result:', result)

        if (!result.success) {
          console.log('❌ Delete failed, showing alert:', result.error)
          // Show error with longer duration (10 seconds) so user can read it
          showAlert(result.error || 'Error deleting category', 'error', 10000)
        } else {
          console.log('✅ Delete successful')
        }
      }
    })
  }

  const handleDeleteSubcategory = async (subcategoryId: string, subcategoryName: string) => {
    const confirmMessage =
      locale === 'he'
        ? `למחוק תת-קטגוריה "${subcategoryName}"?`
        : `Удалить подкатегорию "${subcategoryName}"?`

    showConfirm({
      message: confirmMessage,
      onConfirm: async () => {
        setIsUpdating(true)
        const result = await deleteSubcategory(subcategoryId, locale)
        setIsUpdating(false)

        if (result.success) {
          router.refresh()
        } else {
          showAlert(result.error || 'Error deleting subcategory', 'error', 10000)
        }
      }
    })
  }

  const handleEditSubcategory = (subcategory: any) => {
    setEditingSubcategory(subcategory)
    setShowSubcategoryForm(true)
  }

  const handleCloseSubcategoryForm = () => {
    setShowSubcategoryForm(false)
    setEditingSubcategory(null)
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Reorder array
    const newSubcategories = [...localSubcategories]
    const [draggedItem] = newSubcategories.splice(draggedIndex, 1)
    newSubcategories.splice(dropIndex, 0, draggedItem)

    // Update local state immediately for smooth UX
    setLocalSubcategories(newSubcategories)
    setDraggedIndex(null)
    setDragOverIndex(null)

    // Update server
    setIsUpdating(true)
    const result = await reorderSubcategories(
      category.id,
      newSubcategories.map(s => s.id),
      locale
    )

    if (result.success) {
      router.refresh()
    } else {
      // Revert on error
      setLocalSubcategories(category.subcategories)
      showAlert(result.error || 'Error reordering subcategories', 'error')
    }
    setIsUpdating(false)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const subcategoryRow = element?.closest('[data-subcategory-index]')

    if (subcategoryRow) {
      const index = parseInt(subcategoryRow.getAttribute('data-subcategory-index') || '-1')
      if (index >= 0) {
        setDragOverIndex(index)
      }
    }
  }

  const handleTouchEnd = async (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Reorder array
    const newSubcategories = [...localSubcategories]
    const [draggedItem] = newSubcategories.splice(draggedIndex, 1)
    newSubcategories.splice(dragOverIndex, 0, draggedItem)

    // Update local state
    setLocalSubcategories(newSubcategories)
    setDraggedIndex(null)
    setDragOverIndex(null)

    // Update server
    setIsUpdating(true)
    const result = await reorderSubcategories(
      category.id,
      newSubcategories.map(s => s.id),
      locale
    )

    if (result.success) {
      router.refresh()
    } else {
      setLocalSubcategories(category.subcategories)
      showAlert(result.error || 'Error reordering subcategories', 'error')
    }
    setIsUpdating(false)
  }

  return (
    <div
      className={`rounded-lg border bg-white p-6 shadow-sm ${
        !category.is_active ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">
              {category.icon_name && `${category.icon_name} `}
              {name}
            </h3>
            {category.is_popular && (
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                ⭐ {locale === 'he' ? 'פופולרי' : 'Популярное'}
              </span>
            )}
            {!category.is_active && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                🚫 {locale === 'he' ? 'לא פעיל' : 'Неактивно'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>
              Slug: <code className="font-mono">{category.slug}</code>
            </span>
            <span>•</span>
            <span>
              {locale === 'he' ? 'סדר' : 'Порядок'}: {category.display_order}
            </span>
            <span>•</span>
            <span>
              {category._count.businesses}{' '}
              {locale === 'he' ? 'עסקים' : 'предприятий'}
            </span>
            <span>•</span>
            <span>
              {localSubcategories.length}{' '}
              {locale === 'he' ? 'תתי קטגוריות' : 'подкатегорий'}
            </span>
          </div>

          {/* Toggle Buttons */}
          <div className="mt-3 flex flex-wrap gap-3">
            {/* Subcategories Toggle */}
            {localSubcategories.length > 0 && (
              <button
                onClick={() => setShowSubcategories(!showSubcategories)}
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                {showSubcategories
                  ? (locale === 'he' ? 'הסתר תתי קטגוריות' : 'Скрыть подкатегории')
                  : (locale === 'he' ? 'הצג תתי קטגוריות' : 'Показать подкатегории')
                } ({localSubcategories.length})
              </button>
            )}

            {/* Businesses Toggle */}
            {businesses.length > 0 && (
              <button
                onClick={() => setShowBusinesses(!showBusinesses)}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                {showBusinesses
                  ? (locale === 'he' ? 'הסתר עסקים' : 'Скрыть бизнесы')
                  : (locale === 'he' ? 'הצג עסקים' : 'Показать бизнесы')
                } ({businesses.length})
              </button>
            )}
          </div>

          {category.description_he && locale === 'he' && (
            <p className="mt-2 text-sm text-gray-600">
              {category.description_he}
            </p>
          )}
          {category.description_ru && locale === 'ru' && (
            <p className="mt-2 text-sm text-gray-600">
              {category.description_ru}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isSuperAdmin ? (
            <>
              <button
                onClick={handleToggleActive}
                disabled={isUpdating}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  category.is_active
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                }`}
                title={
                  category.is_active
                    ? locale === 'he'
                      ? 'השבת'
                      : 'Деактивировать'
                    : locale === 'he'
                      ? 'הפעל'
                      : 'Активировать'
                }
              >
                {category.is_active
                  ? locale === 'he'
                    ? 'השבת'
                    : 'Деактивировать'
                  : locale === 'he'
                    ? 'הפעל'
                    : 'Активировать'}
              </button>

              <CategoryForm
                locale={locale}
                mode="edit"
                category={category}
                nextDisplayOrder={0}
              />

              <button
                onClick={handleDelete}
                disabled={isUpdating}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                title={locale === 'he' ? 'מחק' : 'Удалить'}
              >
                🗑️
              </button>
            </>
          ) : (
            <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
              {locale === 'he' ? 'צפייה בלבד' : 'Только просмотр'}
            </span>
          )}
        </div>
      </div>

      {/* Subcategories Section */}
      {showSubcategories && localSubcategories.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="mb-3 font-bold text-gray-900">
            {locale === 'he' ? 'תתי קטגוריות:' : 'Подкатегории:'}
          </h4>
          <div className="space-y-2">
            {localSubcategories.map((sub: any, index: number) => (
              <div
                key={sub.id}
                data-subcategory-index={index}
                draggable={isSuperAdmin}
                onDragStart={(e) => isSuperAdmin && handleDragStart(e, index)}
                onDragOver={(e) => isSuperAdmin && handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => isSuperAdmin && handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => isSuperAdmin && handleTouchStart(e, index)}
                onTouchMove={(e) => isSuperAdmin && handleTouchMove(e)}
                onTouchEnd={(e) => isSuperAdmin && handleTouchEnd(e)}
                className={`flex items-center justify-between rounded-lg border bg-gray-50 p-3 transition-all ${
                  isSuperAdmin ? 'cursor-move touch-none' : ''
                } ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${
                  dragOverIndex === index ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-1 items-center gap-2">
                  {isSuperAdmin && (
                    <span className="text-gray-400" aria-label="Drag handle">
                      ⋮⋮
                    </span>
                  )}
                  <span className="font-medium text-gray-900">
                    {locale === 'he' ? sub.name_he : sub.name_ru}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({sub.slug})
                  </span>
                  {!sub.is_active && (
                    <span className="text-xs text-gray-500">
                      ({locale === 'he' ? 'לא פעיל' : 'неактивно'})
                    </span>
                  )}
                </div>
                {isSuperAdmin && (
                  <div className="flex gap-2">
                    <button
                      className="rounded px-2 py-1 text-xs text-primary-600 hover:bg-primary-50"
                      onClick={() => handleEditSubcategory(sub)}
                      title={locale === 'he' ? 'ערוך' : 'Редактировать'}
                    >
                      ✏️
                    </button>
                    <button
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteSubcategory(
                        sub.id,
                        locale === 'he' ? sub.name_he : sub.name_ru
                      )}
                      title={locale === 'he' ? 'מחק' : 'Удалить'}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isSuperAdmin && (
            <button
              className="mt-3 w-full rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600"
              onClick={() => {
                setEditingSubcategory(null)
                setShowSubcategoryForm(true)
              }}
            >
              + {locale === 'he' ? 'הוסף תת קטגוריה' : 'Добавить подкатегорию'}
            </button>
          )}
        </div>
      )}

      {/* Businesses Section */}
      {showBusinesses && businesses.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-gray-900">
              {locale === 'he' ? 'עסקים בקטגוריה:' : 'Бизнесы в категории:'}
            </h4>
            <div className="flex gap-2">
              {isSuperAdmin && (
                <>
                  {/* Select/Deselect All */}
                  {selectedBusinessIds.length === businesses.length ? (
                    <button
                      onClick={deselectAllBusinesses}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      {locale === 'he' ? 'בטל הכל' : 'Снять все'}
                    </button>
                  ) : (
                    <button
                      onClick={selectAllBusinesses}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      {locale === 'he' ? 'בחר הכל' : 'Выбрать все'}
                    </button>
                  )}

                  {/* Move Selected Button */}
                  {selectedBusinessIds.length > 0 && (
                    <button
                      onClick={() => setShowMoveModal(true)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      {locale === 'he'
                        ? `העבר ${selectedBusinessIds.length} ↔`
                        : `Переместить ${selectedBusinessIds.length} ↔`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {businesses.map((business: any) => (
              <div
                key={business.id}
                className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                  selectedBusinessIds.includes(business.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Checkbox */}
                {isSuperAdmin && (
                  <input
                    type="checkbox"
                    checked={selectedBusinessIds.includes(business.id)}
                    onChange={() => toggleBusinessSelection(business.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {/* Business Name */}
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {locale === 'he' ? business.name_he : business.name_ru || business.name_he}
                  </span>
                  {!business.is_visible && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({locale === 'he' ? 'מוסתר' : 'скрыт'})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subcategory Form Modal */}
      <SubcategoryForm
        categoryId={category.id}
        subcategory={editingSubcategory}
        locale={locale}
        mode={editingSubcategory ? 'edit' : 'create'}
        isOpen={showSubcategoryForm}
        onClose={handleCloseSubcategoryForm}
        nextDisplayOrder={nextSubcategoryOrder}
      />

      {/* Move Businesses Modal */}
      {isSuperAdmin && (
        <MoveBusinessesModal
          isOpen={showMoveModal}
          onClose={() => {
            setShowMoveModal(false)
            deselectAllBusinesses() // Clear selection after closing modal
          }}
          businesses={selectedBusinesses}
          currentCategoryId={category.id}
          allCategories={allCategories}
          locale={locale}
        />
      )}
    </div>
  )
}
