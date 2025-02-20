"use client"

import { useState, useEffect, useCallback } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { getAccessToken } from "./auth"
import { getPlaylistTracks, getTrackGenres } from "./SpotifyApi"
import { Music, Loader2 } from "lucide-react"
import "./App.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const extractPlaylistId = (url) => {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

function App() {
  const [playlistId, setPlaylistId] = useState("")
  const [genreData, setGenreData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAccessToken()
  }, [])

  const analyzePlaylist = useCallback(async (id) => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const tracks = await getPlaylistTracks(id)
      const genres = await getTrackGenres(tracks)
      setGenreData(genres)
    } catch (err) {
      setError("Error analyzing playlist. Please check the playlist ID and try again.")
    }
    setIsLoading(false)
  }, [])

  const handlePaste = useCallback(
    (event) => {
      const pastedText = event.clipboardData.getData("text")
      const extractedId = extractPlaylistId(pastedText)
      if (extractedId) {
        setPlaylistId(extractedId)
        analyzePlaylist(extractedId)
      }
    },
    [analyzePlaylist],
  )

  useEffect(() => {
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  const chartData = {
    labels: Object.keys(genreData),
    datasets: [
      {
        label: "Number of Tracks",
        data: Object.values(genreData),
        backgroundColor: "rgba(29, 185, 84, 0.6)",
        borderColor: "rgba(29, 185, 84, 1)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0, // This ensures whole numbers only
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Genre Distribution",
        font: {
          size: 18,
          weight: "bold",
        },
      },
    },
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <Music className="music-icon" />
        <h1>Spotify Genre Analyzer</h1>
        <p className="subtitle">Discover the genre distribution of your favorite playlists.</p>

        <div className="input-group">
          <input
            id="playlist-id"
            type="text"
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste Spotify Playlist Link"
          />
          <button onClick={() => analyzePlaylist(playlistId)} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="loader-icon" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>

      {Object.keys(genreData).length > 0 && (
        <div className="chart-container">
          <h2>Genre Distribution</h2>
          <div className="chart">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App

