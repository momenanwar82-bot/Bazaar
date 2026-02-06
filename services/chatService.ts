
import { getDatabase, ref, push, set, onChildAdded, off, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { app } from "./geminiService";

const db = getDatabase(app);

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

/**
 * إرسال رسالة جديدة
 */
export const sendMessage = async (chatId: string, senderId: string, senderName: string, text: string) => {
  if (!text.trim()) return;

  const chatRef = ref(db, `chats/${chatId}/messages`);
  const newMessageRef = push(chatRef);
  
  await set(newMessageRef, {
    senderId,
    senderName,
    text,
    timestamp: serverTimestamp()
  });
};

/**
 * الاستماع للرسائل الجديدة واحدة تلو الأخرى باستخدام onChildAdded
 */
export const listenForNewMessages = (chatId: string, onNewMessage: (message: Message) => void) => {
  const chatRef = ref(db, `chats/${chatId}/messages`);
  
  // onChildAdded يعمل مع الرسائل القديمة (عند البداية) والرسائل الجديدة فور إضافتها
  onChildAdded(chatRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      onNewMessage({
        id: snapshot.key as string,
        ...data
      });
    }
  });

  return () => off(chatRef);
};

/**
 * توليد معرف محادثة ثابت للتجربة
 */
export const generateChatId = (productId: string, buyerId: string) => {
  // للتجربة المباشرة يمكننا استخدام productId فقط أو دمج الاثنين
  return `chat_${productId}_${buyerId.replace(/[^a-zA-Z0-9]/g, '')}`;
};
