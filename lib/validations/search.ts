import { z } from 'zod'

/**
 * Search form validation
 */
export const searchFormSchema = z.object({
  category: z.string().min(1, 'יש לבחור קטגוריה'),
  neighborhood: z.string().min(1, 'יש לבחור שכונה'),
})

export type SearchFormData = z.infer<typeof searchFormSchema>
