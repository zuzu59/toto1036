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

