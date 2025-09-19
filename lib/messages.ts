import { db } from "./firebase"
import { collection, doc, setDoc, getDocs, query, orderBy, onSnapshot, updateDoc } from "firebase/firestore"

export interface Message {
  id: string
  senderName: string
  content: string
  isRead: boolean
  createdAt: Date
}

export async function sendMessage(senderName: string, content: string): Promise<boolean> {
  try {
    const messageId = Date.now().toString()
    const newMessage = {
      id: messageId,
      senderName,
      content,
      isRead: false,
      createdAt: new Date(),
      timestamp: Date.now(),
    }

    await setDoc(doc(db, "messages", messageId), newMessage)
    console.log("[v0] Message stored in Firestore")
    return true
  } catch (error) {
    console.error("Error sending message:", error)
    return false
  }
}

export function getMessages(): Promise<Message[]> {
  return new Promise((resolve, reject) => {
    try {
      console.log("[v0] Getting messages from Firestore...")

      const messagesRef = collection(db, "messages")
      const q = query(messagesRef, orderBy("timestamp", "desc"))

      onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(data.createdAt),
            } as Message
          })

          console.log("[v0] Retrieved messages from Firestore:", messages.length)
          resolve(messages)
        },
        reject,
      )
    } catch (error) {
      console.error("Error getting messages:", error)
      reject(error)
    }
  })
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, "messages", messageId), {
      isRead: true,
    })
    console.log("[v0] Message marked as read in Firestore")
    return true
  } catch (error) {
    console.error("Error marking message as read:", error)
    return false
  }
}

export async function markAllMessagesAsRead(): Promise<boolean> {
  try {
    const messagesSnapshot = await getDocs(collection(db, "messages"))
    const updatePromises = messagesSnapshot.docs.map((doc) => updateDoc(doc.ref, { isRead: true }))
    await Promise.all(updatePromises)
    console.log("[v0] All messages marked as read in Firestore")
    return true
  } catch (error) {
    console.error("Error marking all messages as read:", error)
    return false
  }
}
