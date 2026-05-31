## Conditions de développement

Je veux que tu crées une application PWA offline-first avec Vite, Vue.js 3 et TypeScript.

La base de données locale doit être gérée avec Dexie.js. Le projet doit utiliser `vite-plugin-pwa` pour configurer automatiquement le Service Worker, le manifest et le fonctionnement hors ligne.

Je veux que tu me donnes :

- la commande Linux pour initialiser le projet
- la structure des dossiers recommandée
- le code des fichiers principaux
- une implémentation simple, propre et évolutive

## Objectif du POC

Créer un carnet de contacts local, installable sur smartphone, qui fonctionne même sans connexion internet.

## Fonctionnalités attendues

### Fonctionnalités principales

- création de nouveaux contacts
- consultation d’un contact
- modification d’un contact
- suppression d’un contact
- recherche locale rapide de contacts

### Recherche

La recherche doit être pragmatique pour un POC :

- recherche sur prénom
- nom
- téléphone
- email
- notes
- normalisation du texte en minuscules
- suppression des accents

Je ne veux pas un moteur full-text complexe si ce n’est pas nécessaire.

### Sécurité et robustesse des données

Je veux aussi prévoir dès le départ :

- export des contacts en JSON
- import des contacts depuis JSON
- confirmation avant suppression
- détection simple des doublons
- persistance locale fiable

## Contraintes techniques

- utiliser Vite
- utiliser Vue 3
- utiliser TypeScript
- utiliser Dexie.js
- utiliser `vite-plugin-pwa`
- architecture simple, sans sur-ingénierie
- application pensée mobile-first
- fonctionnement hors ligne obligatoire

## Modèle de données recommandé

Je veux une table `contacts` avec au minimum :

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

## Attentes sur l’architecture

Je veux une séparation claire entre :

- la base Dexie
- les services métier
- les utilitaires de normalisation/recherche
- les composants UI
- les vues/pages

## Ce que je veux dans ta réponse

1. la commande d’initialisation Linux
2. les dépendances à installer
3. l’arborescence cible
4. les fichiers principaux avec leur contenu
5. une configuration PWA correcte
6. une base locale Dexie fonctionnelle
7. une recherche simple et efficace
8. les fonctions d’export/import

## Remarques

Le projet est un POC, donc je veux une solution :

- simple
- fiable
- lisible
- facile à faire évoluer

Ne complexifie pas inutilement la recherche ou l’architecture.
