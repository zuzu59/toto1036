export const APP_RELEASE = 'v0.0.4'
export const APP_BUILD_TIME = __APP_BUILD_TIME__

export const APP_CHANGELOG = [
  {
    dateTime: '31/05/2026 15:40',
    entries: [
      'Changelog replié par défaut dans l’app',
      'Changelog disponible aussi sur GitHub Releases',
      'Ajout de l’import/export CSV',
    ],
  },
  {
    dateTime: '31/05/2026 15:18',
    entries: [
      'Ajout d’un changelog dans l’app',
      'Version affichée avec date/heure de build',
      'Amélioration de la stabilité de la recherche',
    ],
  },
  {
    dateTime: '31/05/2026 14:55',
    entries: ['Passage à une version visible dans l’app'],
  },
  {
    dateTime: '31/05/2026 14:30',
    entries: ['Première version PWA du carnet de contacts'],
  },
] as const
