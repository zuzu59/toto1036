<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ContactDetail from './components/ContactDetail.vue';
import ContactForm from './components/ContactForm.vue';
import ContactList from './components/ContactList.vue';
import SearchBar from './components/SearchBar.vue';
import { createContact, deleteContact, getContact, listContacts, updateContact } from './services/contacts';
import type { Contact, ContactInput } from './types/contact';

const contacts = ref<Contact[]>([]);
const selectedContact = ref<Contact | null>(null);
const mode = ref<'list' | 'create' | 'edit' | 'detail'>('list');
const query = ref('');
const busy = ref(false);
const notice = ref('');
const isOnline = ref(navigator.onLine);

const statusLabel = computed(() => (isOnline.value ? 'En ligne' : 'Hors ligne'));

async function refreshList() {
  contacts.value = await listContacts(query.value);
}

async function selectContact(contact: Contact) {
  if (!contact.id) {
    return;
  }

  notice.value = '';
  selectedContact.value = await getContact(contact.id) ?? contact;
  mode.value = 'detail';
}

function startCreate() {
  notice.value = '';
  selectedContact.value = null;
  mode.value = 'create';
}

function startEdit() {
  if (!selectedContact.value) {
    return;
  }

  notice.value = '';
  mode.value = 'edit';
}

function returnToList() {
  notice.value = '';
  selectedContact.value = null;
  mode.value = 'list';
}

function cancelEdit() {
  mode.value = 'detail';
}

async function saveCreate(payload: ContactInput) {
  busy.value = true;
  notice.value = '';

  try {
    const id = await createContact(payload);
    selectedContact.value = await getContact(id) ?? null;
    mode.value = 'detail';
    notice.value = 'Contact créé.';
    await refreshList();
  } finally {
    busy.value = false;
  }
}

async function saveEdit(payload: ContactInput) {
  if (!selectedContact.value?.id) {
    return;
  }

  busy.value = true;
  notice.value = '';

  try {
    await updateContact(selectedContact.value.id, payload);
    selectedContact.value = await getContact(selectedContact.value.id) ?? null;
    mode.value = 'detail';
    notice.value = 'Contact mis à jour.';
    await refreshList();
  } finally {
    busy.value = false;
  }
}

async function removeSelected() {
  if (!selectedContact.value?.id) {
    return;
  }

  if (!window.confirm('Supprimer ce contact ?')) {
    return;
  }

  busy.value = true;
  notice.value = '';

  try {
    await deleteContact(selectedContact.value.id);
    selectedContact.value = null;
    mode.value = 'list';
    notice.value = 'Contact supprimé.';
    await refreshList();
  } finally {
    busy.value = false;
  }
}

watch(query, async () => {
  await refreshList();
});

function handleOnline() {
  isOnline.value = true;
}

function handleOffline() {
  isOnline.value = false;
}

onMounted(async () => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  await refreshList();
});

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<template>
  <div class="container">
    <div class="shell">
      <header class="card header">
        <div class="row" style="justify-content: space-between; align-items: start;">
          <div>
            <h1>z-PWA Contacts</h1>
            <p>Carnet de contacts local, installable et utilisable hors ligne.</p>
          </div>
          <span class="badge">{{ statusLabel }}</span>
        </div>
        <p v-if="notice" class="meta" style="margin-top: 12px;">{{ notice }}</p>
      </header>

      <main class="grid">
        <section class="card panel stack">
          <SearchBar v-model="query" />
          <ContactList
            :contacts="contacts"
            :selected-id="selectedContact?.id ?? null"
            @select="selectContact"
            @create="startCreate"
          />
        </section>

        <section class="card panel">
          <ContactForm
            v-if="mode === 'create'"
            :mode="'create'"
            :busy="busy"
            @save="saveCreate"
            @cancel="returnToList"
          />

          <ContactForm
            v-else-if="mode === 'edit' && selectedContact"
            :contact="selectedContact"
            :mode="'edit'"
            :busy="busy"
            @save="saveEdit"
            @cancel="cancelEdit"
          />

          <ContactDetail
            v-else-if="selectedContact"
            :contact="selectedContact"
            @edit="startEdit"
            @back="returnToList"
            @delete="removeSelected"
          />

          <div v-else class="empty">
            Sélectionne un contact ou crée-en un nouveau pour commencer.
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
