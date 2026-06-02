# Analyse approfondie du projet z-PWA

## 1. Lecture du dépôt

Le dépôt est aujourd’hui très léger :

- `README.md` : décrit le projet comme un POC de PWA offline sur smartphone.
- `PROMPT.md` : contient le besoin fonctionnel et la stack souhaitée.
- `.gitignore` : standard pour un projet front/Vite.
- `LICENSE` : MIT.

Aucun code applicatif n’est encore présent dans la branche courante. Cela signifie que le projet est encore au stade de cadrage, pas de réalisation.

## 2. Intention du projet

Le but n’est pas seulement de faire une application de contacts. Le vrai sujet est de valider une méthode de travail avec un agent IA pour construire un POC mobile offline-first.

Le projet sert donc à tester 3 choses :

1. la compréhension du besoin par l’agent,
2. la capacité à transformer un prompt minimal en application utile,
3. la viabilité d’une PWA locale sur smartphone sans backend.

## 3. Besoin métier réel

Le besoin fonctionnel est simple : un carnet de contacts local avec :

- création de contact,
- recherche full text,
- consultation,
- modification.

Derrière cette simplicité, il y a des contraintes importantes :

- la donnée doit rester disponible hors ligne,
- la recherche doit rester fluide sur mobile,
- l’interface doit être rapide et simple,
- la persistance doit survivre aux rechargements et aux fermetures d’application.

## 4. Analyse produit

### Ce que le produit doit prouver

Ce POC doit démontrer qu’une application mobile légère peut :

- s’installer comme une PWA,
- fonctionner sans réseau,
- stocker ses données localement,
- proposer une UX simple pour un usage quotidien.

### Ce que le produit ne doit pas faire tout de suite

Il ne faut pas chercher immédiatement :

- la synchronisation multi-appareil,
- les comptes utilisateurs,
- le partage de contacts,
- un moteur de recherche avancé,
- une architecture trop modulaire pour un petit périmètre.

## 5. Analyse technique

### Frontend

Le choix Vite est cohérent :

- démarrage rapide,
- configuration légère,
- bon fit pour un POC.

Vue 3 est probablement le meilleur choix si l’objectif est d’aller vite sur une interface CRUD simple. React resterait possible, mais n’apporte pas d’avantage décisif ici.

### Stockage local

Dexie.js est adapté à ce besoin :

- abstraction simple d’IndexedDB,
- CRUD propre,
- migrations gérables,
- persistance locale robuste.

### Offline / PWA

`vite-plugin-pwa` est le bon point d’entrée pour :

- le manifest,
- le service worker,
- l’installation sur mobile,
- le cache applicatif.

Le piège principal est de croire que “PWA” signifie “offline” automatiquement. En réalité, il faut vérifier :

- le caching des assets,
- le comportement au reload hors connexion,
- la persistance des données,
- l’expérience d’installation.

## 6. Modèle de données recommandé

Pour un carnet de contacts, le modèle minimal doit rester lisible :

- `id`
- `firstName`
- `lastName`
- `phone`
- `email`
- `notes`
- `searchText`
- `createdAt`
- `updatedAt`

### Point clé : `searchText`

Pour un POC, le “full text” doit être interprété comme une recherche locale normalisée, pas comme un moteur de recherche dédié.

La stratégie la plus pragmatique est :

- concaténer les champs utiles,
- normaliser en minuscules,
- retirer les accents,
- stocker le résultat dans `searchText`.

Cela donne une recherche simple, rapide et suffisante au stade actuel.

## 7. Architecture cible

L’architecture doit rester minimale :

- **UI** : composants et pages,
- **data** : Dexie / repository,
- **domain** : logique de normalisation et règles métier simples,
- **pwa** : configuration d’installation et cache.

La séparation est utile, mais il faut éviter de créer trop de couches artificielles.

### Bonne discipline

- composants UI sans logique de base de données directe,
- service de contacts pour encapsuler les opérations CRUD,
- helper de normalisation centralisé,
- schéma DB clair et stable.

## 8. Parcours utilisateur attendu

Le flux principal doit être :

1. ouvrir l’app,
2. voir la liste des contacts,
3. rechercher un contact,
4. ouvrir la fiche,
5. modifier/enregistrer,
6. créer un nouveau contact,
7. retrouver les données après rechargement.

Si ce flux est fluide, le POC remplit son rôle.

## 9. Contraintes mobiles

Le projet vise le smartphone, donc les contraintes ergonomiques sont fortes :

- écran petit,
- interaction tactile,
- saisie parfois lente,
- besoin d’actions courtes et évidentes.

Conséquences :

- formulaires simples,
- boutons visibles,
- navigation peu profonde,
- recherche accessible rapidement,
- feedback clair après sauvegarde.

## 10. Risques principaux

### Risque 1 : confusion sur “full text”

Le terme peut pousser vers une solution trop lourde. Pour ce projet, il faut rester sur une recherche locale normalisée.

### Risque 2 : sur-ingénierie

Le dépôt est encore vide ; il serait inutile de construire une architecture complexe avant d’avoir un flux utilisateur valide.

### Risque 3 : offline partiel

Une app peut sembler fonctionner alors qu’elle ne garde pas bien les assets ou les données. Il faut tester le mode hors ligne réel, pas seulement le mode développement.

### Risque 4 : UX trop ambitieuse

Sur mobile, une UI riche mais lente serait contre-productive. Le meilleur choix est une interface très simple.

## 11. Ce que le dépôt raconte déjà

Le projet montre une volonté de :

- travailler par branches,
- documenter le cadrage,
- séparer les étapes,
- garder une trace des analyses et des plans.

C’est une bonne base pour un POC mené par itérations.

## 12. État de maturité actuel

Maturité actuelle : **phase de cadrage**.

Le projet n’est pas encore en phase de développement fonctionnel. Il manque :

- l’initialisation du code source,
- la structure applicative,
- la base locale,
- la configuration PWA,
- l’interface de contacts.

## 13. Recommandation de stratégie

La meilleure stratégie est :

1. créer le squelette du projet,
2. configurer la PWA,
3. mettre en place Dexie,
4. implémenter le CRUD,
5. ajouter la recherche normalisée,
6. valider le offline sur mobile,
7. seulement ensuite enrichir.

## 14. Conclusion

Le projet est bien cadré pour un POC offline-first simple.

Le point essentiel n’est pas de multiplier les fonctionnalités, mais de valider une base solide :

- données locales fiables,
- recherche utile,
- installation PWA,
- usage hors ligne,
- UX mobile minimale mais efficace.

Si ce socle est réussi, le projet pourra ensuite évoluer vers une vraie application de gestion de contacts.
