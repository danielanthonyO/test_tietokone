export function generateCode(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 12);
  return `${prefix}-${random}#`;
}