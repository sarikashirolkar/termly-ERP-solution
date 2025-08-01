// Service for managing certifications

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  file: string
  fileType: string
  fileSize: string
}

// Get all certifications from localStorage
export const getCertifications = (): Certification[] => {
  if (typeof window === "undefined") return []

  const storedCertifications = localStorage.getItem("certifications")
  return storedCertifications ? JSON.parse(storedCertifications) : []
}

// Get certification count
export const getCertificationCount = (): number => {
  return getCertifications().length
}

// Add a new certification
export const addCertification = (certification: Certification): void => {
  const certifications = getCertifications()
  certifications.push(certification)
  localStorage.setItem("certifications", JSON.stringify(certifications))
}

// Delete a certification
export const deleteCertification = (id: string): void => {
  const certifications = getCertifications()
  const updatedCertifications = certifications.filter((cert) => cert.id !== id)
  localStorage.setItem("certifications", JSON.stringify(updatedCertifications))
}

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}
