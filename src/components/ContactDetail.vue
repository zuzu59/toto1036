<script setup lang="ts">
import type { Contact } from '../types/contact';

const props = defineProps<{
  contact: Contact;
}>();

const emit = defineEmits<{
  (event: 'edit'): void;
  (event: 'back'): void;
  (event: 'delete'): void;
}>();
</script>

<template>
  <div class="detail-card">
    <div class="row" style="justify-content: space-between; align-items: start;">
      <div>
        <h2 class="detail-title">{{ props.contact.firstName }} {{ props.contact.lastName }}</h2>
        <p class="meta">Contact enregistré localement</p>
      </div>
      <span class="badge">Offline ready</span>
    </div>

    <div class="detail-list">
      <div class="detail-line">
        <span>Téléphone</span>
        <strong>{{ props.contact.phone || '—' }}</strong>
      </div>
      <div class="detail-line">
        <span>Email</span>
        <strong>{{ props.contact.email || '—' }}</strong>
      </div>
      <div class="detail-line">
        <span>Adresse</span>
        <strong style="white-space: pre-wrap;">{{ props.contact.address || '—' }}</strong>
      </div>
      <div class="detail-line">
        <span>Notes</span>
        <strong style="white-space: pre-wrap;">{{ props.contact.notes || '—' }}</strong>
      </div>
    </div>

    <div class="row">
      <button class="button" type="button" @click="emit('edit')">Modifier</button>
      <button class="button secondary" type="button" @click="emit('back')">Retour</button>
      <button class="button danger" type="button" @click="emit('delete')">Supprimer</button>
    </div>
  </div>
</template>
