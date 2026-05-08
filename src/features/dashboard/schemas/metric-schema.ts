import { z } from "zod"

export const createMetricSchema = z.object({
  title: z.string().trim().min(1).max(50),
  value: z.coerce.number().int().min(0),
})

export type CreateMetricInput = z.infer<typeof createMetricSchema>
