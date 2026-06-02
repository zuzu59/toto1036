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

## Structure

- `src/db.ts` : base Dexie
- `src/services/contacts.ts` : CRUD contacts
- `src/utils/normalize.ts` : recherche normalisée
- `src/components/` : UI
- `vite.config.ts` : configuration PWA
