"use client"

import { useState, useEffect } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { getAccessToken } from "./auth"
import { getPlaylistTracks, getTrackGenres } from "./SpotifyApi"
import { Music, Loader2 } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function App() {
  const [playlistId, setPlaylistId] = useState("")
  const [genreData, setGenreData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAccessToken()
  }, [])

  const analyzePlaylist = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const tracks = await getPlaylistTracks(playlistId)
      const genres = await getTrackGenres(tracks)
      setGenreData(genres)
    } catch (err) {
      setError("Error analyzing playlist. Please check the playlist ID and try again.")
    }
    setIsLoading(false)
  }

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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Music className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900 sm:text-5xl">Spotify Genre Analyzer</h1>
          <p className="mt-3 text-xl text-gray-500">Discover the genre distribution of your favorite playlists</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <div>
                <label htmlFor="playlist-id" className="block text-sm font-medium text-gray-700">
                  Playlist ID
                </label>
                <div className="mt-1">
                  <input
                    id="playlist-id"
                    type="text"
                    value={playlistId}
                    onChange={(e) => setPlaylistId(e.target.value)}
                    placeholder="Enter Spotify Playlist ID"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <button
                  onClick={analyzePlaylist}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Playlist"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}
        {Object.keys(genreData).length > 0 && (
          <div className="mt-12 bg-white shadow sm:rounded-lg p-6">
            <div className="chart-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

