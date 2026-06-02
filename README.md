# z-PWA

POC de carnet de contacts offline-first pour smartphone.

## Stack

- Vite
- Vue 3
- TypeScript
- Dexie.js
- vite-plugin-pwa

## Fonctionnalités

- création de contacts
- recherche locale
- consultation et modification
- persistance locale via IndexedDB
- installation PWA
- usage hors ligne

## Lancer le projet

```bash
npm install
npm run dev
```

## Vérifier le build

```bash
npm run build
```

## Versioning

La version affichée dans l'application provient de `package.json` et doit rester synchronisée avec un tag Git correspondant au format `v0.0.1`.

À chaque release, il faut incrémenter la version, créer le tag Git associé, puis relancer le build.

## Déploiement GitHub Pages

Le projet est prévu pour le mode **Deploy from a branch**.

Configuration recommandée dans GitHub Pages :

- Source : `Deploy from a branch`
- Branch : `tutu`
- Folder : `/docs`

Le build Vite génère maintenant le site dans `docs/`.

Le site est prévu pour être servi sous le chemin :

```bash
/toto1036/
```

## Structure

- `src/db.ts` : base Dexie
- `src/services/contacts.ts` : CRUD contacts
- `src/utils/normalize.ts` : recherche normalisée
- `src/components/` : UI
- `vite.config.ts` : configuration PWA
