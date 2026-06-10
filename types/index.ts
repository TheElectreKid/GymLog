export type Member = {
  id: string
  name: string
  phone: string
  expiry: string
  planId?: string
  cost?: number
}

export type Plan = {
  id: string
  name: string
  days: number
  cost: number
}