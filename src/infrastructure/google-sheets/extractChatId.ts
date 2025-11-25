export function extractChatId(rawChatData: string): number {
  const prefix = 'ID:'
  const index = rawChatData.lastIndexOf(prefix)

  if (index !== -1 && index + prefix.length < rawChatData.length) {
    const idStr = rawChatData.slice(index + prefix.length).trim()
    const id = Number.parseInt(idStr, 10)

    if (Number.isNaN(id)) {
      throw new TypeError('Invalid chat ID format')
    }

    return id
  }

  throw new Error('Chat ID not found in string')
}
