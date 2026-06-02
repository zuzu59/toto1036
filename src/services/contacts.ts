import { db } from '../db';
import type { Contact, ContactInput } from '../types/contact';
import { buildSearchText, normalizeText } from '../utils/normalize';

function toTimestamp(): string {
  return new Date().toISOString();
}

function hydrateContact(contact: ContactInput, previous?: Contact): Contact {
  const now = toTimestamp();
  const next: Contact = {
    id: previous?.id,
    firstName: contact.firstName.trim(),
    lastName: contact.lastName.trim(),
    phone: contact.phone.trim(),
    email: contact.email.trim(),
    notes: contact.notes.trim(),
    searchText: buildSearchText(contact),
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };

  return next;
}

export async function listContacts(query = ''): Promise<Contact[]> {
  const normalizedQuery = normalizeText(query);
  const contacts = await db.contacts.orderBy('updatedAt').reverse().toArray();

  if (!normalizedQuery) {
    return contacts;
  }

  return contacts.filter((contact) => contact.searchText.includes(normalizedQuery));
}

export function getContact(id: number): Promise<Contact | undefined> {
  return db.contacts.get(id);
}

export async function createContact(contact: ContactInput): Promise<number> {
  const next = hydrateContact(contact);
  return db.contacts.add(next);
}

export async function updateContact(id: number, contact: ContactInput): Promise<number> {
  const previous = await getContact(id);

  if (!previous) {
    throw new Error('Contact introuvable');
  }

  const next = hydrateContact(contact, previous);
  await db.contacts.update(id, next);
  return id;
}

export function deleteContact(id: number): Promise<void> {
  return db.contacts.delete(id);
}
