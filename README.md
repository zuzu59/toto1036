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

## Déploiement GitHub Pages

Un workflow GitHub Actions est configuré dans `.github/workflows/deploy-pages.yml`.

Il suffit de pousser sur `master` ou `tutu` pour lancer le déploiement sur GitHub Pages.

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
