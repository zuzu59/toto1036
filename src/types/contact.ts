export interface Contact {
  id: number
  firstName: string
  lastName: string
  displayName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  notes: string
  searchText: string
  favorite: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface ContactDraft {
  firstName: string
  lastName: string
  displayName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  notes: string
  favorite: boolean
  archived: boolean
}

export interface ImportResult {
  imported: number
  skipped: number
  duplicates: number
}
