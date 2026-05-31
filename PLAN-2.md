# Plan d’exécution révisé pour l’app PWA

## Objectif

Construire un POC de carnet de contacts offline-first, utilisable sur smartphone, avec :

- création de contacts
- consultation / modification
- recherche locale simple
- persistance locale via Dexie
- export / import des données
- installation PWA

## Stack cible

- Vite
- Vue 3
- TypeScript
- Dexie.js
- `vite-plugin-pwa`

## Ordre d’exécution

### 1. Initialiser le projet

Actions :

- créer le projet Vite
- configurer Vue 3 + TypeScript
- vérifier le démarrage local
- poser l’arborescence de base

Livrable :

- application vide mais fonctionnelle

### 2. Mettre en place la base locale

Actions :

- créer la base Dexie
- définir la table `contacts`
- ajouter les champs essentiels
- préparer les migrations

Champs conseillés :

- `id`
- `firstName`
- `lastName`
- `displayName`
- `phone`
- `email`
- `notes`
- `searchText`
- `favorite`
- `archived`
- `createdAt`
- `updatedAt`

Livrable :

- stockage local opérationnel

### 3. Implémenter le CRUD

Actions :

- créer un service contacts
- ajouter `createContact`
- ajouter `getContact`
- ajouter `updateContact`
- ajouter `deleteContact`

Livrable :

- cycle CRUD complet sur la base locale

### 4. Ajouter la normalisation et la recherche

Actions :

- créer une fonction de normalisation texte
- construire `searchText`
- rechercher sur prénom, nom, téléphone, email, notes
- afficher les résultats filtrés

Livrable :

- recherche locale utile sur mobile

### 5. Construire l’interface principale

Actions :

- écran liste
- barre de recherche
- formulaire de création
- écran détail / édition
- gestion des états vides et erreurs simples

Livrable :

- parcours utilisateur complet

### 6. Prévoir la sécurité des données

Actions :

- export JSON
- import JSON
- confirmation avant suppression
- détection simple des doublons

Livrable :

- données locales plus sûres

### 7. Ajouter la couche PWA

Actions :

- installer `vite-plugin-pwa`
- configurer le manifest
- activer le service worker
- définir les icônes nécessaires

Livrable :

- app installable et cacheable

### 8. Tester le mode hors ligne

Actions :

- build de production
- test offline réel
- rechargement hors ligne
- vérification sur smartphone

Livrable :

- application utilisable sans réseau

### 9. Stabiliser

Actions :

- corriger les cas limites
- vérifier les migrations
- nettoyer le code
- ajouter des validations simples

Livrable :

- POC stable et exploitable

## Fichiers à prévoir

- `vite.config.ts`
- `src/main.ts`
- `src/App.vue`
- `src/db.ts`
- `src/services/contacts.ts`
- `src/utils/search.ts`
- `src/utils/normalize.ts`
- `src/types/contact.ts`
- `src/components/ContactForm.vue`
- `src/components/ContactList.vue`
- `src/components/SearchBar.vue`
- `src/components/ImportExport.vue`

## Critères de validation

Le POC est validé si :

- un contact peut être créé
- un contact peut être modifié
- la recherche fonctionne
- les données survivent au rechargement
- l’export/import fonctionne
- l’app s’installe comme PWA
- l’app reste utilisable hors ligne

## Priorité de réalisation

1. Données
2. CRUD
3. Recherche
4. Sauvegarde des données
5. PWA
6. UX mobile
7. Stabilisation

## Résultat attendu

Une application simple, locale, installable, offline-first, et suffisamment robuste pour servir de base à des évolutions futures.
