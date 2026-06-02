export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function buildSearchText(contact: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
}): string {
  return normalizeText(
    [contact.firstName, contact.lastName, contact.phone, contact.email, contact.notes]
      .filter(Boolean)
      .join(' '),
  );
}
