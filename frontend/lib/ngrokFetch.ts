// lib/ngrokFetch.ts
export async function ngrokFetch(
    input: RequestInfo,
    init: RequestInit = {}
  ) {
    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        "ngrok-skip-browser-warning": "true",
      },
    })
  }
  