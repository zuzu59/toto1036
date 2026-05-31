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
  return {
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
}

function escapeCsvValue(value: string): string {
  const escaped = value.replace(/"/g, '""')
  return /["\r\n;]/.test(escaped) ? `"${escaped}"` : escaped
}

function stringifyCsvRow(values: string[]): string {
  return values.map((value) => escapeCsvValue(value)).join(';')
}

function normalizeHeader(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}

function sniffDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? ''
  const counts: Array<[string, number]> = [
    [';', (firstLine.match(/;/g) ?? []).length],
    [',', (firstLine.match(/,/g) ?? []).length],
    ['\t', (firstLine.match(/\t/g) ?? []).length],
  ]

  counts.sort((a, b) => b[1] - a[1])
  return counts[0]?.[0] ?? ';'
}

function parseDelimitedRow(line: string, delimiter: string): string[] {
  const values: string[] =
    []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === delimiter) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function parseDelimitedText(text: string, delimiter: string): string[][] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim().length > 0)
  return lines.map((line) => parseDelimitedRow(line, delimiter))
}

function truthyCsvValue(value: string): boolean {
  return ['1', 'true', 'yes', 'oui', 'y', 'ok'].includes(normalizeText(value))
}

function csvToContactDraft(row: Record<string, string>): ContactDraft {
  return {
    firstName: row.firstname ?? row.prenom ?? row.prénom ?? '',
    lastName: row.lastname ?? row.nom ?? row.surname ?? '',
    displayName: row.displayname ?? row['nomaffiché'] ?? row['nomaffiche'] ?? '',
    phone: row.phone ?? row.tel ?? row.téléphone ?? row.telephone ?? '',
    email: row.email ?? row.mail ?? '',
    notes: row.notes ?? row.note ?? '',
    favorite: truthyCsvValue(row.favorite ?? row.favori ?? ''),
    archived: truthyCsvValue(row.archived ?? row.archive ?? ''),
  }
}

async function saveImportedContact(draft: ContactDraft, existingContacts: Contact[]): Promise<boolean> {
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
    return false
  }

  const saved = await createContact(draft)
  existingContacts.push(saved)
  return true
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

export async function exportContactsCsv(): Promise<string> {
  const contacts = await listContacts()
  const header = stringifyCsvRow([
    'firstName',
    'lastName',
    'displayName',
    'phone',
    'email',
    'notes',
    'favorite',
    'archived',
    'createdAt',
    'updatedAt',
  ])
  const rows = contacts.map((contact) =>
    stringifyCsvRow([
      contact.firstName,
      contact.lastName,
      contact.displayName,
      contact.phone,
      contact.email,
      contact.notes,
      contact.favorite ? '1' : '0',
      contact.archived ? '1' : '0',
      contact.createdAt,
      contact.updatedAt,
    ]),
  )

  return ['\uFEFF' + header, ...rows].join('\n')
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

    const wasImported = await saveImportedContact(draft, existingContacts)
    if (wasImported) {
      imported += 1
    } else {
      duplicates += 1
    }
  }

  return { imported, skipped, duplicates }
}

export async function importContactsCsv(text: string): Promise<ImportResult> {
  if (!text.trim()) {
    throw new Error('Fichier CSV vide')
  }

  const delimiter = sniffDelimiter(text)
  const rows = parseDelimitedText(text, delimiter)

  if (rows.length < 2) {
    throw new Error('Le fichier CSV doit contenir un en-tête et au moins une ligne')
  }

  const headers = rows[0].map((header) => normalizeHeader(header))
  const existingContacts = await listContacts()
  let imported = 0
  let skipped = 0
  let duplicates = 0

  for (const row of rows.slice(1)) {
    if (!row.some((value) => value.trim().length > 0)) {
      skipped += 1
      continue
    }

    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = row[index] ?? ''
    })

    const draft = csvToContactDraft(record)
    if (!buildDisplayName(draft) && !draft.firstName && !draft.lastName && !draft.phone && !draft.email && !draft.notes) {
      skipped += 1
      continue
    }

    const wasImported = await saveImportedContact(draft, existingContacts)
    if (wasImported) {
      imported += 1
    } else {
      duplicates += 1
    }
  }

  return { imported, skipped, duplicates }
}
