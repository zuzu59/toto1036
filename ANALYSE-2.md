# Analyse révisée du projet PWA

## Contexte

Le dépôt décrit un POC d’application PWA pour smartphone, utilisable hors ligne, orientée carnet de contacts.

Le besoin fonctionnel reste simple :

- créer un contact
- rechercher un contact localement
- consulter et modifier un contact

Le point clé n’est pas l’interface, mais la fiabilité du stockage local et la qualité de la recherche.

## Ce qui mérite d’être amélioré par rapport à la première analyse

### 1. La donnée locale doit être considérée comme critique

Sur une application offline-first, les risques principaux sont :

- perte des données du navigateur
- suppression involontaire
- changement d’appareil
- impossibilité de restaurer le carnet de contacts

Conclusion : il faut prévoir dès le départ un mécanisme simple de sauvegarde/restore.

### 2. Le “full text” doit rester pragmatique

Pour un carnet de contacts, un vrai moteur de recherche full-text est probablement excessif.

Le bon compromis pour le POC :

- créer un champ `searchText`
- concaténer prénom, nom, téléphone, email, notes
- normaliser en minuscules
- supprimer les accents
- filtrer localement

C’est suffisant pour une bonne UX mobile.

### 3. Le modèle de données doit anticiper l’usage réel

Le schéma minimal proposé précédemment est bon, mais peut être enrichi avec :

- `displayName` ou clé de tri
- `favorite`
- `archived`
- `createdAt`
- `updatedAt`
- `searchText`

Cela permet de préparer des améliorations futures sans complexifier l’UI.

### 4. La PWA doit être validée en production

Une PWA ne doit pas être validée uniquement en mode développement.

Il faut tester :

- build de production
- installation sur mobile
- rechargement hors ligne
- cache des assets
- persistance des données au rechargement

### 5. L’UX mobile doit être pensée dès maintenant

L’application cible un smartphone, donc il faut prévoir :

- gros éléments cliquables
- formulaire simple
- clavier adapté (`tel`, `email`)
- barre de recherche accessible
- état vide clair

### 6. Les doublons sont un vrai sujet métier

Sur des contacts, les doublons apparaissent vite.

Même en POC, il est utile de prévoir :

- détection simple par téléphone/email
- avertissement avant création en doublon
- éventuellement fusion plus tard

## Analyse technique

### Stack recommandée

Je garde la même base :

- Vite
- Vue 3
- TypeScript
- Dexie
- `vite-plugin-pwa`

### Architecture recommandée

Une séparation simple suffit :

- `db/` : schéma Dexie
- `services/` : logique métier et CRUD
- `utils/` : normalisation et recherche
- `components/` : UI réutilisable
- `views/` : liste, détail, édition

### Recherche

Stratégie retenue :

- recherche locale
- champ dérivé `searchText`
- filtrage direct

Évolution possible plus tard : indexation par tokens ou moteur plus avancé.

## Priorités révisées

1. Socle technique
2. Modèle de données local
3. CRUD
4. Recherche simple et robuste
5. Sauvegarde / export / import
6. PWA offline
7. Stabilisation mobile

## Risques principaux

### Risque 1 : perte de données

Mesure : export/import JSON + confirmation avant suppression.

### Risque 2 : recherche sur-ingeniérie

Mesure : rester sur `searchText` normalisé.

### Risque 3 : PWA non fiable hors ligne

Mesure : tester le build de prod, pas seulement le dev server.

### Risque 4 : UX mobile négligée

Mesure : design mobile-first avec formulaires simples et lisibles.

## Recommandation finale

Pour ce projet, le meilleur compromis reste :

- offline-first
- stockage local via Dexie
- recherche simple normalisée
- sauvegarde/export dès le POC
- UI mobile-first

Le vrai gain de cette version n’est pas d’ajouter de la complexité, mais de sécuriser l’usage réel.
