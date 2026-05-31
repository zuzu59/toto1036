import type { Contact, ContactDraft } from '@/types/contact'
import { normalizeEmail, normalizePhone, normalizeText } from './normalize'

export function createEmptyContactDraft(): ContactDraft {
  return {
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    email: '',
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
    email: draft.email.trim(),
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
  email: string
  notes: string
}): string {
  return normalizeText(
    [contact.firstName, contact.lastName, contact.displayName, contact.phone, contact.email, contact.notes]
      .filter(Boolean)
      .join(' '),
  )
}

export function hasMeaningfulValue(draft: ContactDraft): boolean {
  return [draft.firstName, draft.lastName, draft.displayName, draft.phone, draft.email, draft.notes].some(
    (value) => value.trim().length > 0,
  )
}

export function contactToDraft(contact: Contact): ContactDraft {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    displayName: contact.displayName,
    phone: contact.phone,
    email: contact.email,
    notes: contact.notes,
    favorite: contact.favorite,
    archived: contact.archived,
  }
}

export function isPotentialDuplicate(a: ContactDraft, b: Contact, ignoreId?: number): boolean {
  if (ignoreId && b.id === ignoreId) {
    return false
  }

  const aPhone = normalizePhone(a.phone)
  const bPhone = normalizePhone(b.phone)
  if (aPhone && bPhone && aPhone === bPhone) {
    return true
  }

  const aEmail = normalizeEmail(a.email)
  const bEmail = normalizeEmail(b.email)
  if (aEmail && bEmail && aEmail === bEmail) {
    return true
  }

  return false
}
