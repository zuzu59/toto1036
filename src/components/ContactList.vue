<script setup lang="ts">
import type { Contact } from '../types/contact';

const props = defineProps<{
  contacts: Contact[];
  selectedId?: number | null;
}>();

const emit = defineEmits<{
  (event: 'select', contact: Contact): void;
  (event: 'create'): void;
}>();
</script>

<template>
  <div class="stack">
    <div class="row" style="justify-content: space-between;">
      <div>
        <h2 class="detail-title" style="margin-bottom: 4px;">Contacts</h2>
        <p class="meta" style="margin: 0;">{{ props.contacts.length }} contact(s)</p>
      </div>
      <button class="button" type="button" @click="emit('create')">Nouveau contact</button>
    </div>

    <div v-if="props.contacts.length" class="list">
      <button
        v-for="contact in props.contacts"
        :key="contact.id"
        type="button"
        class="list-item"
        :class="{ active: contact.id === props.selectedId }"
        @click="emit('select', contact)"
      >
        <strong>{{ contact.firstName }} {{ contact.lastName }}</strong>
        <span class="meta">{{ contact.phone || 'Téléphone absent' }}</span>
        <span class="meta">{{ contact.email || 'Email absent' }}</span>
      </button>
    </div>

    <div v-else class="empty">
      Aucun contact trouvé.
    </div>
  </div>
</template>
