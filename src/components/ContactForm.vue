<template>
  <section class="contact-form">
    <div class="section-heading">
      <div>
        <h2>{{ mode === 'edit' ? 'Modifier le contact' : 'Nouveau contact' }}</h2>
        <p>Formulaire simple, pensé pour mobile.</p>
      </div>
      <span v-if="mode === 'edit'" class="badge">Édition</span>
    </div>

    <p v-if="duplicateMessage" class="alert alert--warning">{{ duplicateMessage }}</p>

    <form class="form-grid" @submit.prevent="$emit('submit')">
      <label>
        Prénom
        <input :value="modelValue.firstName" type="text" autocomplete="given-name" @input="update('firstName', $event)" />
      </label>

      <label>
        Nom
        <input :value="modelValue.lastName" type="text" autocomplete="family-name" @input="update('lastName', $event)" />
      </label>

      <label class="form-grid__full">
        Nom affiché
        <input :value="modelValue.displayName" type="text" autocomplete="name" @input="update('displayName', $event)" />
      </label>

      <label>
        Téléphone 1
        <input :value="modelValue.phone" type="tel" autocomplete="tel" @input="update('phone', $event)" />
      </label>

      <label>
        Téléphone 2
        <input :value="modelValue.phone2" type="tel" autocomplete="tel" @input="update('phone2', $event)" />
      </label>

      <label>
        Téléphone 3
        <input :value="modelValue.phone3" type="tel" autocomplete="tel" @input="update('phone3', $event)" />
      </label>

      <label>
        Email 1
        <input :value="modelValue.email" type="email" autocomplete="email" @input="update('email', $event)" />
      </label>

      <label>
        Email 2
        <input :value="modelValue.email2" type="email" autocomplete="email" @input="update('email2', $event)" />
      </label>

      <label>
        Email 3
        <input :value="modelValue.email3" type="email" autocomplete="email" @input="update('email3', $event)" />
      </label>

      <label class="form-grid__full">
        Adresse 1
        <input :value="modelValue.addressLine1" type="text" autocomplete="address-line1" @input="update('addressLine1', $event)" />
      </label>

      <label class="form-grid__full">
        Adresse 2
        <input :value="modelValue.addressLine2" type="text" autocomplete="address-line2" @input="update('addressLine2', $event)" />
      </label>

      <label>
        Code postal
        <input :value="modelValue.postalCode" type="text" inputmode="numeric" autocomplete="postal-code" @input="update('postalCode', $event)" />
      </label>

      <label>
        Ville
        <input :value="modelValue.city" type="text" autocomplete="address-level2" @input="update('city', $event)" />
      </label>

      <label class="form-grid__full">
        Pays
        <input :value="modelValue.country" type="text" autocomplete="country-name" @input="update('country', $event)" />
      </label>

      <label class="form-grid__full">
        Notes
        <textarea :value="modelValue.notes" rows="5" @input="update('notes', $event)"></textarea>
      </label>

      <label class="checkbox">
        <input :checked="modelValue.favorite" type="checkbox" @change="updateCheck('favorite', $event)" />
        Favori
      </label>

      <label class="checkbox">
        <input :checked="modelValue.archived" type="checkbox" @change="updateCheck('archived', $event)" />
        Archivé
      </label>

      <div class="form-actions form-grid__full">
        <button type="submit" class="primary-button" :disabled="busy || !canSave">
          {{ busy ? 'Enregistrement...' : mode === 'edit' ? 'Enregistrer' : 'Créer le contact' }}
        </button>
        <button type="button" class="ghost-button" @click="$emit('cancel')">Annuler</button>
        <button v-if="mode === 'edit'" type="button" class="danger-button" @click="$emit('delete')">Supprimer</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ContactDraft } from '@/types/contact'
import { hasMeaningfulValue } from '@/utils/contacts'

interface Props {
  modelValue: ContactDraft
  mode: 'create' | 'edit'
  busy?: boolean
  duplicateMessage?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ContactDraft): void
  (e: 'submit'): void
  (e: 'cancel'): void
  (e: 'delete'): void
}>()

const canSave = computed(() => hasMeaningfulValue(props.modelValue))

function update(field: keyof ContactDraft, event: Event) {
  const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

function updateCheck(field: 'favorite' | 'archived', event: Event) {
  const value = (event.target as HTMLInputElement).checked
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
