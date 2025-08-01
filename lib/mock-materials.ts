// Mock data for study materials with more detailed information
export interface StudyMaterial {
  id: number
  title: string
  description: string
  type: "PDF" | "Video" | "Other"
  course: string
  size: string
  uploadedAt: string
  author?: string
  fileUrl?: string
  thumbnailUrl?: string
  duration?: string // For videos
  pages?: number // For PDFs
  tags?: string[]
}

export const mockStudyMaterials: StudyMaterial[] = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    description: "Comprehensive notes on computer science fundamentals",
    type: "PDF",
    course: "Computer Science 101",
    size: "2.5 MB",
    uploadedAt: "2025-03-01",
    author: "Dr. Rajesh Kumar",
    pages: 42,
    tags: ["programming", "fundamentals", "algorithms"],
    fileUrl: "/mock-files/intro-to-cs.pdf",
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    description: "Lecture notes on common data structures and algorithms",
    type: "PDF",
    course: "Data Structures",
    size: "3.2 MB",
    uploadedAt: "2025-03-01",
    author: "Prof. Priya Sharma",
    pages: 68,
    tags: ["data structures", "algorithms", "complexity"],
    fileUrl: "/mock-files/dsa-notes.pdf",
  },
  {
    id: 3,
    title: "Artificial Intelligence Fundamentals",
    description: "Introduction to AI concepts and applications",
    type: "PDF",
    course: "Artificial Intelligence",
    size: "4.1 MB",
    uploadedAt: "2025-02-28",
    author: "Dr. Amit Patel",
    pages: 75,
    tags: ["AI", "machine learning", "neural networks"],
    fileUrl: "/mock-files/ai-fundamentals.pdf",
  },
  {
    id: 4,
    title: "Database Systems Overview",
    description: "Lecture video on database design principles",
    type: "Video",
    course: "Database Systems",
    size: "120 MB",
    uploadedAt: "2025-02-27",
    author: "Prof. Sneha Verma",
    duration: "45:20",
    thumbnailUrl: "/mock-files/database-thumbnail.jpg",
    tags: ["databases", "SQL", "normalization"],
    fileUrl: "/mock-files/database-systems.mp4",
  },
  {
    id: 5,
    title: "Web Development Basics",
    description: "Tutorial on HTML, CSS, and JavaScript",
    type: "Video",
    course: "Web Development",
    size: "150 MB",
    uploadedAt: "2025-02-26",
    author: "Prof. Vikram Singh",
    duration: "52:15",
    thumbnailUrl: "/mock-files/webdev-thumbnail.jpg",
    tags: ["HTML", "CSS", "JavaScript", "frontend"],
    fileUrl: "/mock-files/web-development.mp4",
  },
  {
    id: 6,
    title: "Machine Learning Algorithms",
    description: "Detailed notes on common ML algorithms",
    type: "PDF",
    course: "Machine Learning",
    size: "5.3 MB",
    uploadedAt: "2025-02-25",
    author: "Dr. Anjali Reddy",
    pages: 92,
    tags: ["machine learning", "algorithms", "data science"],
    fileUrl: "/mock-files/ml-algorithms.pdf",
  },
  {
    id: 7,
    title: "Operating Systems Concepts",
    description: "Comprehensive guide to operating systems",
    type: "PDF",
    course: "Operating Systems",
    size: "4.8 MB",
    uploadedAt: "2025-02-24",
    author: "Dr. Sanjay Mehta",
    pages: 84,
    tags: ["OS", "processes", "memory management"],
    fileUrl: "/mock-files/os-concepts.pdf",
  },
  {
    id: 8,
    title: "Computer Networks Fundamentals",
    description: "Video lecture on networking basics",
    type: "Video",
    course: "Computer Networks",
    size: "180 MB",
    uploadedAt: "2025-02-23",
    author: "Prof. Deepak Gupta",
    duration: "63:45",
    thumbnailUrl: "/mock-files/networks-thumbnail.jpg",
    tags: ["networking", "protocols", "TCP/IP"],
    fileUrl: "/mock-files/computer-networks.mp4",
  },
]
