export interface ReleaseChangelogGroup {
  tag: string
  dateTime: string
  entries: string[]
  releaseUrl?: string
}

export function parseVersionTag(tag: string): number[] {
  return tag
    .replace(/^v/i, '')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0)
}

export function isVersionNewer(remoteTag: string, currentTag: string): boolean {
  const remote = parseVersionTag(remoteTag)
  const current = parseVersionTag(currentTag)
  const length = Math.max(remote.length, current.length)

  for (let index = 0; index < length; index += 1) {
    const remotePart = remote[index] ?? 0
    const currentPart = current[index] ?? 0
    if (remotePart > currentPart) {
      return true
    }
    if (remotePart < currentPart) {
      return false
    }
  }

  return false
}

export function parseChangelogMarkdown(markdown: string): ReleaseChangelogGroup[] {
  const groups: ReleaseChangelogGroup[] = []
  let currentGroup: ReleaseChangelogGroup | null = null

  for (const rawLine of markdown.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = rawLine.trim()
    const headingMatch = line.match(/^##\s+(v[0-9]+(?:\.[0-9]+)*)\s+[—-]\s+(.+)$/i)

    if (headingMatch) {
      currentGroup = {
        tag: headingMatch[1],
        dateTime: headingMatch[2],
        entries: [],
      }
      groups.push(currentGroup)
      continue
    }

    if (!currentGroup) {
      continue
    }

    if (line.startsWith('- ')) {
      currentGroup.entries.push(line.slice(2).trim())
    }
  }

  return groups
}
