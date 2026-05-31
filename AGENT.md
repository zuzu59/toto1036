# AGENT.md

Ce fichier décrit la procédure à suivre pour mettre à jour et publier l’application.

## Objectif

Quand une modification est apportée à l’app, il faut :

1. incrémenter la version
2. mettre à jour le changelog
3. vérifier le build
4. committer
5. pousser sur GitHub
6. créer le tag de release
7. laisser GitHub Actions publier sur GitHub Pages et créer la release

## Règles de version

- La version vit dans `src/version.ts` via `APP_RELEASE`.
- Le changelog vit dans `CHANGELOG.md` uniquement pour la release GitHub.
- L’app n’embarque pas le changelog : elle affiche seulement la version et la date/heure de build.
- About affiche le nom de l’auteur, la version, et un état de mise à jour en ligne si une release plus récente existe.
- Le bouton “Changelog GitHub” pointe toujours vers la page GitHub Releases (`https://github.com/zuzu59/z-PWA/releases`).
- Chaque changement publié doit augmenter la version (`v0.1.0` → `v0.1.1`, etc.).

## Procédure de mise à jour

### 1) Modifier l’app

Faire les changements nécessaires dans le code.

### 2) Incrémenter la version

Mettre à jour `src/version.ts` :

- `APP_RELEASE` = nouvelle version
- conserver `APP_BUILD_TIME`

Mettre aussi à jour `CHANGELOG.md` avec le détail de la release.

### 3) Mettre à jour le changelog externe

Mettre à jour `CHANGELOG.md` avec le même contenu.

Format attendu :

- `## vX.Y.Z — dd/mm/yyyy hh:mm`
- puis 2–3 puces courtes

### 4) Vérifier l’UI de publication

Si besoin, vérifier que les écrans suivants restent cohérents :

- hamburger
- About
- Help
- formulaire de contact
- lien vers le changelog GitHub

### 5) Vérifier le build

Lancer :

```bash
npm run build
```

Le build doit réussir avant publication.

### 6) Commit

Créer un commit en français, court et explicite.

Exemples :

- `feat: ajoute un menu help dans le hamburger`
- `fix: aligne le hamburger à droite sur mobile`
- `docs: ajoute le changelog GitHub`

### 7) Push

Pousser la branche courante :

```bash
git push
```

### 8) Tag de release

Créer un tag GitHub correspondant à `APP_RELEASE` :

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

## Publication GitHub Pages

La publication est automatisée par GitHub Actions.

- Le workflow Pages est déclenché sur la branche `pi-v1`.
- Le build produit le dossier `dist/`.
- Le déploiement publie `dist/` sur la branche `gh-pages`.

Après un push sur `pi-v1`, vérifier dans GitHub :

- Actions : workflow OK
- Pages : déploiement OK
- Release : tag présent

## Release GitHub

Une release GitHub est créée à partir du tag.

- Le body de la release utilise `CHANGELOG.md`.
- La release doit contenir le bon tag.
- Le changelog est consulté sur GitHub, pas dans l’app.

## Contrôles avant publication

- `npm run build` OK
- version incrémentée
- `CHANGELOG.md` mis à jour
- `src/version.ts` mis à jour
- tag créé
- push effectué

## Conventions

- Garder l’interface mobile-first.
- Garder les actions secondaires dans le hamburger.
- Ne pas réintroduire de boutons inutiles dans la vue principale.
- Préférer des changements petits et publiables.
