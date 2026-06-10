const BLOCKED_FULL_NAMES = new Set(["chetan bhagat"])

const REPLACEMENT_FIRST_NAME = "Arjun"
const REPLACEMENT_LAST_NAME = "Mehta"
const REPLACEMENT_FULL_NAME = `${REPLACEMENT_FIRST_NAME} ${REPLACEMENT_LAST_NAME}`

function normalizeName(value?: string | null) {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase()
}

export function sanitizeDisplayName(value?: string | null) {
  if (!value) return value || ""
  return BLOCKED_FULL_NAMES.has(normalizeName(value)) ? REPLACEMENT_FULL_NAME : value
}

export function sanitizeUserLike<T extends Record<string, any>>(user: T): T {
  if (!user || typeof user !== "object") return user

  const sanitizedUser = { ...user }
  const firstName = sanitizedUser.firstName ?? sanitizedUser.first_name
  const lastName = sanitizedUser.lastName ?? sanitizedUser.last_name
  const fullName = [firstName, lastName].filter(Boolean).join(" ")
  const shouldReplace =
    BLOCKED_FULL_NAMES.has(normalizeName(fullName)) ||
    BLOCKED_FULL_NAMES.has(normalizeName(sanitizedUser.full_name)) ||
    BLOCKED_FULL_NAMES.has(normalizeName(sanitizedUser.name))

  if (!shouldReplace) {
    if (typeof sanitizedUser.full_name === "string") {
      sanitizedUser.full_name = sanitizeDisplayName(sanitizedUser.full_name)
    }
    if (typeof sanitizedUser.name === "string") {
      sanitizedUser.name = sanitizeDisplayName(sanitizedUser.name)
    }
    return sanitizedUser
  }

  if ("firstName" in sanitizedUser) sanitizedUser.firstName = REPLACEMENT_FIRST_NAME
  if ("lastName" in sanitizedUser) sanitizedUser.lastName = REPLACEMENT_LAST_NAME
  if ("first_name" in sanitizedUser) sanitizedUser.first_name = REPLACEMENT_FIRST_NAME
  if ("last_name" in sanitizedUser) sanitizedUser.last_name = REPLACEMENT_LAST_NAME
  if ("full_name" in sanitizedUser) sanitizedUser.full_name = REPLACEMENT_FULL_NAME
  if ("name" in sanitizedUser) sanitizedUser.name = REPLACEMENT_FULL_NAME

  return sanitizedUser
}
