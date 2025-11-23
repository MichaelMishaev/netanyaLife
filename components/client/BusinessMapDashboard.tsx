'use client'

import { useState, useMemo } from 'react'
import { toggleBusinessVisibility, toggleBusinessVerification, toggleBusinessPinned, toggleBusinessTest, deleteBusiness } from '@/lib/actions/admin'

interface Business {
  id: string
  name_he: string
  name_ru: string | null
  slug_he: string
  phone: string | null
  whatsapp_number: string | null
  website_url: string | null
  is_visible: boolean
  is_verified: boolean
  is_pinned: boolean
  is_test: boolean
  created_at: string
  updated_at: string
  category_id: string | null
  category_name: string | null
  subcategory_id: string | null
  subcategory_name: string | null
  neighborhood_id: string
  neighborhood_name: string
  reviews_count: number
}

interface Category {
  id: string
  name_he: string
  name_ru: string | null
  icon_name: string | null
  business_count: number
  subcategories: {
    id: string
    name_he: string
    name_ru: string | null
    business_count: number
  }[]
}

interface Neighborhood {
  id: string
  name_he: string
  name_ru: string | null
  business_count: number
}

interface DateStat {
  date: string
  count: number
}

interface Stats {
  total: number
  visible: number
  hidden: number
  verified: number
  pinned: number
  test: number
  real: number
  withPhone: number
  withWhatsApp: number
  withWebsite: number
  thisWeek: number
  thisMonth: number
  missingSubcategory: number
}

interface BusinessMapDashboardProps {
  locale: string
  businesses: Business[]
  categories: Category[]
  neighborhoods: Neighborhood[]
  dateStats: DateStat[]
  stats: Stats
}

type ViewMode = 'overview' | 'categories' | 'timeline' | 'table'
type SortField = 'name' | 'category' | 'neighborhood' | 'created_at' | 'reviews'
type SortOrder = 'asc' | 'desc'

export default function BusinessMapDashboard({
  locale,
  businesses,
  categories,
  neighborhoods,
  dateStats,
  stats,
}: BusinessMapDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showTestOnly, setShowTestOnly] = useState(false)
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)
  const [showMissingSubcategory, setShowMissingSubcategory] = useState(false)
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'quarter'>('all')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const t = {
    he: {
      title: 'מפת עסקים',
      subtitle: 'סקירה מלאה של כל העסקים במערכת',
      overview: 'סקירה',
      categories: 'קטגוריות',
      timeline: 'ציר זמן',
      table: 'טבלה',
      totalBusinesses: 'סה"כ עסקים',
      visible: 'גלויים',
      hidden: 'מוסתרים',
      verified: 'מאומתים',
      pinned: 'מוצמדים',
      testBusinesses: 'עסקי בדיקה',
      realBusinesses: 'עסקים אמיתיים',
      withPhone: 'עם טלפון',
      withWhatsApp: 'עם וואטסאפ',
      withWebsite: 'עם אתר',
      addedThisWeek: 'השבוע',
      addedThisMonth: 'החודש',
      search: 'חיפוש עסק...',
      filterByCategory: 'סינון לפי קטגוריה',
      filterByNeighborhood: 'סינון לפי שכונה',
      filterByDate: 'סינון לפי תאריך',
      all: 'הכל',
      lastWeek: 'שבוע אחרון',
      lastMonth: 'חודש אחרון',
      lastQuarter: 'רבעון אחרון',
      showTestOnly: 'הצג רק עסקי בדיקה',
      showHiddenOnly: 'הצג רק מוסתרים',
      businessName: 'שם העסק',
      category: 'קטגוריה',
      subcategory: 'תת-קטגוריה',
      neighborhood: 'שכונה',
      dateAdded: 'תאריך הוספה',
      reviews: 'ביקורות',
      status: 'סטטוס',
      actions: 'פעולות',
      noCategory: 'ללא קטגוריה',
      noSubcategory: 'ללא תת-קטגוריה',
      businesses: 'עסקים',
      edit: 'עריכה',
      delete: 'מחיקה',
      toggleVisibility: 'הסתר/הצג',
      toggleVerification: 'אמת/בטל אימות',
      togglePin: 'הצמד/בטל הצמדה',
      confirmDelete: 'האם אתה בטוח שברצונך למחוק את העסק?',
      noBusinesses: 'לא נמצאו עסקים',
      loading: 'טוען...',
      exportCSV: 'ייצוא CSV',
      byNeighborhood: 'לפי שכונה',
      businessesAdded: 'עסקים שנוספו',
      emptyCategories: 'קטגוריות ריקות',
      emptyCategoriesDesc: 'קטגוריות ללא עסקים',
      missingSubcategory: 'חסרה תת-קטגוריה',
      missingSubcategoryDesc: 'עסקים שצריכים תת-קטגוריה',
    },
    ru: {
      title: 'Карта бизнесов',
      subtitle: 'Полный обзор всех предприятий в системе',
      overview: 'Обзор',
      categories: 'Категории',
      timeline: 'Хронология',
      table: 'Таблица',
      totalBusinesses: 'Всего предприятий',
      visible: 'Видимых',
      hidden: 'Скрытых',
      verified: 'Подтверждено',
      pinned: 'Закреплено',
      testBusinesses: 'Тестовые',
      realBusinesses: 'Реальные',
      withPhone: 'С телефоном',
      withWhatsApp: 'С WhatsApp',
      withWebsite: 'С сайтом',
      addedThisWeek: 'За неделю',
      addedThisMonth: 'За месяц',
      search: 'Поиск бизнеса...',
      filterByCategory: 'Фильтр по категории',
      filterByNeighborhood: 'Фильтр по району',
      filterByDate: 'Фильтр по дате',
      all: 'Все',
      lastWeek: 'Последняя неделя',
      lastMonth: 'Последний месяц',
      lastQuarter: 'Последний квартал',
      showTestOnly: 'Только тестовые',
      showHiddenOnly: 'Только скрытые',
      businessName: 'Название',
      category: 'Категория',
      subcategory: 'Подкатегория',
      neighborhood: 'Район',
      dateAdded: 'Дата добавления',
      reviews: 'Отзывы',
      status: 'Статус',
      actions: 'Действия',
      noCategory: 'Без категории',
      noSubcategory: 'Без подкатегории',
      businesses: 'предприятий',
      edit: 'Редактировать',
      delete: 'Удалить',
      toggleVisibility: 'Скрыть/Показать',
      toggleVerification: 'Подтвердить/Отменить',
      togglePin: 'Закрепить/Открепить',
      confirmDelete: 'Вы уверены, что хотите удалить предприятие?',
      noBusinesses: 'Предприятия не найдены',
      loading: 'Загрузка...',
      exportCSV: 'Экспорт CSV',
      byNeighborhood: 'По районам',
      businessesAdded: 'Добавлено предприятий',
      emptyCategories: 'Пустые категории',
      emptyCategoriesDesc: 'Категории без предприятий',
      missingSubcategory: 'Нет подкатегории',
      missingSubcategoryDesc: 'Предприятия без подкатегории',
    },
  }

  const text = t[locale as keyof typeof t] || t.he

  // Filter and sort businesses
  const filteredBusinesses = useMemo(() => {
    let result = [...businesses]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (b) =>
          b.name_he.toLowerCase().includes(query) ||
          b.name_ru?.toLowerCase().includes(query) ||
          b.phone?.includes(query) ||
          b.whatsapp_number?.includes(query)
      )
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((b) => b.category_id === selectedCategory)
    }

    // Subcategory filter
    if (selectedSubcategory) {
      result = result.filter((b) => b.subcategory_id === selectedSubcategory)
    }

    // Neighborhood filter
    if (selectedNeighborhood) {
      result = result.filter((b) => b.neighborhood_id === selectedNeighborhood)
    }

    // Test filter
    if (showTestOnly) {
      result = result.filter((b) => b.is_test)
    }

    // Hidden filter
    if (showHiddenOnly) {
      result = result.filter((b) => !b.is_visible)
    }

    // Missing subcategory filter
    if (showMissingSubcategory) {
      const categoryIdsWithSubs = new Set(
        categories.filter((c) => c.subcategories.length > 0).map((c) => c.id)
      )
      result = result.filter(
        (b) => b.category_id && categoryIdsWithSubs.has(b.category_id) && !b.subcategory_id
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let cutoff: Date
      switch (dateFilter) {
        case 'week':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          cutoff = new Date(0)
      }
      result = result.filter((b) => new Date(b.created_at) >= cutoff)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name_he.localeCompare(b.name_he, 'he')
          break
        case 'category':
          comparison = (a.category_name || '').localeCompare(b.category_name || '', 'he')
          break
        case 'neighborhood':
          comparison = a.neighborhood_name.localeCompare(b.neighborhood_name, 'he')
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'reviews':
          comparison = a.reviews_count - b.reviews_count
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [
    businesses,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedNeighborhood,
    showTestOnly,
    showHiddenOnly,
    showMissingSubcategory,
    dateFilter,
    sortField,
    sortOrder,
    categories,
  ])

  // Handle actions
  const handleToggleVisibility = async (businessId: string) => {
    setIsLoading(businessId)
    try {
      await toggleBusinessVisibility(businessId, locale)
    } finally {
      setIsLoading(null)
    }
  }

  const handleToggleVerification = async (businessId: string) => {
    setIsLoading(businessId)
    try {
      await toggleBusinessVerification(businessId, locale)
    } finally {
      setIsLoading(null)
    }
  }

  const handleTogglePinned = async (businessId: string) => {
    setIsLoading(businessId)
    try {
      await toggleBusinessPinned(businessId, locale)
    } finally {
      setIsLoading(null)
    }
  }

  const handleToggleTest = async (businessId: string) => {
    setIsLoading(businessId)
    try {
      await toggleBusinessTest(businessId, locale)
    } finally {
      setIsLoading(null)
    }
  }

  const handleDelete = async (businessId: string) => {
    if (!confirm(text.confirmDelete)) return
    setIsLoading(businessId)
    try {
      await deleteBusiness(businessId, locale)
    } finally {
      setIsLoading(null)
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Name (HE)',
      'Name (RU)',
      'Category',
      'Subcategory',
      'Neighborhood',
      'Phone',
      'WhatsApp',
      'Website',
      'Visible',
      'Verified',
      'Pinned',
      'Test',
      'Reviews',
      'Created At',
    ]

    const rows = filteredBusinesses.map((b) => [
      b.id,
      b.name_he,
      b.name_ru || '',
      b.category_name || '',
      b.subcategory_name || '',
      b.neighborhood_name,
      b.phone || '',
      b.whatsapp_number || '',
      b.website_url || '',
      b.is_visible ? 'Yes' : 'No',
      b.is_verified ? 'Yes' : 'No',
      b.is_pinned ? 'Yes' : 'No',
      b.is_test ? 'Yes' : 'No',
      b.reviews_count,
      new Date(b.created_at).toLocaleDateString(),
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
      '\n'
    )

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `businesses_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Get empty categories
  const emptyCategories = categories.filter((c) => c.business_count === 0)

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'he' ? 'he-IL' : 'ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Calculate max for chart scaling
  const maxDateCount = Math.max(...dateStats.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{text.title}</h1>
          <p className="mt-1 text-gray-600">{text.subtitle}</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {text.exportCSV}
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b pb-2">
        {(['overview', 'categories', 'timeline', 'table'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`whitespace-nowrap rounded-t-lg px-4 py-2 font-medium transition ${
              viewMode === mode
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {text[mode as keyof typeof text]}
          </button>
        ))}
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-600">{text.totalBusinesses}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="rounded bg-green-100 px-2 py-0.5 text-green-700">
                  {stats.visible} {text.visible}
                </span>
                <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">
                  {stats.hidden} {text.hidden}
                </span>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-600">{text.verified}</p>
              <p className="mt-1 text-3xl font-bold text-blue-600">{stats.verified}</p>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-yellow-700">
                  {stats.pinned} {text.pinned}
                </span>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-600">{text.addedThisWeek}</p>
              <p className="mt-1 text-3xl font-bold text-green-600">{stats.thisWeek}</p>
              <div className="mt-2 text-xs text-gray-500">
                {stats.thisMonth} {text.addedThisMonth}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-600">{text.testBusinesses}</p>
              <p className="mt-1 text-3xl font-bold text-orange-600">{stats.test}</p>
              <div className="mt-2 text-xs text-gray-500">
                {stats.real} {text.realBusinesses}
              </div>
            </div>

            {/* Missing Subcategory Card */}
            {stats.missingSubcategory > 0 && (
              <button
                onClick={() => {
                  setShowMissingSubcategory(true)
                  setViewMode('table')
                }}
                className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-start shadow-sm transition hover:bg-amber-100"
              >
                <p className="text-sm font-medium text-amber-700">{text.missingSubcategory}</p>
                <p className="mt-1 text-3xl font-bold text-amber-600">{stats.missingSubcategory}</p>
                <div className="mt-2 text-xs text-amber-600">
                  {text.missingSubcategoryDesc}
                </div>
              </button>
            )}
          </div>

          {/* Contact Info Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.withPhone}</p>
                  <p className="text-sm text-gray-600">{text.withPhone}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.withWhatsApp}</p>
                  <p className="text-sm text-gray-600">{text.withWhatsApp}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.withWebsite}</p>
                  <p className="text-sm text-gray-600">{text.withWebsite}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">{text.categories}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories
                .filter((c) => c.business_count > 0)
                .sort((a, b) => b.business_count - a.business_count)
                .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setViewMode('table')
                    }}
                    className="flex items-center justify-between rounded-lg border p-3 text-start transition hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">
                      {locale === 'he' ? category.name_he : category.name_ru || category.name_he}
                    </span>
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-bold text-primary-700">
                      {category.business_count}
                    </span>
                  </button>
                ))}
            </div>

            {emptyCategories.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="mb-2 text-sm font-medium text-gray-600">{text.emptyCategories}</h3>
                <div className="flex flex-wrap gap-2">
                  {emptyCategories.map((c) => (
                    <span key={c.id} className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-500">
                      {locale === 'he' ? c.name_he : c.name_ru || c.name_he}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Neighborhood Distribution */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">{text.byNeighborhood}</h2>
            <div className="space-y-3">
              {neighborhoods.map((n) => {
                const percentage = stats.total > 0 ? (n.business_count / stats.total) * 100 : 0
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSelectedNeighborhood(n.id)
                      setViewMode('table')
                    }}
                    className="block w-full text-start"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        {locale === 'he' ? n.name_he : n.name_ru || n.name_he}
                      </span>
                      <span className="text-sm text-gray-600">
                        {n.business_count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Categories Mode */}
      {viewMode === 'categories' && (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="rounded-lg border bg-white shadow-sm">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                className="flex w-full items-center justify-between p-4 text-start"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-lg">
                    {category.icon_name || '📁'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {locale === 'he' ? category.name_he : category.name_ru || category.name_he}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.business_count} {text.businesses}
                      {category.subcategories.length > 0 && (
                        <span className="text-gray-400">
                          {' '}
                          | {category.subcategories.length} {locale === 'he' ? 'תתי-קטגוריות' : 'подкатегорий'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-400 transition ${
                    expandedCategory === category.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedCategory === category.id && (
                <div className="border-t px-4 py-3">
                  {/* Subcategories */}
                  {category.subcategories.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-medium text-gray-600">
                        {locale === 'he' ? 'תתי-קטגוריות:' : 'Подкатегории:'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setSelectedCategory(category.id)
                              setSelectedSubcategory(sub.id)
                              setViewMode('table')
                            }}
                            className="rounded-lg border bg-gray-50 px-3 py-1.5 text-sm transition hover:bg-gray-100"
                          >
                            {locale === 'he' ? sub.name_he : sub.name_ru || sub.name_he}
                            <span className="ms-1 text-gray-500">({sub.business_count})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Businesses in this category */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-600">
                      {locale === 'he' ? 'עסקים בקטגוריה:' : 'Предприятия в категории:'}
                    </h4>
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {businesses
                        .filter((b) => b.category_id === category.id)
                        .map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between rounded border bg-gray-50 px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="font-medium">{b.name_he}</span>
                              <span className="ms-2 text-gray-500">
                                ({b.neighborhood_name})
                              </span>
                              {b.subcategory_name && (
                                <span className="ms-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                                  {b.subcategory_name}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {!b.is_visible && (
                                <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                                  {locale === 'he' ? 'מוסתר' : 'Скрыт'}
                                </span>
                              )}
                              {b.is_verified && (
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                                  ✓
                                </span>
                              )}
                              {b.is_pinned && (
                                <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                                  📌
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      {businesses.filter((b) => b.category_id === category.id).length === 0 && (
                        <p className="py-4 text-center text-gray-500">{text.noBusinesses}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timeline Mode */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">{text.businessesAdded}</h2>
            <div className="space-y-2">
              {dateStats.slice(0, 30).map((stat) => (
                <div key={stat.date} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-600">{formatDate(stat.date)}</span>
                  <div className="flex-1">
                    <div className="h-6 overflow-hidden rounded bg-gray-100">
                      <div
                        className="h-full rounded bg-primary-500 transition-all"
                        style={{ width: `${(stat.count / maxDateCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-end text-sm font-medium text-gray-900">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent additions list */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {locale === 'he' ? 'הוספות אחרונות' : 'Последние добавления'}
            </h2>
            <div className="space-y-3">
              {businesses.slice(0, 20).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{b.name_he}</p>
                    <p className="text-sm text-gray-500">
                      {b.category_name || text.noCategory} | {b.neighborhood_name}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-medium text-gray-900">{formatDate(b.created_at)}</p>
                    <div className="flex justify-end gap-1 mt-1">
                      {!b.is_visible && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                          {locale === 'he' ? 'מוסתר' : 'Скрыт'}
                        </span>
                      )}
                      {b.is_test && (
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                          {locale === 'he' ? 'בדיקה' : 'Тест'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Mode */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4 shadow-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.search}
              className="flex-1 min-w-[200px] rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />

            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                setSelectedCategory(e.target.value || null)
                setSelectedSubcategory(null)
              }}
              className="rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">{text.filterByCategory}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'he' ? c.name_he : c.name_ru || c.name_he} ({c.business_count})
                </option>
              ))}
            </select>

            {selectedCategory && (
              <select
                value={selectedSubcategory || ''}
                onChange={(e) => setSelectedSubcategory(e.target.value || null)}
                className="rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
              >
                <option value="">{locale === 'he' ? 'כל תתי-קטגוריות' : 'Все подкатегории'}</option>
                {categories
                  .find((c) => c.id === selectedCategory)
                  ?.subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {locale === 'he' ? s.name_he : s.name_ru || s.name_he} ({s.business_count})
                    </option>
                  ))}
              </select>
            )}

            <select
              value={selectedNeighborhood || ''}
              onChange={(e) => setSelectedNeighborhood(e.target.value || null)}
              className="rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">{text.filterByNeighborhood}</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {locale === 'he' ? n.name_he : n.name_ru || n.name_he} ({n.business_count})
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="all">{text.all}</option>
              <option value="week">{text.lastWeek}</option>
              <option value="month">{text.lastMonth}</option>
              <option value="quarter">{text.lastQuarter}</option>
            </select>
          </div>

          {/* Toggle filters */}
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showTestOnly}
                onChange={(e) => setShowTestOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{text.showTestOnly}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showHiddenOnly}
                onChange={(e) => setShowHiddenOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{text.showHiddenOnly}</span>
            </label>
            <span className="ms-auto text-sm text-gray-600">
              {filteredBusinesses.length} / {businesses.length} {text.businesses}
            </span>
          </div>

          {/* Clear filters */}
          {(selectedCategory || selectedNeighborhood || selectedSubcategory || searchQuery || showTestOnly || showHiddenOnly || showMissingSubcategory || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory(null)
                setSelectedNeighborhood(null)
                setSelectedSubcategory(null)
                setSearchQuery('')
                setShowTestOnly(false)
                setShowHiddenOnly(false)
                setShowMissingSubcategory(false)
                setDateFilter('all')
              }}
              className="text-sm text-primary-600 hover:underline"
            >
              {locale === 'he' ? 'נקה סינונים' : 'Очистить фильтры'}
            </button>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="cursor-pointer px-4 py-3 text-start text-sm font-medium text-gray-600 hover:bg-gray-100"
                    onClick={() => {
                      if (sortField === 'name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortField('name')
                        setSortOrder('asc')
                      }
                    }}
                  >
                    {text.businessName}
                    {sortField === 'name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-start text-sm font-medium text-gray-600 hover:bg-gray-100"
                    onClick={() => {
                      if (sortField === 'category') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortField('category')
                        setSortOrder('asc')
                      }
                    }}
                  >
                    {text.category}
                    {sortField === 'category' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-start text-sm font-medium text-gray-600 hover:bg-gray-100"
                    onClick={() => {
                      if (sortField === 'neighborhood') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortField('neighborhood')
                        setSortOrder('asc')
                      }
                    }}
                  >
                    {text.neighborhood}
                    {sortField === 'neighborhood' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-start text-sm font-medium text-gray-600 hover:bg-gray-100"
                    onClick={() => {
                      if (sortField === 'created_at') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortField('created_at')
                        setSortOrder('desc')
                      }
                    }}
                  >
                    {text.dateAdded}
                    {sortField === 'created_at' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-gray-600">
                    {text.status}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-gray-600">
                    {text.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBusinesses.map((business) => (
                  <tr
                    key={business.id}
                    className={`hover:bg-gray-50 ${isLoading === business.id ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{business.name_he}</p>
                        {business.name_ru && (
                          <p className="text-sm text-gray-500">{business.name_ru}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900">{business.category_name || text.noCategory}</p>
                        {business.subcategory_name && (
                          <p className="text-xs text-gray-500">{business.subcategory_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{business.neighborhood_name}</td>
                    <td className="px-4 py-3 text-gray-900">{formatDate(business.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {business.is_visible ? (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                            {locale === 'he' ? 'גלוי' : 'Видим'}
                          </span>
                        ) : (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                            {locale === 'he' ? 'מוסתר' : 'Скрыт'}
                          </span>
                        )}
                        {business.is_verified && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                            ✓ {locale === 'he' ? 'מאומת' : 'Подтвержден'}
                          </span>
                        )}
                        {business.is_pinned && (
                          <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                            📌 {locale === 'he' ? 'מוצמד' : 'Закреплен'}
                          </span>
                        )}
                        {business.is_test && (
                          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                            🧪 {locale === 'he' ? 'בדיקה' : 'Тест'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleTest(business.id)}
                          disabled={isLoading === business.id}
                          className={`rounded p-1.5 transition ${
                            business.is_test
                              ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={locale === 'he' ? 'בדיקה/יצור' : 'Тест/Прод'}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(business.id)}
                          disabled={isLoading === business.id}
                          className={`rounded p-1.5 transition ${
                            business.is_visible
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                          title={text.toggleVisibility}
                        >
                          {business.is_visible ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleVerification(business.id)}
                          disabled={isLoading === business.id}
                          className={`rounded p-1.5 transition ${
                            business.is_verified
                              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={text.toggleVerification}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleTogglePinned(business.id)}
                          disabled={isLoading === business.id}
                          className={`rounded p-1.5 transition ${
                            business.is_pinned
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={text.togglePin}
                        >
                          <svg className="h-4 w-4" fill={business.is_pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(business.id)}
                          disabled={isLoading === business.id}
                          className="rounded bg-red-100 p-1.5 text-red-600 transition hover:bg-red-200"
                          title={text.delete}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBusinesses.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-lg text-gray-500">{text.noBusinesses}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
