import axios from "axios"

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI

let accessToken = null

export const getAccessToken = async () => {
  if (accessToken) return accessToken

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    headers: {
      Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: "grant_type=client_credentials",
  }

  try {
    const response = await axios(authOptions)
    accessToken = response.data.access_token
    return accessToken
  } catch (error) {
    console.error("Error getting access token:", error)
    throw error
  }
}

