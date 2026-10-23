// Cleans up credentials stored in environment variables (PEM keys, certs, IDs):
// strips wrapping quotes, turns escaped "\n" into real line breaks, and trims.
export const parseEnv = (val?: string) => {
  if (!val) return ''
  return val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim()
}
