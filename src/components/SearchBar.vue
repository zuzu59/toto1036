<template>
  <div class="search-bar">
    <label class="search-bar__label" for="contact-search">Rechercher</label>
    <div class="search-bar__field">
      <input
        id="contact-search"
        :value="modelValue"
        type="search"
        inputmode="search"
        placeholder="Nom, téléphone, email, notes..."
        @input="onInput"
      />
      <button v-if="modelValue" type="button" class="ghost-button" @click="$emit('clear')">Effacer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'clear'): void
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
