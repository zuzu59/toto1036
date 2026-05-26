# Analyse de cadrage pour l'app PWA

## Contexte

Le dépôt décrit un POC de PWA destinée à fonctionner sur smartphone, y compris hors ligne.
Le besoin exprimé dans `PROMPT.md` est de construire une application de type carnet de contacts avec:

- création de nouveaux contacts
- recherche de contacts en full text
- consultation d'un contact avec possibilité de modification

Le socle technique visé est:

- Vite
- Vue.js 3 ou React
- Dexie.js pour la base locale
- `vite-plugin-pwa` pour configurer le service worker et l'usage hors ligne

L'objectif initial est donc une application locale, installable et utilisable sans backend.

## Lecture fonctionnelle

Le besoin métier est simple, mais il contient trois contraintes importantes:

1. Les données doivent être persistées localement.
2. La recherche doit être rapide et exploitable sur mobile.
3. L'application doit rester utilisable hors connexion.

Cela signifie qu'il faut prioriser la qualité du modèle de données et la robustesse du stockage local avant de travailler l'interface.

## Analyse technique

### 1. Choix du framework

Vite est un très bon point de départ pour un POC car il donne une base légère et rapide à itérer.

Entre Vue 3 et React:

- Vue 3 est souvent plus direct pour construire rapidement une interface CRUD simple.
- React reste très viable si l'équipe est déjà plus à l'aise avec son écosystème.

Pour un POC orienté vitesse d'exécution, Vue 3 est le choix le plus pragmatique.

### 2. Base locale avec Dexie

Dexie est un bon choix pour encapsuler IndexedDB sans subir la complexité de l'API native.
Pour ce type d'application, il permet de:

- stocker les contacts localement
- faire des opérations CRUD propres
- préparer des migrations de schéma
- garder l'application totalement offline-first

Le point d'attention principal est la recherche.
Dexie aide beaucoup pour le stockage et les requêtes, mais le vrai full-text search n'est pas natif au sens d'un moteur dédié.

### 3. Recherche full text

Le terme "full text" mérite d'être clarifié.
Pour un carnet de contacts, il y a trois options:

#### Option simple

Construire un champ dérivé `searchText` qui concatène les données utiles:

- prénom
- nom
- téléphone
- email
- notes

Puis normaliser le texte:

- minuscules
- suppression des accents
- espaces harmonisés

Cette approche est suffisante pour un POC et très simple à maintenir.

#### Option intermédiaire

Créer un index inversé par mot-clé pour accélérer la recherche.

Cela devient utile si:

- le volume de contacts augmente
- la recherche doit être très réactive
- les notes deviennent longues

#### Option avancée

Utiliser un moteur de recherche dédié ou une stratégie plus élaborée.

Ce n'est pas nécessaire au stade du POC, sauf si le besoin de recherche devient central.

Conclusion: pour ce projet, la meilleure stratégie est de démarrer avec un champ `searchText` normalisé, puis d'évoluer ensuite si nécessaire.

### 4. PWA et offline

Le plugin officiel à utiliser est `vite-plugin-pwa`.
Son rôle est de:

- générer le manifest
- configurer le service worker
- permettre l'installation sur mobile
- activer le cache des assets applicatifs

Pour cette app, l'essentiel est:

- que l'interface charge hors ligne
- que les données locales restent disponibles
- que l'application puisse être ajoutée à l'écran d'accueil

Il faut éviter de complexifier le service worker au début.
Un mode standard avec génération automatique suffit pour le POC.

## Modèle de données recommandé

Une table `contacts` est suffisante pour commencer.

Champs conseillés:

- `id`
- `firstName`
- `lastName`
- `phone`
- `email`
- `notes`
- `searchText`
- `createdAt`
- `updatedAt`

Le champ `searchText` peut être recalculé à chaque création ou modification.

Cela simplifie énormément la recherche et évite de multiplier les index complexes au départ.

## Architecture cible

Une architecture simple est préférable:

- une couche de persistance Dexie
- une couche de services métier
- une couche UI
- une couche PWA

Cette séparation permet de:

- tester plus facilement la logique
- faire évoluer la recherche sans toucher toute l'UI
- éviter d'écrire de la logique de base de données directement dans les composants

## Plan d'exécution recommandé

### Phase 1 - Initialisation

Objectif: créer le projet et valider le socle.

Livrables:

- projet Vite initialisé
- framework choisi
- TypeScript configuré
- Dexie installé
- `vite-plugin-pwa` installé et branché

### Phase 2 - Modèle local

Objectif: définir la structure de données et les opérations de base.

Livrables:

- schéma Dexie
- création de contact
- lecture d'un contact
- mise à jour d'un contact
- suppression si nécessaire

### Phase 3 - Recherche

Objectif: obtenir une recherche utile et rapide.

Livrables:

- normalisation du texte
- recherche sur `searchText`
- filtrage des résultats
- gestion des cas sans résultat

### Phase 4 - Interface

Objectif: offrir le flux principal de l'application.

Livrables:

- écran liste
- barre de recherche
- écran de création
- écran de détail/édition
- validation simple des champs

### Phase 5 - Offline-first

Objectif: garantir l'usage mobile hors connexion.

Livrables:

- installation PWA
- cache des assets
- vérification du fonctionnement sans réseau
- comportement correct au rechargement

### Phase 6 - Stabilisation

Objectif: fiabiliser le POC.

Livrables:

- migrations propres
- tests de base
- traitement des erreurs
- vérification mobile réelle

## Risques principaux

### 1. Ambiguïté sur le "full text"

Le besoin peut être interprété de manière trop ambitieuse.
Pour éviter de perdre du temps, il faut considérer le full text comme une recherche locale sur un texte normalisé pour le POC.

### 2. Sur-architecture

Le projet est petit au départ.
Il faut éviter:

- une architecture trop abstraite
- trop de couches prématurées
- des choix techniques lourds

### 3. Recherche et performance

Si le nombre de contacts augmente beaucoup, un simple `filter` sur une collection locale peut devenir moins confortable.

Ce risque est acceptable pour un POC, mais il faut garder en tête qu'une évolution de l'indexation pourrait être nécessaire plus tard.

### 4. Offline incomplet

Une PWA n'est pas automatiquement offline-ready.
Il faut vérifier:

- les assets
- le manifest
- le comportement du service worker
- l'expérience de premier chargement

## Recommandation finale

Pour ce POC, le meilleur compromis est:

- Vue 3
- TypeScript
- Dexie
- `vite-plugin-pwa`
- recherche locale via `searchText` normalisé

Cela donne une base:

- simple
- rapide à développer
- adaptée au mobile
- utilisable hors ligne

L'ordre de priorité doit rester:

1. socle technique
2. modèle de données
3. recherche
4. UI
5. offline
6. stabilisation

## Conclusion

Le projet est bien adapté à une approche offline-first légère.
Le vrai sujet n'est pas la complexité de l'interface, mais la discipline sur le stockage local, la recherche et la préparation PWA.

Si le POC est bien cadré dès le départ, l'application pourra ensuite évoluer vers:

- synchronisation multi-appareil
- vraie recherche avancée
- partage de contacts
- enrichissement du modèle de données

Pour le moment, il faut rester sur un périmètre strictement local et maîtrisé.
