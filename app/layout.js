import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sentiment Analyzer - AI-Powered Text Analysis',
  description: 'Analyze the sentiment of any text using advanced AI technology powered by Hugging Face',
  keywords: 'sentiment analysis, AI, text analysis, NLP, machine learning',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}