export interface Contact {
  id?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
  searchText: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactInput = Omit<Contact, 'id' | 'searchText' | 'createdAt' | 'updatedAt'>;
