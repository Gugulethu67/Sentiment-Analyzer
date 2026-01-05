import { NextResponse } from 'next/server'

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY
const HF_MODEL_SLUG =
  process.env.HF_MODEL_SLUG || 'nlptown/bert-base-multilingual-uncased-sentiment'


export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!HF_API_KEY) {
      return NextResponse.json(
        { error: 'Hugging Face API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HF_MODEL_SLUG}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', errorText)

      if (response.status === 503) {
        return NextResponse.json(
          { error: 'Model is loading, please try again shortly' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to analyze sentiment' },
        { status: response.status }
      )
    }

    const data = await response.json()


    const sentimentData = Array.isArray(data[0]) ? data[0] : data

 
    const top = sentimentData.reduce(
      (max, item) => (item.score > max.score ? item : max),
      sentimentData[0]
    )

    return NextResponse.json({
      text,
      sentiment: top.label, // e.g. "5 stars"
      confidence: (top.score * 100).toFixed(2) + '%',
      allScores: sentimentData,
      model: HF_MODEL_SLUG,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in analyze API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}