import axios from 'axios'

function normalizeBaseURL(url?: string) {
  try {
    if (!url) return undefined

    // Ensure absolute URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url
    }

    return new URL(url).toString()
  } catch {
    return url
  }
}

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const baseURL = normalizeBaseURL(rawBaseURL)

const serverApi = axios.create({
  baseURL
  // không interceptor token
})

export default serverApi
