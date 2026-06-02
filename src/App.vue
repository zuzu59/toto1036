<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ContactDetail from './components/ContactDetail.vue';
import ContactForm from './components/ContactForm.vue';
import ContactList from './components/ContactList.vue';
import SearchBar from './components/SearchBar.vue';
import { createContact, deleteContact, getContact, listContacts, updateContact } from './services/contacts';
import type { Contact, ContactInput } from './types/contact';

const menuRef = ref<HTMLElement | null>(null);
const aboutMenuOpen = ref(false);
const contacts = ref<Contact[]>([]);
const selectedContact = ref<Contact | null>(null);
const mode = ref<'list' | 'create' | 'edit' | 'detail'>('list');
const query = ref('');
const busy = ref(false);
const notice = ref('');
const isOnline = ref(navigator.onLine);

const statusLabel = computed(() => (isOnline.value ? 'En ligne' : 'Hors ligne'));
const appVersion = __APP_VERSION__;
const buildLabel = computed(() =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(__BUILD_AT__)),
);

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

function toggleAboutMenu() {
  aboutMenuOpen.value = !aboutMenuOpen.value;
}

function closeAboutMenu() {
  aboutMenuOpen.value = false;
}

function handleDocumentClick(event: MouseEvent) {
  if (!aboutMenuOpen.value) {
    return;
  }

  const target = event.target as Node | null;
  if (target && menuRef.value?.contains(target)) {
    return;
  }

  closeAboutMenu();
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeAboutMenu();
  }
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
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
  await refreshList();
});

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleDocumentKeydown);
});
</script>

<template>
  <div class="container">
    <div class="shell">
      <header ref="menuRef" class="card header header-shell">
        <div class="row header-top">
          <div>
            <h1>z-PWA Contacts</h1>
            <p>Carnet de contacts local, installable et utilisable hors ligne.</p>
          </div>

          <div class="row header-actions">
            <span class="badge">{{ statusLabel }}</span>
            <div class="menu-wrapper">
              <button
                class="menu-button"
                type="button"
                aria-label="Ouvrir le menu"
                :aria-expanded="aboutMenuOpen"
                @click.stop="toggleAboutMenu"
              >
                ☰
              </button>

              <div v-if="aboutMenuOpen" class="menu-dropdown card" role="menu">
                <div class="menu-title">About</div>
                <a class="menu-link" href="https://github.com/zuzu59" target="_blank" rel="noreferrer">
                  @zuzu59
                </a>
                <a
                  class="menu-link"
                  href="https://github.com/zuzu59/toto1036/tree/tutu"
                  target="_blank"
                  rel="noreferrer"
                >
                  Projet GitHub
                </a>
                <a
                  class="menu-link"
                  href="https://github.com/zuzu59/toto1036/releases"
                  target="_blank"
                  rel="noreferrer"
                >
                  v{{ appVersion }} — {{ buildLabel }}
                </a>
              </div>
            </div>
          </div>
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

      <footer class="card footer">
        <span>Version {{ appVersion }}</span>
        <span>•</span>
        <span>Build du {{ buildLabel }}</span>
      </footer>
    </div>
  </div>
</template>
