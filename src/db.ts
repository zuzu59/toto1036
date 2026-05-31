import Dexie, { type Table } from 'dexie'
import type { Contact } from '@/types/contact'

class ContactsDatabase extends Dexie {
  contacts!: Table<Contact, number>

  constructor() {
    super('z-pwa-contacts')
    this.version(1).stores({
      contacts: '++id, displayName, phone, email, searchText, favorite, archived, updatedAt',
    })
    this.version(2)
      .stores({
        contacts: '++id, displayName, phone, email, searchText, favorite, archived, updatedAt',
      })
      .upgrade((tx) =>
        tx.table('contacts').toCollection().modify((contact: Contact) => {
          contact.phone2 ??= ''
          contact.phone3 ??= ''
          contact.email2 ??= ''
          contact.email3 ??= ''
        }),
      )
    this.version(3)
      .stores({
        contacts: '++id, displayName, phone, email, searchText, favorite, archived, updatedAt',
      })
      .upgrade((tx) =>
        tx.table('contacts').toCollection().modify((contact: Contact) => {
          contact.addressLine1 ??= ''
          contact.addressLine2 ??= ''
          contact.postalCode ??= ''
          contact.city ??= ''
          contact.country ??= ''
          contact.phone2 ??= ''
          contact.phone3 ??= ''
          contact.email2 ??= ''
          contact.email3 ??= ''
        }),
      )
  }
}

export const db = new ContactsDatabase()
