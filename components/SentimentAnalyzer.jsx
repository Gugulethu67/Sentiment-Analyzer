'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Sparkles, TrendingUp, MessageSquare, BarChart3, Trash2, Download } from 'lucide-react'
//import { supabase, saveAnalysis, getAnalysisHistory } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

const COLORS = {
  POSITIVE: '#10b981',
  NEGATIVE: '#ef4444',
  NEUTRAL: '#f59e0b'
}

export default function SentimentAnalyzer() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Load history on mount if Supabase is configured
//   useEffect(() => {
//     if (supabase) {
//       loadHistory()
//     }
//   }, [])

//   const loadHistory = async () => {
//     setLoadingHistory(true)
//     const data = await getAnalysisHistory(10)
//     if (data && data.length > 0) {
//       const formattedHistory = data.map(item => ({
//         text: item.text,
//         sentiment: item.sentiment,
//         confidence: item.confidence,
//         timestamp: item.created_at,
//         allScores: item.all_scores
//       }))
//       setHistory(formattedHistory)
//     }
//     setLoadingHistory(false)
//   }

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Call our API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze sentiment')
      }

      const analysisResult = {
        text: text,
        sentiment: data.sentiment,
        confidence: data.confidence,
        timestamp: data.timestamp,
        allScores: data.allScores
      }

      setResult(analysisResult)
      
      // Add to local history
      setHistory(prev => [analysisResult, ...prev.slice(0, 9)])
      
      // Save to Supabase if configured
    //   if (supabase) {
    //     await saveAnalysis(analysisResult)
    //   }
      
      setText('')
    } catch (err) {
      setError(err.message || 'Failed to analyze sentiment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    setHistory([])
  }

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sentiment-analysis-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getSentimentColor = (sentiment) => {
    const upper = sentiment.toUpperCase()
    if (upper === 'POSITIVE') return COLORS.POSITIVE
    if (upper === 'NEGATIVE') return COLORS.NEGATIVE
    return COLORS.NEUTRAL
  }

  const getHistoryStats = () => {
    const stats = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 }
    history.forEach(item => {
      const key = item.sentiment.toUpperCase()
      stats[key] = (stats[key] || 0) + 1
    })
    return Object.entries(stats)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyzeSentiment()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white">Sentiment Analyzer</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Powered by Hugging Face AI • Analyze emotions in text instantly
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Input Section */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Enter Text</h2>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type or paste your text here... &#10;&#10;Examples:&#10;• 'I absolutely love this product! It exceeded all my expectations.'&#10;• 'This is the worst experience I've ever had.'&#10;• 'It's okay, nothing special but not terrible either.'"
              className="w-full h-40 p-4 bg-slate-800/50 text-white rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none placeholder-gray-400"
            />

            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-400">
                {text.length} characters • Press Ctrl+Enter to analyze
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={analyzeSentiment}
              disabled={loading || !text.trim()}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Analyze Sentiment
                </span>
              )}
            </button>
          </div>

          {/* Current Result */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Result</h2>
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div 
                    className="inline-block px-6 py-3 rounded-full text-white font-bold text-2xl shadow-lg animate-pulse"
                    style={{ backgroundColor: getSentimentColor(result.sentiment) }}
                  >
                    {result.sentiment}
                  </div>
                  <p className="text-gray-300 mt-3 text-sm">
                    Confidence: <span className="font-bold text-white">{result.confidence}%</span>
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 max-h-32 overflow-y-auto">
                  <p className="text-gray-300 text-sm italic">"{result.text}"</p>
                </div>

                {result.allScores && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Score Breakdown</p>
                    {result.allScores.map((score, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm text-gray-300 mb-1">
                          <span className="capitalize">{score.label.toLowerCase()}</span>
                          <span className="font-semibold">{(score.score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${score.score * 100}%`,
                              backgroundColor: getSentimentColor(score.label)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Your analysis result will appear here</p>
                <p className="text-sm mt-2">Enter text and click analyze to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* History List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Analysis History</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportHistory}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                    title="Export history"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={clearHistory}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800/70 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-gray-300 text-sm flex-1 line-clamp-2">"{item.text}"</p>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                        style={{ backgroundColor: getSentimentColor(item.sentiment) }}
                      >
                        {item.sentiment}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      {formatDate(item.timestamp)} • {item.confidence}% confidence
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Statistics</h2>
              </div>

              {getHistoryStats().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getHistoryStats()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getHistoryStats().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Statistics will appear after analyzing text</p>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Built with Next.js, React, Hugging Face, and Supabase</p>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  )
}