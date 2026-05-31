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
    phone2: cleaned.phone2,
    phone3: cleaned.phone3,
    email: cleaned.email,
    email2: cleaned.email2,
    email3: cleaned.email3,
    addressLine1: cleaned.addressLine1,
    addressLine2: cleaned.addressLine2,
    postalCode: cleaned.postalCode,
    city: cleaned.city,
    country: cleaned.country,
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

function parseDelimitedText(text: string, delimiter: string): string[][] {
  const input = text.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    const next = input[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell)
      cell = ''
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        i += 1
      }
      row.push(cell)
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row)
      }
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  if (row.some((value) => value.trim().length > 0)) {
    rows.push(row)
  }

  return rows
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
    phone2: row.phone2 ?? row.tel2 ?? row.telephone2 ?? '',
    phone3: row.phone3 ?? row.tel3 ?? row.telephone3 ?? '',
    email: row.email ?? row.mail ?? '',
    email2: row.email2 ?? row.mail2 ?? '',
    email3: row.email3 ?? row.mail3 ?? '',
    addressLine1: row.addressline1 ?? row.address1 ?? row.street ?? row.rue ?? '',
    addressLine2: row.addressline2 ?? row.address2 ?? row.complement ?? row.complementdadresse ?? '',
    postalCode: row.postalcode ?? row.zip ?? row.zipcode ?? row.postcode ?? row.cp ?? '',
    city: row.city ?? row.ville ?? '',
    country: row.country ?? row.pays ?? '',
    notes: row.notes ?? row.note ?? '',
    favorite: truthyCsvValue(row.favorite ?? row.favori ?? ''),
    archived: truthyCsvValue(row.archived ?? row.archive ?? ''),
  }
}

function splitGoogleValues(value: string): string[] {
  return value
    .split(/\s*:::\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function collectGoogleValues(row: Record<string, string>, keys: string[]): string[] {
  const values = keys.flatMap((key) => splitGoogleValues(row[key] ?? ''))
  return [...new Set(values)]
}

function googleCsvToContactDraft(row: Record<string, string>): ContactDraft {
  const firstName = row.firstname ?? ''
  const middleName = row.middlename ?? ''
  const lastName = row.lastname ?? ''
  const phoneValues = collectGoogleValues(row, ['phone1value', 'phone2value', 'phone3value'])
  const emailValues = collectGoogleValues(row, ['email1value', 'email2value', 'email3value'])
  const displayName =
    row.fileas?.trim() || [row.nameprefix, firstName, middleName, lastName, row.namesuffix].filter(Boolean).join(' ').trim()

  return {
    firstName: [firstName, middleName].filter(Boolean).join(' ').trim(),
    lastName,
    displayName,
    phone: phoneValues[0] ?? '',
    phone2: phoneValues[1] ?? '',
    phone3: phoneValues[2] ?? '',
    email: emailValues[0] ?? '',
    email2: emailValues[1] ?? '',
    email3: emailValues[2] ?? '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    country: '',
    notes: row.notes ?? '',
    favorite: false,
    archived: false,
  }
}

function isBlank(value: string): boolean {
  return !value.trim()
}

function mergeMissingContactFields(existing: Contact, incoming: ContactDraft): ContactDraft {
  const mergedPhones = [existing.phone, existing.phone2, existing.phone3]
  const incomingPhones = [incoming.phone, incoming.phone2, incoming.phone3].filter((value) => !isBlank(value))
  incomingPhones.forEach((value) => {
    if (!mergedPhones.includes(value) && mergedPhones.some(isBlank)) {
      const index = mergedPhones.findIndex(isBlank)
      if (index !== -1) {
        mergedPhones[index] = value
      }
    }
  })

  const mergedEmails = [existing.email, existing.email2, existing.email3]
  const incomingEmails = [incoming.email, incoming.email2, incoming.email3].filter((value) => !isBlank(value))
  incomingEmails.forEach((value) => {
    if (!mergedEmails.includes(value) && mergedEmails.some(isBlank)) {
      const index = mergedEmails.findIndex(isBlank)
      if (index !== -1) {
        mergedEmails[index] = value
      }
    }
  })

  return {
    firstName: existing.firstName || incoming.firstName,
    lastName: existing.lastName || incoming.lastName,
    displayName: existing.displayName || incoming.displayName || buildDisplayName(incoming),
    phone: mergedPhones[0] ?? '',
    phone2: mergedPhones[1] ?? '',
    phone3: mergedPhones[2] ?? '',
    email: mergedEmails[0] ?? '',
    email2: mergedEmails[1] ?? '',
    email3: mergedEmails[2] ?? '',
    addressLine1: existing.addressLine1 || incoming.addressLine1,
    addressLine2: existing.addressLine2 || incoming.addressLine2,
    postalCode: existing.postalCode || incoming.postalCode,
    city: existing.city || incoming.city,
    country: existing.country || incoming.country,
    notes: existing.notes || incoming.notes,
    favorite: existing.favorite,
    archived: existing.archived,
  }
}

function findMatchingExistingContact(draft: ContactDraft, existingContacts: Contact[]): Contact | undefined {
  const normalizedName = normalizeText(buildDisplayName(draft))
  const normalizedPhones = [draft.phone, draft.phone2, draft.phone3].map(normalizePhone).filter(Boolean)
  const normalizedEmails = [draft.email, draft.email2, draft.email3].map(normalizeEmail).filter(Boolean)

  return existingContacts.find((contact) => {
    const contactPhones = [contact.phone, contact.phone2, contact.phone3].map(normalizePhone).filter(Boolean)
    const contactEmails = [contact.email, contact.email2, contact.email3].map(normalizeEmail).filter(Boolean)
    const samePhone = normalizedPhones.some((value) => contactPhones.includes(value))
    const sameEmail = normalizedEmails.some((value) => contactEmails.includes(value))
    const sameName = normalizedName && normalizeText(contact.displayName) === normalizedName
    return samePhone || sameEmail || (sameName && !normalizedPhones.length && !normalizedEmails.length)
  })
}

async function saveImportedContact(draft: ContactDraft, existingContacts: Contact[]): Promise<boolean> {
  const duplicate = findMatchingExistingContact(draft, existingContacts)

  if (duplicate) {
    return false
  }

  const saved = await createContact(draft)
  existingContacts.push(saved)
  return true
}

async function saveOrMergeGoogleContact(draft: ContactDraft, existingContacts: Contact[]): Promise<'imported' | 'merged' | 'skipped'> {
  const match = findMatchingExistingContact(draft, existingContacts)
  if (!match) {
    const saved = await createContact(draft)
    existingContacts.push(saved)
    return 'imported'
  }

  const mergedDraft = mergeMissingContactFields(match, draft)
  const updated = await updateContact(match.id, mergedDraft)
  const index = existingContacts.findIndex((contact) => contact.id === match.id)
  if (index !== -1) {
    existingContacts[index] = updated
  }
  return 'merged'
}

export async function listContacts(): Promise<Contact[]> {
  return db.contacts.orderBy('updatedAt').reverse().toArray()
}

export async function listFavoriteContacts(): Promise<Contact[]> {
  return db.contacts.orderBy('updatedAt').reverse().filter((contact) => contact.favorite && !contact.archived).toArray()
}

export async function listContactsByName(): Promise<Contact[]> {
  const contacts = await listContacts()
  return contacts.slice().sort((a, b) => {
    const lastNameCompare = a.lastName.localeCompare(b.lastName, 'fr', { sensitivity: 'base' })
    if (lastNameCompare !== 0) {
      return lastNameCompare
    }

    const firstNameCompare = a.firstName.localeCompare(b.firstName, 'fr', { sensitivity: 'base' })
    if (firstNameCompare !== 0) {
      return firstNameCompare
    }

    return a.displayName.localeCompare(b.displayName, 'fr', { sensitivity: 'base' })
  })
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
    'phone2',
    'phone3',
    'email',
    'email2',
    'email3',
    'addressLine1',
    'addressLine2',
    'postalCode',
    'city',
    'country',
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
      contact.phone2,
      contact.phone3,
      contact.email,
      contact.email2,
      contact.email3,
      contact.addressLine1,
      contact.addressLine2,
      contact.postalCode,
      contact.city,
      contact.country,
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
  let merged = 0
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
      phone2: String(candidate.phone2 ?? ''),
      phone3: String(candidate.phone3 ?? ''),
      email: String(candidate.email ?? ''),
      email2: String(candidate.email2 ?? ''),
      email3: String(candidate.email3 ?? ''),
      addressLine1: String(candidate.addressLine1 ?? ''),
      addressLine2: String(candidate.addressLine2 ?? ''),
      postalCode: String(candidate.postalCode ?? ''),
      city: String(candidate.city ?? ''),
      country: String(candidate.country ?? ''),
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

  return { imported, merged, skipped, duplicates }
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
  let merged = 0
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
    if (
      !buildDisplayName(draft) &&
      !draft.firstName &&
      !draft.lastName &&
      !draft.phone &&
      !draft.phone2 &&
      !draft.phone3 &&
      !draft.email &&
      !draft.email2 &&
      !draft.email3 &&
      !draft.addressLine1 &&
      !draft.addressLine2 &&
      !draft.postalCode &&
      !draft.city &&
      !draft.country &&
      !draft.notes
    ) {
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

  return { imported, merged, skipped, duplicates }
}

export async function importGoogleContactsCsv(text: string): Promise<ImportResult> {
  if (!text.trim()) {
    throw new Error('Fichier CSV vide')
  }

  const delimiter = sniffDelimiter(text)
  const rows = parseDelimitedText(text, delimiter)

  if (rows.length < 2) {
    throw new Error('Le fichier Google CSV doit contenir un en-tête et au moins une ligne')
  }

  const headers = rows[0].map((header) => normalizeHeader(header))
  const existingContacts = await listContacts()
  let imported = 0
  let merged = 0
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

    const draft = googleCsvToContactDraft(record)
    if (
      !buildDisplayName(draft) &&
      !draft.firstName &&
      !draft.lastName &&
      !draft.phone &&
      !draft.phone2 &&
      !draft.phone3 &&
      !draft.email &&
      !draft.email2 &&
      !draft.email3 &&
      !draft.notes
    ) {
      skipped += 1
      continue
    }

    const outcome = await saveOrMergeGoogleContact(draft, existingContacts)
    if (outcome === 'imported') {
      imported += 1
    } else if (outcome === 'merged') {
      merged += 1
    } else {
      duplicates += 1
    }
  }

  return { imported, merged, skipped, duplicates }
}
