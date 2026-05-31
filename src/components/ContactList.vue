<template>
  <section class="contact-list">
    <div class="section-heading">
      <div>
        <h2>Contacts</h2>
        <p>{{ contacts.length }} contact{{ contacts.length > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <div v-if="!contacts.length" class="empty-state">
      <strong>{{ emptyTitle }}</strong>
      <p>{{ emptyDescription }}</p>
    </div>

    <button
      v-for="contact in contacts"
      :key="contact.id"
      type="button"
      class="contact-card"
      :class="{ 'contact-card--selected': contact.id === selectedId }"
      @click="$emit('select', contact.id)"
    >
      <div class="contact-card__main">
        <strong>{{ contact.displayName || contact.firstName || contact.lastName || 'Sans nom' }}</strong>
        <span>{{ contact.phone || contact.email || 'Aucun moyen de contact' }}</span>
        <span v-if="addressSummary(contact)">{{ addressSummary(contact) }}</span>
      </div>
      <div class="contact-card__meta">
        <span v-if="contact.favorite" class="badge badge--gold">Favori</span>
        <span v-if="contact.archived" class="badge">Archivé</span>
      </div>
    </button>
  </section>
</template>

<script setup lang="ts">
import type { Contact } from '@/types/contact'

withDefaults(
  defineProps<{
    contacts: Contact[]
    selectedId: number | null
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    emptyTitle: 'Aucun contact',
    emptyDescription: 'Crée ton premier contact pour commencer.',
  },
)

defineEmits<{
  (e: 'select', id: number): void
}>()

function addressSummary(contact: Contact): string {
  return [contact.addressLine1, contact.addressLine2, [contact.postalCode, contact.city].filter(Boolean).join(' '), contact.country]
    .filter(Boolean)
    .join(' · ')
}
</script>
