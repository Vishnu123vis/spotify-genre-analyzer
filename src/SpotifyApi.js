import axios from "axios"
import { getAccessToken } from "./auth"

const BASE_URL = "https://api.spotify.com/v1"

export const getPlaylistTracks = async (playlistId) => {
  const accessToken = await getAccessToken()
  let tracks = []
  let url = `${BASE_URL}/playlists/${playlistId}/tracks`

  while (url) {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    tracks = [...tracks, ...response.data.items.map((item) => item.track)]
    url = response.data.next
  }

  return tracks
}

export const getTrackGenres = async (tracks) => {
  const accessToken = await getAccessToken()
  const artistIds = [...new Set(tracks.map((track) => track.artists[0].id))]
  const genres = {}

  // Spotify API allows up to 50 IDs per request
  for (let i = 0; i < artistIds.length; i += 50) {
    const batch = artistIds.slice(i, i + 50)
    const response = await axios.get(`${BASE_URL}/artists`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { ids: batch.join(",") },
    })

    response.data.artists.forEach((artist) => {
      artist.genres.forEach((genre) => {
        genres[genre] = (genres[genre] || 0) + 1
      })
    })
  }

  // Sort genres by count
  return Object.fromEntries(Object.entries(genres).sort((a, b) => b[1] - a[1]))
}

