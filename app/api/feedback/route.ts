import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Type definitions
type FeedbackReply = {
  id: string
  content: string
  authorId: string
  authorType: "student" | "faculty" | "admin"
  timestamp: number
  sentiment?: "positive" | "neutral" | "negative"
}

type Feedback = {
  id: string
  studentId: string
  courseId: string
  facultyId: string
  content: string
  rating: number
  timestamp: number
  status: "pending" | "responded" | "resolved"
  replies: FeedbackReply[]
  sentiment?: "positive" | "neutral" | "negative"
  keywords: string[]
}

// In-memory store (replace with database in production)
const feedbackRecords: Map<string, Feedback> = new Map()

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15)

// Basic sentiment analysis
function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
  const positiveWords = ["good", "great", "excellent", "amazing", "helpful", "clear", "enjoy", "like", "love", "best"]
  const negativeWords = [
    "bad",
    "poor",
    "terrible",
    "confusing",
    "difficult",
    "unclear",
    "hate",
    "dislike",
    "worst",
    "hard",
  ]

  const lowerText = text.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    const matches = lowerText.match(regex)
    if (matches) positiveCount += matches.length
  })

  negativeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    const matches = lowerText.match(regex)
    if (matches) negativeCount += matches.length
  })

  if (positiveCount > negativeCount) return "positive"
  if (negativeCount > positiveCount) return "negative"
  return "neutral"
}

// Extract keywords
function extractKeywords(text: string): string[] {
  // Remove common words
  const stopWords = [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "from",
    "up",
    "down",
    "of",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "can",
    "will",
    "just",
    "don",
    "should",
    "now",
  ]

  // Tokenize and filter
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word))

  // Count word frequency
  const wordCount = new Map<string, number>()
  words.forEach((word) => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })

  // Sort by frequency and take top 5
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((entry) => entry[0])
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const facultyId = searchParams.get("facultyId")
  const courseId = searchParams.get("courseId")
  const status = searchParams.get("status")
  const sortBy = searchParams.get("sortBy") || "timestamp"
  const sortOrder = searchParams.get("sortOrder") || "desc"
  const keyword = searchParams.get("keyword")

  try {
    let query = supabase.from("feedback").select("*")

    if (studentId) {
      query = query.eq("student_id", studentId)
    }
    if (facultyId) {
      query = query.eq("faculty_id", facultyId)
    }
    if (courseId) {
      query = query.eq("subject_id", courseId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate required fields
  if (!body.studentId || !body.courseId || !body.facultyId || !body.content || body.rating === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Analyze sentiment
  const sentiment = analyzeSentiment(body.content)

  // Extract keywords
  const keywords = extractKeywords(body.content)

  const feedback: Feedback = {
    id: generateId(),
    studentId: body.studentId,
    courseId: body.courseId,
    facultyId: body.facultyId,
    content: body.content,
    rating: body.rating,
    timestamp: Date.now(),
    status: "pending",
    replies: [],
    sentiment,
    keywords,
  }

  try {
    const { data, error } = await supabase
      .from("feedback")
      .insert([
        {
          student_id: feedback.studentId,
          faculty_id: feedback.facultyId,
          subject_id: feedback.courseId,
          rating: feedback.rating,
          comments: feedback.content,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json()

  if (!body.id || !feedbackRecords.has(body.id)) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
  }

  const existingFeedback = feedbackRecords.get(body.id)!

  // Update fields
  if (body.content) {
    existingFeedback.content = body.content
    existingFeedback.sentiment = analyzeSentiment(body.content)
    existingFeedback.keywords = extractKeywords(body.content)
  }

  if (body.rating !== undefined) {
    existingFeedback.rating = body.rating
  }

  if (body.status) {
    existingFeedback.status = body.status
  }

  // Add reply if provided
  if (body.reply) {
    const reply: FeedbackReply = {
      id: generateId(),
      content: body.reply.content,
      authorId: body.reply.authorId,
      authorType: body.reply.authorType,
      timestamp: Date.now(),
      sentiment: analyzeSentiment(body.reply.content),
    }

    existingFeedback.replies.push(reply)

    // Update status if it was pending
    if (existingFeedback.status === "pending") {
      existingFeedback.status = "responded"
    }
  }

  feedbackRecords.set(existingFeedback.id, existingFeedback)

  try {
    const { data, error } = await supabase
      .from("feedback")
      .update({ rating: existingFeedback.rating, comments: existingFeedback.content })
      .eq("id", existingFeedback.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating feedback:", error)
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const replyId = searchParams.get("replyId")

  if (!id || !feedbackRecords.has(id)) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
  }

  if (replyId) {
    // Delete specific reply
    const feedback = feedbackRecords.get(id)!
    const initialLength = feedback.replies.length
    feedback.replies = feedback.replies.filter((reply) => reply.id !== replyId)

    if (feedback.replies.length === initialLength) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 })
    }

    feedbackRecords.set(id, feedback)

    try {
      const { error } = await supabase.from("feedback_replies").delete().eq("id", replyId)

      if (error) throw error

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting reply:", error)
      return NextResponse.json({ error: "Failed to delete reply" }, { status: 500 })
    }
  }

  // Delete entire feedback
  feedbackRecords.delete(id)

  try {
    const { error } = await supabase.from("feedback").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Feedback deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting feedback:", error)
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 })
  }
}
