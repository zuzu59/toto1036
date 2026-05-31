<template>
  <div class="app-shell">
    <header class="app-header">
      <div>
        <h1>z-PWA Contacts</h1>
        <p class="lead">Carnet de contacts installable, rapide et utilisable sans réseau.</p>
      </div>
      <div class="app-header__actions">
        <div class="app-header__stats">
          <span class="badge">{{ onlineLabel }}</span>
          <span class="badge">{{ contacts.length }} visibles</span>
        </div>
        <details ref="hamburgerMenu" class="app-hamburger">
          <summary aria-label="Ouvrir le menu">☰</summary>
          <div class="app-hamburger__menu">
            <button class="ghost-button" type="button" @click="exportAndClose('json')">Exporter JSON</button>
            <button class="ghost-button" type="button" @click="exportAndClose('csv')">Exporter CSV</button>
            <button class="ghost-button" type="button" @click="openImportAndClose('json')">Importer JSON</button>
            <button class="ghost-button" type="button" @click="openImportAndClose('csv')">Importer CSV</button>
            <button class="ghost-button" type="button" @click="openChangelogAndClose">Voir le changelog</button>
            <button class="ghost-button" type="button" @click="openAboutAndClose">About</button>
          </div>
        </details>
      </div>
    </header>

    <section v-if="notice" class="alert alert--success">{{ notice }}</section>
    <section v-if="error" class="alert alert--error">{{ error }}</section>

    <main class="dashboard">
      <section class="panel panel--list">
        <div class="panel__actions">
          <button v-if="!showEditor" class="primary-button" type="button" @click="startNewContact">Nouveau contact</button>
          <button v-if="editorMode === 'edit' && showEditor" class="ghost-button" type="button" @click="removeSelected">
            Supprimer
          </button>
          <input ref="importInput" class="sr-only" type="file" accept=".json,.csv,application/json,text/csv" @change="handleImportFile" />
        </div>

        <SearchBar v-model="query" @clear="query = ''" />
        <ContactList :contacts="contacts" :selected-id="selectedContactId" @select="selectContact" />
      </section>

      <section v-if="showEditor" class="panel panel--editor">
        <ContactForm
          v-model="draft"
          :mode="editorMode"
          :busy="saving"
          :duplicate-message="duplicateMessage"
          @submit="saveContact"
          @cancel="resetEditor"
        />
      </section>
    </main>

    <footer class="app-footer">
      <div class="app-footer__release">Release {{ appRelease }} · {{ appBuildLabel }}</div>
    </footer>

    <section v-if="showChangelog" class="app-changelog-overlay" role="dialog" aria-modal="true" aria-labelledby="changelog-title" @click.self="closeChangelog">
      <div class="app-changelog-panel">
        <div class="app-changelog-panel__header">
          <h2 id="changelog-title">Changelog</h2>
          <button class="ghost-button" type="button" @click="closeChangelog">Fermer</button>
        </div>
        <section v-for="group in appChangelog" :key="group.tag" class="app-footer__changelog-group">
          <h3>
            <span>{{ group.tag }}</span>
            <a v-if="group.releaseUrl" :href="group.releaseUrl" target="_blank" rel="noreferrer">Voir sur GitHub</a>
          </h3>
          <p class="app-footer__changelog-date">{{ group.dateTime }}</p>
          <ul>
            <li v-for="entry in group.entries" :key="entry">{{ entry }}</li>
          </ul>
        </section>
      </div>
    </section>

    <section v-if="showAbout" class="app-about-overlay" role="dialog" aria-modal="true" aria-labelledby="about-title" @click.self="closeAbout">
      <div class="app-about-panel">
        <div class="app-changelog-panel__header">
          <h2 id="about-title">About</h2>
          <button class="ghost-button" type="button" @click="closeAbout">Fermer</button>
        </div>
        <p><strong>z-PWA Contacts</strong> est un carnet de contacts offline-first pour smartphone.</p>
        <ul class="app-about-list">
          <li>Stack : Vue 3, Vite, TypeScript, Dexie, vite-plugin-pwa</li>
          <li>Stockage local uniquement</li>
          <li>Import/export JSON et CSV</li>
          <li>Projet : <a href="https://github.com/zuzu59/z-PWA" target="_blank" rel="noreferrer">GitHub</a></li>
          <li>Release : <a :href="releaseUrl" target="_blank" rel="noreferrer">{{ appRelease }}</a></li>
          <li>Version : {{ appRelease }} · {{ appBuildLabel }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ContactForm from '@/components/ContactForm.vue'
import ContactList from '@/components/ContactList.vue'
import SearchBar from '@/components/SearchBar.vue'
import { createContact, deleteContact, exportContacts, exportContactsCsv, findPotentialDuplicates, importContacts, importContactsCsv, listContacts, searchContacts, updateContact } from '@/services/contacts'
import type { Contact } from '@/types/contact'
import { contactToDraft, createEmptyContactDraft, hasMeaningfulValue } from '@/utils/contacts'
import { APP_BUILD_TIME, APP_CHANGELOG, APP_RELEASE } from '@/version'

const contacts = ref<Contact[]>([])
const query = ref('')
const selectedContactId = ref<number | null>(null)
const editorMode = ref<'create' | 'edit'>('create')
const showEditor = ref(false)
const draft = ref(createEmptyContactDraft())
const saving = ref(false)
const notice = ref('')
const error = ref('')
const duplicateMessage = ref<string | null>(null)
const importInput = ref<HTMLInputElement | null>(null)
const importMode = ref<'json' | 'csv'>('json')
const hamburgerMenu = ref<HTMLDetailsElement | null>(null)
const showChangelog = ref(false)
const showAbout = ref(false)
const online = ref(navigator.onLine)
const refreshToken = ref(0)
let refreshTimer: number | undefined

const onlineLabel = computed(() => (online.value ? 'En ligne' : 'Hors ligne'))
const appRelease = APP_RELEASE
const releaseUrl = `https://github.com/zuzu59/z-PWA/releases/tag/${appRelease}`
const appChangelog = APP_CHANGELOG
const appBuildLabel = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
}).format(new Date(APP_BUILD_TIME))

function showNotice(message: string) {
  notice.value = message
  error.value = ''
  window.setTimeout(() => {
    if (notice.value === message) {
      notice.value = ''
    }
  }, 2500)
}

function showError(message: string) {
  error.value = message
  notice.value = ''
  window.setTimeout(() => {
    if (error.value === message) {
      error.value = ''
    }
  }, 3500)
}

async function refreshContacts() {
  const token = ++refreshToken.value
  const results = query.value ? await searchContacts(query.value) : await listContacts()
  if (token === refreshToken.value) {
    contacts.value = results
  }
}

function startNewContact() {
  selectedContactId.value = null
  editorMode.value = 'create'
  showEditor.value = true
  draft.value = createEmptyContactDraft()
  duplicateMessage.value = null
}

function selectContact(id: number) {
  const contact = contacts.value.find((item) => item.id === id)
  if (!contact) {
    return
  }

  selectedContactId.value = contact.id
  editorMode.value = 'edit'
  showEditor.value = true
  draft.value = contactToDraft(contact)
  duplicateMessage.value = null
}

function resetEditor() {
  showEditor.value = false
  selectedContactId.value = null
  editorMode.value = 'create'
  draft.value = createEmptyContactDraft()
  duplicateMessage.value = null
}

async function saveContact() {
  if (!hasMeaningfulValue(draft.value)) {
    showError('Ajoute au moins une information au contact.')
    return
  }

  saving.value = true
  error.value = ''
  try {
    const duplicates = await findPotentialDuplicates(draft.value, editorMode.value === 'edit' ? selectedContactId.value ?? undefined : undefined)
    if (duplicates.length) {
      duplicateMessage.value = `Doublon possible détecté : ${duplicates.map((contact) => contact.displayName || contact.phone || contact.email).join(', ')}`
      const keepGoing = window.confirm('Un doublon possible a été détecté. Continuer quand même ?')
      if (!keepGoing) {
        return
      }
    } else {
      duplicateMessage.value = null
    }

    const saved =
      editorMode.value === 'edit' && selectedContactId.value !== null
        ? await updateContact(selectedContactId.value, draft.value)
        : await createContact(draft.value)

    selectedContactId.value = saved.id
    editorMode.value = 'edit'
    draft.value = contactToDraft(saved)
    duplicateMessage.value = null
    await refreshContacts()
    showNotice('Contact enregistré.')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Impossible d’enregistrer le contact.')
  } finally {
    saving.value = false
  }
}

async function removeSelected() {
  if (selectedContactId.value === null) {
    return
  }

  const contact = contacts.value.find((item) => item.id === selectedContactId.value)
  if (!contact) {
    return
  }

  const confirmed = window.confirm(`Supprimer ${contact.displayName || 'ce contact'} ?`)
  if (!confirmed) {
    return
  }

  try {
    await deleteContact(contact.id)
    await refreshContacts()
    startNewContact()
    showNotice('Contact supprimé.')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Impossible de supprimer le contact.')
  }
}

async function exportAll() {
  try {
    const payload = await exportContacts()
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `contacts-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    showNotice('Export JSON généré.')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Impossible d’exporter les contacts.')
  }
}

async function exportAllCsv() {
  try {
    const payload = await exportContactsCsv()
    const blob = new Blob([payload], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    showNotice('Export CSV généré.')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Impossible d’exporter les contacts en CSV.')
  }
}

function closeHamburgerMenu() {
  hamburgerMenu.value?.removeAttribute('open')
}

function handleDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (!target || !hamburgerMenu.value) {
    return
  }

  if (!hamburgerMenu.value.contains(target)) {
    closeHamburgerMenu()
  }
}

function openChangelog() {
  showChangelog.value = true
}

function closeChangelog() {
  showChangelog.value = false
}

function openChangelogAndClose() {
  closeHamburgerMenu()
  openChangelog()
}

function openAbout() {
  showAbout.value = true
}

function closeAbout() {
  showAbout.value = false
}

function openAboutAndClose() {
  closeHamburgerMenu()
  openAbout()
}

function openImportPicker(mode: 'json' | 'csv') {
  importMode.value = mode
  importInput.value?.click()
}

function openImportAndClose(mode: 'json' | 'csv') {
  closeHamburgerMenu()
  openImportPicker(mode)
}

async function exportAndClose(mode: 'json' | 'csv') {
  closeHamburgerMenu()
  if (mode === 'json') {
    await exportAll()
    return
  }

  await exportAllCsv()
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) {
    return
  }

  try {
    const text = await file.text()
    const isCsv = importMode.value === 'csv' || file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
    const result = isCsv ? await importContactsCsv(text) : await importContacts(JSON.parse(text) as unknown)
    await refreshContacts()
    showNotice(`Import terminé : ${result.imported} ajouté(s), ${result.duplicates} doublon(s), ${result.skipped} ignoré(s).`)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Fichier invalide.')
  }
}

const handleOnline = () => {
  online.value = true
}

const handleOffline = () => {
  online.value = false
}

watch(query, () => {
  window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => {
    void refreshContacts()
  }, 180)
})

onMounted(async () => {
  await refreshContacts()
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  document.addEventListener('pointerdown', handleDocumentPointerDown)
})

onUnmounted(() => {
  window.clearTimeout(refreshTimer)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>
