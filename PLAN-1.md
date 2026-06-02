# Plan de réalisation détaillé — z-PWA

## 1. Objectif

Réaliser un POC de carnet de contacts PWA, utilisable sur smartphone, avec stockage local, recherche rapide et fonctionnement hors ligne.

## 2. Périmètre

### Inclus

- création de contacts
- consultation d’un contact
- modification d’un contact
- recherche locale full text simplifiée
- persistance locale via Dexie/IndexedDB
- installation en PWA
- utilisation hors ligne

### Exclu pour ce POC

- authentification
- synchronisation cloud
- multi-utilisateur
- import/export avancé
- suppression massive
- moteur de recherche spécialisé
- backend API

## 3. Choix techniques

- **Vite** : démarrage rapide et simple
- **Vue 3** : interface CRUD légère et efficace
- **TypeScript** : sécurité minimale sur les modèles
- **Dexie.js** : accès propre à IndexedDB
- **vite-plugin-pwa** : configuration PWA et cache offline

## 4. Architecture cible

### Couches

1. **Présentation**
   - pages Vue
   - composants UI
   - formulaires
   - navigation simple

2. **Données**
   - base Dexie
   - services contacts
   - CRUD

3. **Métier**
   - normalisation texte
   - génération `searchText`
   - validation simple

4. **PWA**
   - manifest
   - service worker
   - cache des assets

## 5. Modèle de données

### Table `contacts`

Champs recommandés :

- `id`
- `firstName`
- `lastName`
- `phone`
- `email`
- `notes`
- `searchText`
- `createdAt`
- `updatedAt`

### Règles

- `searchText` est recalculé à chaque création/modification
- la recherche se fait sur la version normalisée
- les champs vides sont autorisés sauf contrainte métier éventuelle

## 6. Découpage des étapes

## Étape 1 — Initialisation du projet

### Objectif
Créer la base technique du projet.

### Actions

- initialiser le projet Vite
- choisir Vue 3 + TypeScript
- installer les dépendances principales
- vérifier le démarrage local
- nettoyer les fichiers d’exemple inutiles

### Livrables

- projet exécutable
- arborescence propre
- base prête pour développement

### Critère de succès

- la commande de dev lance l’application sans erreur

---

## Étape 2 — Mise en place de la PWA

### Objectif
Rendre l’application installable et cacheable.

### Actions

- installer `vite-plugin-pwa`
- configurer le manifest
- définir le nom, l’icône, la couleur thème
- activer le service worker
- valider le comportement offline des assets

### Livrables

- app installable
- manifest présent
- service worker actif

### Critère de succès

- l’application charge hors ligne après premier accès

---

## Étape 3 — Base locale Dexie

### Objectif
Mettre en place le stockage local.

### Actions

- créer `db.ts`
- définir la table `contacts`
- prévoir la version de schéma
- exposer les opérations de base

### Livrables

- base IndexedDB fonctionnelle
- schéma stable
- accès centralisé aux données

### Critère de succès

- un contact peut être écrit et relu localement

---

## Étape 4 — Services métier contacts

### Objectif
Encapsuler la logique CRUD.

### Actions

- créer un service `contacts`
- implémenter `listContacts`
- implémenter `getContact`
- implémenter `createContact`
- implémenter `updateContact`
- prévoir `deleteContact` si nécessaire

### Livrables

- API locale claire
- logique métier séparée de l’UI

### Critère de succès

- les opérations CRUD fonctionnent sans connaissance de Dexie dans les composants

---

## Étape 5 — Normalisation et recherche

### Objectif
Obtenir une recherche utile sur mobile.

### Actions

- créer une fonction de normalisation
- retirer les accents
- passer en minuscules
- concaténer les champs utiles dans `searchText`
- filtrer les contacts selon la requête

### Stratégie de POC

- recherche simple sur `searchText`
- pas d’indexation complexe
- pas de moteur externe

### Livrables

- recherche locale rapide
- résultats cohérents

### Critère de succès

- un contact est retrouvable avec prénom, nom, téléphone, email ou note

---

## Étape 6 — Interface liste + recherche

### Objectif
Afficher et filtrer les contacts.

### Actions

- créer l’écran principal
- afficher la liste
- ajouter une barre de recherche
- gérer l’état vide
- afficher un retour visuel quand aucun résultat ne correspond

### Livrables

- écran liste utilisable
- recherche intégrée

### Critère de succès

- l’utilisateur trouve un contact en quelques secondes

---

## Étape 7 — Formulaire de création

### Objectif
Créer un contact depuis l’interface.

### Actions

- créer un formulaire simple
- valider les champs essentiels
- appeler le service de création
- rediriger ou rafraîchir la liste après sauvegarde

### Livrables

- écran de création fonctionnel
- contact enregistré en base locale

### Critère de succès

- un contact créé apparaît immédiatement dans la liste

---

## Étape 8 — Détail et modification

### Objectif
Consulter un contact puis le modifier.

### Actions

- créer la vue détail
- préremplir le formulaire
- modifier les champs
- sauvegarder les changements
- mettre à jour `updatedAt` et `searchText`

### Livrables

- fiche contact editable

### Critère de succès

- une modification est persistée et visible après rechargement

---

## Étape 9 — Expérience mobile

### Objectif
Optimiser l’usage sur smartphone.

### Actions

- vérifier le rendu responsive
- simplifier les espaces et boutons
- limiter la profondeur de navigation
- valider la lisibilité et la saisie tactile

### Livrables

- interface mobile confortable

### Critère de succès

- l’app est utilisable au doigt sans friction majeure

---

## Étape 10 — Validation offline réelle

### Objectif
Tester le vrai comportement hors ligne.

### Actions

- tester après premier chargement
- couper le réseau
- recharger l’app
- vérifier l’accès aux données déjà stockées
- vérifier l’ajout/modification locale

### Livrables

- validation offline documentée

### Critère de succès

- l’app reste fonctionnelle sans connexion

---

## Étape 11 — Stabilisation

### Objectif
Nettoyer et fiabiliser le POC.

### Actions

- corriger les erreurs de validation
- vérifier les migrations Dexie
- retirer le code mort
- uniformiser les composants
- ajouter des contrôles simples d’erreur

### Livrables

- POC stable
- base saine pour itérations futures

### Critère de succès

- aucune régression bloquante sur le flux principal

## 7. Ordre de réalisation recommandé

1. initialiser le projet
2. configurer la PWA
3. mettre en place Dexie
4. créer le service contacts
5. implémenter la normalisation et la recherche
6. construire la liste
7. construire le formulaire de création
8. construire la fiche détail/édition
9. tester le responsive
10. valider offline
11. stabiliser

## 8. Fichiers principaux attendus

- `vite.config.ts`
- `src/main.ts`
- `src/App.vue`
- `src/db.ts`
- `src/services/contacts.ts`
- `src/utils/normalize.ts`
- `src/types/contact.ts`
- `src/components/SearchBar.vue`
- `src/components/ContactForm.vue`
- `src/components/ContactList.vue`
- `src/views/ContactDetail.vue`

## 9. Critères de validation finale

Le projet est validé si :

- l’app démarre correctement en local
- un contact peut être créé
- un contact peut être retrouvé par recherche
- un contact peut être modifié
- les données persistent au rechargement
- l’app est installable comme PWA
- l’app fonctionne hors ligne
- l’interface reste simple sur smartphone

## 10. Risques et parades

### Risque : surcharge fonctionnelle

**Parade** : rester sur un carnet de contacts minimal.

### Risque : recherche trop ambitieuse

**Parade** : utiliser `searchText` normalisé.

### Risque : PWA incomplète

**Parade** : tester le offline réel et l’installation.

### Risque : architecture trop complexe

**Parade** : garder trois blocs simples : UI, services, stockage.

## 11. Résultat attendu

À l’issue du plan, le dépôt doit contenir une application locale, installable, hors ligne, capable de gérer un carnet de contacts simple avec recherche et édition.
