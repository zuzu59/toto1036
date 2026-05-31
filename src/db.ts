import Dexie, { type Table } from 'dexie'
import type { Contact } from '@/types/contact'

class ContactsDatabase extends Dexie {
  contacts!: Table<Contact, number>

  constructor() {
    super('z-pwa-contacts')
    this.version(1).stores({
      contacts: '++id, displayName, phone, email, searchText, favorite, archived, updatedAt',
    })
  }
}

export const db = new ContactsDatabase()
