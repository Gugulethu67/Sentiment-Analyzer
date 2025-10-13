import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database functions
export async function saveAnalysis(analysis) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('sentiment_analyses')
    .insert([
      {
        text: analysis.text,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        all_scores: analysis.allScores,
        created_at: new Date().toISOString()
      }
    ])
    .select()

  if (error) {
    console.error('Error saving analysis:', error)
    return null
  }

  return data
}

export async function getAnalysisHistory(limit = 10) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('sentiment_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching history:', error)
    return []
  }

  return data
}