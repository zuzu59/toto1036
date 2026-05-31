import { db } from '@/db'
import type { Contact, ContactDraft, ImportResult } from '@/types/contact'
import { buildDisplayName, buildSearchText, isPotentialDuplicate, trimContactDraft } from '@/utils/contacts'
import { normalizeEmail, normalizePhone, normalizeText } from '@/utils/normalize'

function nowIso(): string {
  return new Date().toISOString()
}

function toRecord(draft: ContactDraft, existing?: Contact): Omit<Contact, 'id'> {
  const cleaned = trimContactDraft(draft)
  const displayName = buildDisplayName(cleaned)
  const resolved: Omit<Contact, 'id'> = {
    firstName: cleaned.firstName,
    lastName: cleaned.lastName,
    displayName,
    phone: cleaned.phone,
    email: cleaned.email,
    notes: cleaned.notes,
    searchText: buildSearchText({ ...cleaned, displayName }),
    favorite: cleaned.favorite,
    archived: cleaned.archived,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  }

  return resolved
}

export async function listContacts(): Promise<Contact[]> {
  return db.contacts.orderBy('updatedAt').reverse().toArray()
}

export async function getContact(id: number): Promise<Contact | undefined> {
  return db.contacts.get(id)
}

export async function searchContacts(query: string): Promise<Contact[]> {
  const term = normalizeText(query)
  const contacts = await listContacts()

  if (!term) {
    return contacts
  }

  return contacts.filter((contact) => normalizeText(contact.searchText).includes(term))
}

export async function createContact(draft: ContactDraft): Promise<Contact> {
  const record = toRecord(draft)
  const id = await db.contacts.add(record as Contact)
  return { ...record, id }
}

export async function updateContact(id: number, draft: ContactDraft): Promise<Contact> {
  const existing = await db.contacts.get(id)
  if (!existing) {
    throw new Error('Contact introuvable')
  }

  const record = toRecord(draft, existing)
  await db.contacts.put({ ...record, id })
  return { ...record, id }
}

export async function deleteContact(id: number): Promise<void> {
  await db.contacts.delete(id)
}

export async function findPotentialDuplicates(draft: ContactDraft, excludeId?: number): Promise<Contact[]> {
  const contacts = await listContacts()
  return contacts.filter((contact) => isPotentialDuplicate(draft, contact, excludeId))
}

export async function exportContacts(): Promise<string> {
  const contacts = await listContacts()
  return JSON.stringify(
    {
      exportedAt: nowIso(),
      version: 1,
      contacts,
    },
    null,
    2,
  )
}

export async function importContacts(payload: unknown): Promise<ImportResult> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Fichier JSON invalide')
  }

  const source = payload as {
    contacts?: unknown
  }

  if (!Array.isArray(source.contacts)) {
    throw new Error('Le fichier doit contenir un tableau contacts')
  }

  const existingContacts = await listContacts()
  let imported = 0
  let skipped = 0
  let duplicates = 0

  for (const item of source.contacts) {
    if (!item || typeof item !== 'object') {
      skipped += 1
      continue
    }

    const candidate = item as Partial<Contact>
    const draft: ContactDraft = {
      firstName: String(candidate.firstName ?? ''),
      lastName: String(candidate.lastName ?? ''),
      displayName: String(candidate.displayName ?? ''),
      phone: String(candidate.phone ?? ''),
      email: String(candidate.email ?? ''),
      notes: String(candidate.notes ?? ''),
      favorite: Boolean(candidate.favorite),
      archived: Boolean(candidate.archived),
    }

    const normalizedName = normalizeText(buildDisplayName(draft))
    const normalizedPhone = normalizePhone(draft.phone)
    const normalizedEmail = normalizeEmail(draft.email)

    const duplicate = existingContacts.some((contact) => {
      const samePhone = normalizedPhone && normalizePhone(contact.phone) === normalizedPhone
      const sameEmail = normalizedEmail && normalizeEmail(contact.email) === normalizedEmail
      const sameName = normalizedName && normalizeText(contact.displayName) === normalizedName
      return samePhone || sameEmail || (sameName && !normalizedPhone && !normalizedEmail)
    })

    if (duplicate) {
      duplicates += 1
      continue
    }

    await createContact(draft)
    imported += 1
    existingContacts.push({
      id: -1,
      firstName: draft.firstName,
      lastName: draft.lastName,
      displayName: buildDisplayName(draft),
      phone: draft.phone,
      email: draft.email,
      notes: draft.notes,
      searchText: buildSearchText(draft),
      favorite: draft.favorite,
      archived: draft.archived,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    })
  }

  return { imported, skipped, duplicates }
}
