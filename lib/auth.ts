import { db } from "./firebase"
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, onSnapshot, deleteDoc } from "firebase/firestore"

export interface User {
  name: string
  isAdmin: boolean
  hasApprovedRules: boolean
  createdAt: Date
}

export const ADMIN_NAME = "Ahmed"
export const ADMIN_PASSWORD = "super123"
export const MAX_USERS = 5

export async function loginUser(
  name: string,
  password?: string,
  isAdminLogin?: boolean,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log("[v0] Attempting login for:", name, "as admin:", isAdminLogin)

    if (isAdminLogin) {
      if (name !== ADMIN_NAME) {
        return { success: false, error: "المدير فقط يمكنه تسجيل الدخول كمدير" }
      }
      if (password !== ADMIN_PASSWORD) {
        return { success: false, error: "كلمة مرور المدير غير صحيحة" }
      }
    }

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", name))

    if (userDoc.exists()) {
      const userData = userDoc.data() as User
      console.log("[v0] User found in Firestore:", userData.name)
      return {
        success: true,
        user: { ...userData, createdAt: userData.createdAt || new Date() },
      }
    }

    // Check existing users count for new users
    const usersSnapshot = await getDocs(collection(db, "users"))
    if (usersSnapshot.size >= MAX_USERS) {
      return { success: false, error: "تم الوصول للحد الأقصى من المستخدمين (5 مستخدمين)" }
    }

    // Create new user in Firestore
    const newUser: User = {
      name,
      isAdmin: name === ADMIN_NAME && isAdminLogin,
      hasApprovedRules: false,
      createdAt: new Date(),
    }

    await setDoc(doc(db, "users", name), newUser)
    console.log("[v0] New user created in Firestore:", newUser.name)
    return { success: true, user: newUser }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" }
  }
}

export async function approveRules(userName: string): Promise<boolean> {
  try {
    console.log("[v0] Approving rules for:", userName)

    // Add approval to Firestore
    await setDoc(doc(db, "approvals", userName), {
      userName,
      approvedAt: new Date().toISOString(),
      timestamp: Date.now(),
    })

    // Update user's approval status
    await setDoc(
      doc(db, "users", userName),
      {
        hasApprovedRules: true,
      },
      { merge: true },
    )

    console.log("[v0] Approval stored in Firestore for:", userName)
    return true
  } catch (error) {
    console.error("[v0] Error approving rules:", error)
    return false
  }
}

export function getAllApprovals(): Promise<Array<{ userName: string; approvedAt: string; timestamp: number }>> {
  return new Promise((resolve, reject) => {
    try {
      const approvalsRef = collection(db, "approvals")
      const q = query(approvalsRef, orderBy("timestamp", "asc"))

      onSnapshot(
        q,
        (snapshot) => {
          const approvals = snapshot.docs.map(
            (doc) => doc.data() as { userName: string; approvedAt: string; timestamp: number },
          )
          resolve(approvals)
        },
        reject,
      )
    } catch (error) {
      console.error("[v0] Error getting approvals:", error)
      reject(error)
    }
  })
}

export async function hasUserApproved(userName: string): Promise<boolean> {
  try {
    const [approvalDoc, userDoc] = await Promise.all([
      getDoc(doc(db, "approvals", userName)),
      getDoc(doc(db, "users", userName)),
    ])

    // If approval exists in approvals collection, return true
    if (approvalDoc.exists()) {
      return true
    }

    // Also check user document for hasApprovedRules field
    if (userDoc.exists()) {
      const userData = userDoc.data() as User
      return userData.hasApprovedRules || false
    }

    return false
  } catch (error) {
    console.error("[v0] Error checking approval:", error)
    return false
  }
}

export async function resetAllFirestoreData(): Promise<void> {
  try {
    // Delete all users except admin
    const usersSnapshot = await getDocs(collection(db, "users"))
    for (const userDoc of usersSnapshot.docs) {
      if (userDoc.id !== ADMIN_NAME) {
        await deleteDoc(doc(db, "users", userDoc.id))
      }
    }

    // Delete all approvals
    const approvalsSnapshot = await getDocs(collection(db, "approvals"))
    for (const approvalDoc of approvalsSnapshot.docs) {
      await deleteDoc(doc(db, "approvals", approvalDoc.id))
    }

    // Delete all messages
    const messagesSnapshot = await getDocs(collection(db, "messages"))
    for (const messageDoc of messagesSnapshot.docs) {
      await deleteDoc(doc(db, "messages", messageDoc.id))
    }

    console.log("[v0] All Firestore data reset successfully")
  } catch (error) {
    console.error("[v0] Error resetting Firestore data:", error)
    throw error
  }
}
