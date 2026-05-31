export const APP_RELEASE = 'v0.0.9'
export const APP_BUILD_TIME = __APP_BUILD_TIME__

export const APP_CHANGELOG = [
  {
    tag: 'v0.0.9',
    dateTime: '31/05/2026 15:05',
    entries: [
      'Changelog accessible depuis le hamburger',
      'Affichage en modal pour mieux tenir sur mobile',
      'Actions secondaires toujours conservées dans le menu',
    ],
    releaseUrl: 'https://github.com/zuzu59/z-PWA/releases/tag/v0.0.9',
  },
  {
    tag: 'v0.0.8',
    dateTime: '31/05/2026 15:03',
    entries: [
      'Actions secondaires déplacées dans un hamburger',
      'Interface plus lisible sur petit écran',
      'Menu secondaire fermé après action',
    ],
    releaseUrl: 'https://github.com/zuzu59/z-PWA/releases/tag/v0.0.8',
  },
  {
    tag: 'v0.0.7',
    dateTime: '31/05/2026 14:58',
    entries: [
      'Le changelog affiche maintenant le tag puis la date/heure',
      'Lien direct vers les releases GitHub',
      'Changelog maintenu par date/heure',
    ],
    releaseUrl: 'https://github.com/zuzu59/z-PWA/releases/tag/v0.0.7',
  },
  {
    tag: 'v0.0.6',
    dateTime: '31/05/2026 15:40',
    entries: [
      'Changelog replié par défaut dans l’app',
      'Changelog disponible aussi sur GitHub Releases',
      'Ajout de l’import/export CSV',
    ],
    releaseUrl: 'https://github.com/zuzu59/z-PWA/releases/tag/v0.0.6',
  },
  {
    tag: 'v0.0.5',
    dateTime: '31/05/2026 15:18',
    entries: [
      'Ajout d’un changelog dans l’app',
      'Version affichée avec date/heure de build',
      'Amélioration de la stabilité de la recherche',
    ],
    releaseUrl: 'https://github.com/zuzu59/z-PWA/releases/tag/v0.0.5',
  },
  {
    tag: 'v0.0.4',
    dateTime: '31/05/2026 14:55',
    entries: ['Passage à une version visible dans l’app'],
    releaseUrl: 'https://github.com/zuzu59/z-PWA/releases/tag/v0.0.4',
  },
  {
    tag: 'v0.0.3',
    dateTime: '31/05/2026 14:30',
    entries: ['Première version PWA du carnet de contacts'],
    releaseUrl: 'https://github.com/zuzu59/z-PWA/releases/tag/v0.0.3',
  },
] as const
