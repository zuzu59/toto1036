# Plan d'exécution pour l'app PWA

## Objectif

Construire un POC de carnet de contacts offline-first avec:

- création de contacts
- recherche locale
- consultation et modification d'un contact
- persistance locale avec Dexie
- installation PWA sur mobile

Ce plan suppose un périmètre volontairement simple et local, sans backend.

## Choix techniques

Stack recommandée:

- Vite
- Vue 3
- TypeScript
- Dexie.js
- `vite-plugin-pwa`

Pourquoi ce choix:

- rapide à mettre en place
- adapté à un POC
- bon support du mode offline
- structure claire pour du CRUD local

## Ordre d'exécution

### 1. Initialiser le projet

But: obtenir une base de travail propre.

Actions:

- créer le projet Vite
- choisir le template Vue 3 + TypeScript
- installer les dépendances principales
- vérifier que l'application démarre en local

Livrable:

- projet initialisé et exécutable

### 2. Ajouter la couche PWA

But: rendre l'application installable et offline-capable.

Actions:

- installer `vite-plugin-pwa`
- configurer le manifest
- activer le service worker
- vérifier le chargement de l'app sans réseau

Livrable:

- app installable
- cache des assets fonctionnel

### 3. Mettre en place Dexie

But: poser la base de données locale.

Actions:

- créer la base Dexie
- définir la table `contacts`
- ajouter les champs nécessaires
- préparer les migrations de schéma

Champs recommandés:

- `id`
- `firstName`
- `lastName`
- `phone`
- `email`
- `notes`
- `searchText`
- `createdAt`
- `updatedAt`

Livrable:

- base locale opérationnelle

### 4. Implémenter le CRUD contact

But: pouvoir créer, lire et modifier les contacts.

Actions:

- créer un service de données
- implémenter `createContact`
- implémenter `getContact`
- implémenter `updateContact`
- préparer `deleteContact` si utile

Livrable:

- un cycle CRUD complet sur la base locale

### 5. Ajouter la recherche locale

But: permettre de retrouver un contact rapidement.

Actions:

- construire un champ `searchText`
- normaliser les données en minuscules
- retirer les accents
- rechercher par filtrage local

Stratégie recommandée pour le POC:

- concaténer prénom, nom, téléphone, email et notes
- stocker la version normalisée dans `searchText`
- filtrer sur ce champ dans l'UI

Livrable:

- recherche fonctionnelle sur les contacts

### 6. Construire l'interface principale

But: exposer les fonctionnalités métier.

Actions:

- créer l'écran de liste
- créer la barre de recherche
- créer le formulaire de création
- créer la page de détail / édition
- gérer l'état vide et les erreurs simples

Livrable:

- interface utilisable de bout en bout

### 7. Tester le mode offline

But: vérifier que l'app reste utilisable sans connexion.

Actions:

- tester le chargement initial
- tester un rechargement hors ligne
- vérifier la persistance des données après fermeture
- valider le comportement sur smartphone

Livrable:

- app usable hors ligne

### 8. Stabiliser

But: sécuriser le POC avant itération.

Actions:

- vérifier les migrations Dexie
- corriger les erreurs de validation
- ajouter des tests de base si le temps le permet
- nettoyer l'architecture si un point est trop couplé

Livrable:

- POC stable et prêt pour extension

## Fichiers à créer en priorité

En fonction de l'architecture choisie, les fichiers principaux devraient couvrir:

- `vite.config.ts`
- `src/main.ts`
- `src/App.vue` ou `src/App.tsx`
- `src/db.ts`
- `src/services/contacts.ts`
- `src/types/contact.ts`
- `src/components/ContactForm.*`
- `src/components/ContactList.*`
- `src/components/SearchBar.*`

## Critères de validation

Le POC est considéré comme réussi si:

- l'app s'ouvre en local
- un contact peut être créé
- un contact peut être retrouvé par recherche
- un contact peut être ouvert et modifié
- les données restent présentes après rechargement
- l'app peut être installée comme PWA
- l'app reste utilisable hors ligne

## Risques et garde-fous

### Risque: surcomplexifier la recherche

Mesure:

- commencer simple avec `searchText`
- éviter un moteur de recherche prématuré

### Risque: trop de couches dès le départ

Mesure:

- garder une séparation simple entre UI, services et données
- éviter d'introduire des abstractions inutiles

### Risque: PWA mal configurée

Mesure:

- vérifier le manifest
- vérifier le service worker
- tester sur un vrai navigateur mobile

## Proposition de séquence de travail

1. Scaffold du projet
2. Configuration PWA
3. Base Dexie
4. CRUD contact
5. Recherche
6. UI
7. Tests offline
8. Ajustements finaux

## Résultat attendu

À la fin de ce plan, on doit avoir une application simple, locale, installable, et utilisable hors ligne pour gérer un carnet de contacts minimal.
