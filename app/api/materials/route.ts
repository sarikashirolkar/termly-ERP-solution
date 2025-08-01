import { type NextRequest, NextResponse } from "next/server"
import { studyMaterialService } from "@/lib/supabase-service"

// Type definitions for hierarchical structure
type Material = {
  id: string
  title: string
  description: string
  fileUrl: string
  fileType: string
  uploadedBy: string
  uploadedAt: number
  version: number
  previousVersions: string[]
  keywords: string[]
  moduleId: string
  topicId: string
}

type Topic = {
  id: string
  title: string
  description: string
  materials: Material[]
}

type Module = {
  id: string
  title: string
  description: string
  topics: Topic[]
}

type Subject = {
  id: string
  code: string
  title: string
  description: string
  modules: Module[]
}

// In-memory store (replace with database in production)
const subjects: Map<string, Subject> = new Map()
const materialVersions: Map<string, Material> = new Map()

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15)

// Trie for keyword search
class TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
  materialIds: Set<string>

  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
    this.materialIds = new Set()
  }
}

class Trie {
  root: TrieNode

  constructor() {
    this.root = new TrieNode()
  }

  insert(word: string, materialId: string) {
    let current = this.root

    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode())
      }
      current = current.children.get(char)!
    }

    current.isEndOfWord = true
    current.materialIds.add(materialId)
  }

  search(word: string): Set<string> {
    let current = this.root

    for (const char of word) {
      if (!current.children.has(char)) {
        return new Set()
      }
      current = current.children.get(char)!
    }

    return current.isEndOfWord ? current.materialIds : new Set()
  }

  startsWith(prefix: string): Set<string> {
    let current = this.root

    for (const char of prefix) {
      if (!current.children.has(char)) {
        return new Set()
      }
      current = current.children.get(char)!
    }

    // Collect all material IDs in the subtree
    return this.collectMaterialIds(current)
  }

  collectMaterialIds(node: TrieNode): Set<string> {
    const result = new Set<string>([...node.materialIds])

    for (const child of node.children.values()) {
      const childIds = this.collectMaterialIds(child)
      for (const id of childIds) {
        result.add(id)
      }
    }

    return result
  }
}

// Initialize Trie
const keywordTrie = new Trie()

// Search function
function searchMaterials(query: string): Material[] {
  if (!query) return []

  const normalizedQuery = query.toLowerCase()
  const materialIds = new Set<string>()

  // Search by keyword
  const keywordMatches = keywordTrie.startsWith(normalizedQuery)
  for (const id of keywordMatches) {
    materialIds.add(id)
  }

  // Search by title and description
  for (const subject of subjects.values()) {
    for (const module of subject.modules) {
      for (const topic of module.topics) {
        for (const material of topic.materials) {
          if (
            material.title.toLowerCase().includes(normalizedQuery) ||
            material.description.toLowerCase().includes(normalizedQuery)
          ) {
            materialIds.add(material.id)
          }
        }
      }
    }
  }

  // Convert IDs to materials
  const results: Material[] = []

  for (const id of materialIds) {
    for (const subject of subjects.values()) {
      for (const module of subject.modules) {
        for (const topic of module.topics) {
          const material = topic.materials.find((m) => m.id === id)
          if (material) {
            results.push(material)
          }
        }
      }
    }
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectAssignmentId = searchParams.get("subjectAssignmentId")
    const isPublic = searchParams.get("public")

    let data

    if (isPublic === "true") {
      data = await studyMaterialService.getPublic()
    } else if (subjectAssignmentId) {
      data = await studyMaterialService.getBySubjectAssignment(subjectAssignmentId)
    } else {
      data = await studyMaterialService.getPublic()
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching materials:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch materials",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action || "addMaterial"

    switch (action) {
      case "addSubject":
        if (!body.title || !body.code) {
          return NextResponse.json({ error: "Missing required fields for subject" }, { status: 400 })
        }

        const subject: Subject = {
          id: generateId(),
          code: body.code,
          title: body.title,
          description: body.description || "",
          modules: [],
        }

        subjects.set(subject.id, subject)

        return NextResponse.json({ subject })

      case "addModule":
        if (!body.subjectId || !body.title) {
          return NextResponse.json({ error: "Missing required fields for module" }, { status: 400 })
        }

        const targetSubject = subjects.get(body.subjectId)
        if (!targetSubject) {
          return NextResponse.json({ error: "Subject not found" }, { status: 404 })
        }

        const module: Module = {
          id: generateId(),
          title: body.title,
          description: body.description || "",
          topics: [],
        }

        targetSubject.modules.push(module)

        return NextResponse.json({ module })

      case "addTopic":
        if (!body.subjectId || !body.moduleId || !body.title) {
          return NextResponse.json({ error: "Missing required fields for topic" }, { status: 400 })
        }

        const subjectForTopic = subjects.get(body.subjectId)
        if (!subjectForTopic) {
          return NextResponse.json({ error: "Subject not found" }, { status: 404 })
        }

        const moduleForTopic = subjectForTopic.modules.find((m) => m.id === body.moduleId)
        if (!moduleForTopic) {
          return NextResponse.json({ error: "Module not found" }, { status: 404 })
        }

        const topic: Topic = {
          id: generateId(),
          title: body.title,
          description: body.description || "",
          materials: [],
        }

        moduleForTopic.topics.push(topic)

        return NextResponse.json({ topic })

      case "addMaterial":
      default:
        if (
          !body.subjectId ||
          !body.moduleId ||
          !body.topicId ||
          !body.title ||
          !body.fileUrl ||
          !body.fileType ||
          !body.uploadedBy
        ) {
          return NextResponse.json({ error: "Missing required fields for material" }, { status: 400 })
        }

        const subjectForMaterial = subjects.get(body.subjectId)
        if (!subjectForMaterial) {
          return NextResponse.json({ error: "Subject not found" }, { status: 404 })
        }

        const moduleForMaterial = subjectForMaterial.modules.find((m) => m.id === body.moduleId)
        if (!moduleForMaterial) {
          return NextResponse.json({ error: "Module not found" }, { status: 404 })
        }

        const topicForMaterial = moduleForMaterial.topics.find((t) => t.id === body.topicId)
        if (!topicForMaterial) {
          return NextResponse.json({ error: "Topic not found" }, { status: 404 })
        }

        const materialId = generateId()
        const keywords = body.keywords || []

        const material: Material = {
          id: materialId,
          title: body.title,
          description: body.description || "",
          fileUrl: body.fileUrl,
          fileType: body.fileType,
          uploadedBy: body.uploadedBy,
          uploadedAt: Date.now(),
          version: 1,
          previousVersions: [],
          keywords,
          moduleId: body.moduleId,
          topicId: body.topicId,
        }

        // Add to topic
        topicForMaterial.materials.push(material)

        // Add to version history
        materialVersions.set(`${materialId}-v1`, { ...material })

        // Index keywords in Trie
        for (const keyword of keywords) {
          keywordTrie.insert(keyword.toLowerCase(), materialId)
        }

        return NextResponse.json({ material })
    }
  } catch (error) {
    console.error("Error creating material:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create material",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, action, ...updates } = await request.json()

    let result
    if (action === "incrementDownload") {
      result = await studyMaterialService.incrementDownloadCount(id)
    } else {
      result = await studyMaterialService.update(id, updates)
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error updating material:", error)
    return NextResponse.json(
      {
        error: "Failed to update material. Please check your database connection.",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const materialId = searchParams.get("materialId")

  if (!materialId) {
    return NextResponse.json({ error: "Material ID is required" }, { status: 400 })
  }

  // Find and remove the material
  let found = false

  for (const subject of subjects.values()) {
    for (const module of subject.modules) {
      for (const topic of module.topics) {
        const initialLength = topic.materials.length
        topic.materials = topic.materials.filter((m) => m.id !== materialId)

        if (topic.materials.length < initialLength) {
          found = true
          break
        }
      }
      if (found) break
    }
    if (found) break
  }

  if (!found) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 })
  }

  // Remove from version history
  // This is simplified - in a real implementation, we might want to keep versions
  for (const key of materialVersions.keys()) {
    if (key.startsWith(`${materialId}-v`)) {
      materialVersions.delete(key)
    }
  }

  return NextResponse.json({ success: true })
}
