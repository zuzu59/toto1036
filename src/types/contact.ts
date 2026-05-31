export interface Contact {
  id: number
  firstName: string
  lastName: string
  displayName: string
  phone: string
  email: string
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
  notes: string
  favorite: boolean
  archived: boolean
}

export interface ImportResult {
  imported: number
  skipped: number
  duplicates: number
}
