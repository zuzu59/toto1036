import Dexie, { type Table } from 'dexie';
import type { Contact } from './types/contact';

class ContactsDatabase extends Dexie {
  contacts!: Table<Contact, number>;

  constructor() {
    super('zPwaContacts');

    this.version(1).stores({
      contacts: '++id, searchText, updatedAt, createdAt, lastName, firstName',
    });
  }
}

export const db = new ContactsDatabase();
