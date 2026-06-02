<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { Contact, ContactInput } from '../types/contact';

const props = defineProps<{
  contact?: Contact | null;
  mode: 'create' | 'edit';
  busy?: boolean;
}>();

const emit = defineEmits<{
  (event: 'save', contact: ContactInput): void;
  (event: 'cancel'): void;
}>();

const error = ref('');

const form = reactive<ContactInput>({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  notes: '',
});

watch(
  () => props.contact,
  (contact) => {
    error.value = '';
    form.firstName = contact?.firstName ?? '';
    form.lastName = contact?.lastName ?? '';
    form.phone = contact?.phone ?? '';
    form.email = contact?.email ?? '';
    form.notes = contact?.notes ?? '';
  },
  { immediate: true },
);

function submit() {
  if (!form.firstName.trim() && !form.lastName.trim()) {
    error.value = 'Le prénom ou le nom doit être renseigné.';
    return;
  }

  error.value = '';

  emit('save', {
    firstName: form.firstName,
    lastName: form.lastName,
    phone: form.phone,
    email: form.email,
    notes: form.notes,
  });
}
</script>

<template>
  <form class="stack" @submit.prevent="submit">
    <div>
      <h2 class="detail-title">{{ props.mode === 'create' ? 'Créer un contact' : 'Modifier le contact' }}</h2>
      <p class="meta">Les champs prénom et nom sont recommandés.</p>
      <p v-if="error" class="meta" style="color: #b91c1c;">{{ error }}</p>
    </div>

    <div class="form-grid">
      <label class="label">
        <span>Prénom</span>
        <input v-model="form.firstName" class="field" type="text" autocomplete="given-name" />
      </label>

      <label class="label">
        <span>Nom</span>
        <input v-model="form.lastName" class="field" type="text" autocomplete="family-name" />
      </label>

      <label class="label">
        <span>Téléphone</span>
        <input v-model="form.phone" class="field" type="tel" autocomplete="tel" />
      </label>

      <label class="label">
        <span>Email</span>
        <input v-model="form.email" class="field" type="email" autocomplete="email" />
      </label>

      <label class="label">
        <span>Notes</span>
        <textarea v-model="form.notes"></textarea>
      </label>
    </div>

    <div class="row">
      <button class="button" type="submit" :disabled="props.busy">
        {{ props.mode === 'create' ? 'Créer' : 'Enregistrer' }}
      </button>
      <button class="button secondary" type="button" @click="emit('cancel')">Annuler</button>
    </div>
  </form>
</template>
