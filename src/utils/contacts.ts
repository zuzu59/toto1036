import type { Contact, ContactDraft } from '@/types/contact'
import { normalizeEmail, normalizePhone, normalizeText } from './normalize'

export function createEmptyContactDraft(): ContactDraft {
  return {
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    phone2: '',
    phone3: '',
    email: '',
    email2: '',
    email3: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    country: '',
    notes: '',
    favorite: false,
    archived: false,
  }
}

export function trimContactDraft(draft: ContactDraft): ContactDraft {
  return {
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    displayName: draft.displayName.trim(),
    phone: draft.phone.trim(),
    phone2: draft.phone2.trim(),
    phone3: draft.phone3.trim(),
    email: draft.email.trim(),
    email2: draft.email2.trim(),
    email3: draft.email3.trim(),
    addressLine1: draft.addressLine1.trim(),
    addressLine2: draft.addressLine2.trim(),
    postalCode: draft.postalCode.trim(),
    city: draft.city.trim(),
    country: draft.country.trim(),
    notes: draft.notes.trim(),
    favorite: draft.favorite,
    archived: draft.archived,
  }
}

export function buildDisplayName(draft: Pick<ContactDraft, 'firstName' | 'lastName' | 'displayName'>): string {
  const manual = draft.displayName.trim()
  if (manual) {
    return manual
  }

  return [draft.firstName.trim(), draft.lastName.trim()].filter(Boolean).join(' ').trim()
}

export function buildSearchText(contact: {
  firstName: string
  lastName: string
  displayName: string
  phone: string
  phone2: string
  phone3: string
  email: string
  email2: string
  email3: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  notes: string
}): string {
  return normalizeText(
    [
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
    ]
      .filter(Boolean)
      .join(' '),
  )
}

export function hasMeaningfulValue(draft: ContactDraft): boolean {
  return [
    draft.firstName,
    draft.lastName,
    draft.displayName,
    draft.phone,
    draft.phone2,
    draft.phone3,
    draft.email,
    draft.email2,
    draft.email3,
    draft.addressLine1,
    draft.addressLine2,
    draft.postalCode,
    draft.city,
    draft.country,
    draft.notes,
  ].some(
    (value) => value.trim().length > 0,
  )
}

export function contactToDraft(contact: Contact): ContactDraft {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    displayName: contact.displayName,
    phone: contact.phone,
    phone2: contact.phone2,
    phone3: contact.phone3,
    email: contact.email,
    email2: contact.email2,
    email3: contact.email3,
    addressLine1: contact.addressLine1,
    addressLine2: contact.addressLine2,
    postalCode: contact.postalCode,
    city: contact.city,
    country: contact.country,
    notes: contact.notes,
    favorite: contact.favorite,
    archived: contact.archived,
  }
}

export function isPotentialDuplicate(a: ContactDraft, b: Contact, ignoreId?: number): boolean {
  if (ignoreId && b.id === ignoreId) {
    return false
  }

  const aPhones = [a.phone, a.phone2, a.phone3].map(normalizePhone).filter(Boolean)
  const bPhones = [b.phone, b.phone2, b.phone3].map(normalizePhone).filter(Boolean)
  if (aPhones.some((value) => bPhones.includes(value))) {
    return true
  }

  const aEmails = [a.email, a.email2, a.email3].map(normalizeEmail).filter(Boolean)
  const bEmails = [b.email, b.email2, b.email3].map(normalizeEmail).filter(Boolean)
  if (aEmails.some((value) => bEmails.includes(value))) {
    return true
  }

  return false
}
