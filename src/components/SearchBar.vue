<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

function update(value: string) {
  emit('update:modelValue', value);
}
</script>

<template>
  <label class="stack" aria-label="Recherche de contact">
    <span class="meta">Recherche</span>
    <input
      class="search-input"
      :value="props.modelValue"
      type="search"
      :placeholder="props.placeholder ?? 'Nom, téléphone, email, notes…'"
      @input="update(($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
