const DRIVE_HOST = 'https://drive.google.com'

export function extractDriveFileId(input?: string | null): string | null {
  if (!input)
    return null
  const url = String(input).trim()
  if (!url)
    return null

  const m1 = url.match(/\/d\/([\w-]{10,})\b/)
  if (m1?.[1])
    return m1[1]

  const m2 = url.match(/[?&]id=([\w-]{10,})\b/)
  if (m2?.[1])
    return m2[1]

  return null
}

export function driveThumbnailUrlById(id: string, width = 1000): string {
  const w = Math.max(1, width | 0)
  return `${DRIVE_HOST}/thumbnail?id=${encodeURIComponent(id)}&sz=w${w}`
}

export function driveIframeUrlById(id: string): string {
  return `${DRIVE_HOST}/file/d/${encodeURIComponent(id)}/preview`
}

export function driveThumbnailFromUrl(input: string, width = 1000): string {
  const id = extractDriveFileId(input)
  return id ? driveThumbnailUrlById(id, width) : '' as string
}

export function driveIframeFromUrl(input: string): string {
  const id = extractDriveFileId(input)
  return id ? driveIframeUrlById(id) : '' as string
}

export function normalizeGooglePreviewUrl(raw?: string | null, width = 1000): string {
  if (!raw)
    return ''
  const input = raw.trim()
  if (!input)
    return ''
  if (input.startsWith('/'))
    return input

  const id = extractDriveFileId(input)
  return id ? driveThumbnailUrlById(id, width) : ''
}
