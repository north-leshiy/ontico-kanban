interface FetchMessage {
  type: 'FETCH'
  url: string
  method: 'GET' | 'POST'
  body?: unknown
}

interface FetchResponse {
  data?: unknown
  error?: string
}

chrome.runtime.onMessage.addListener(
  (message: FetchMessage, _sender, sendResponse: (r: FetchResponse) => void) => {
    if (message.type !== 'FETCH') return false

    const { url, method, body } = message

    fetch(url, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
      .then(async (res) => {
        // Handle auth redirects (ontico redirects to login page instead of 401)
        if (res.status === 401 || res.redirected) {
          sendResponse({ error: 'UNAUTHORIZED' })
          return
        }
        const data = await res.json()
        // Check if API returned an auth error via status field
        if (data?.status?.name === 'auth_error' || data?.status?.messages?.includes('401')) {
          sendResponse({ error: 'UNAUTHORIZED' })
          return
        }
        sendResponse({ data })
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        sendResponse({ error: msg })
      })

    return true // keep message channel open for async response
  }
)
