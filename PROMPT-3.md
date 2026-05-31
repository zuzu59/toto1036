# Prompt directif pour générer l’application

Tu es un assistant de développement expert.

Je veux que tu construises une application **PWA offline-first** de carnet de contacts, avec :

- **Vite**
- **Vue 3**
- **TypeScript**
- **Dexie.js** pour la base locale
- **vite-plugin-pwa** pour le mode hors ligne et l’installation PWA

## Objectif

Créer une application mobile-first permettant :

- de créer un contact
- de consulter un contact
- de modifier un contact
- de supprimer un contact
- de rechercher des contacts localement
- d’exporter / importer les contacts en JSON

## Contraintes

- tout doit fonctionner **sans backend**
- les données doivent rester en **local**
- la recherche doit être **simple et efficace**
- pas de sur-ingénierie
- UI pensée pour smartphone
- app installable comme PWA

## Recherche

Je ne veux pas de moteur full-text complexe.

Fais une recherche locale sur un champ dérivé `searchText` construit à partir de :

- prénom
- nom
- téléphone
- email
- notes

Normalise le texte :

- minuscules
- suppression des accents
- espaces nettoyés

## Modèle de données

Crée une table `contacts` avec au minimum :

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

## Sécurité des données

Ajoute aussi :

- export JSON
- import JSON
- confirmation avant suppression
- détection simple des doublons

## Architecture attendue

Sépare le code en couches claires :

- base de données Dexie
- services métier
- utilitaires de recherche / normalisation
- composants UI
- vues/pages

## Ce que je veux dans ta réponse

1. La commande Linux pour initialiser le projet
2. Les dépendances à installer
3. L’arborescence recommandée
4. Le contenu des fichiers principaux
5. La configuration PWA complète
6. Le schéma Dexie
7. La logique CRUD
8. La logique de recherche
9. Les fonctions export/import

## Style attendu

- code simple
- code lisible
- code prêt à lancer
- explications courtes
- pas d’abstraction inutile

## Priorité

Si tu dois choisir, mets l’accent sur :

1. fiabilité des données
2. fonctionnement offline
3. simplicité de recherche
4. UX mobile
5. facilité d’évolution
