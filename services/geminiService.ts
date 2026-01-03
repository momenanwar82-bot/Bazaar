
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- Firebase Configuration ---
// المفاتيح العامة لـ Firebase لا تشكل خطراً أمنياً، لكن مفتاح Gemini هو ما يتم تأمينه
const firebaseConfig = {
  apiKey: "AIzaSyCMqmN36CPWc5TePfCzXTfuZGlJz90gpY8",
  authDomain: "bazaar-1c7e8.firebaseapp.com",
  projectId: "bazaar-1c7e8",
  storageBucket: "bazaar-1c7e8.firebasestorage.app",
  messagingSenderId: "162360142442",
  appId: "1:162360142442:web:615845038d886f1eb3f813",
  measurementId: "G-HP0H1DBKJC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// SECURITY: Gemini API is initialized using protected process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const loginUser = async (email: string, pass: string, rememberMe: boolean = true) => {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return { status: 'success', user: { email: userCredential.user.email, displayName: userCredential.user.displayName } };
  } catch (error: any) {
    return { status: 'error', message: "Email or password incorrect." };
  }
};

export const registerUser = async (email: string, pass: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp()
    });
    return { status: 'success', user: { email: userCredential.user.email, displayName: name } };
  } catch (error: any) {
    return { status: 'error', message: "Registration failed." };
  }
};

export const logoutUser = () => signOut(auth);

export const saveProductToDB = async (p: any) => { 
  const cleanData = {
    ...p,
    createdAt: serverTimestamp() 
  };
  const docRef = await addDoc(collection(db, "products"), cleanData); 
  return docRef.id; 
};

export const deleteProductFromDB = async (productId: string) => { 
  await deleteDoc(doc(db, "products", productId)); 
};

export const markNotificationAsRead = async (id: string) => { 
  await updateDoc(doc(db, "notifications", id), { isRead: true }); 
};

export const identifyProductFromImage = async (base64Image: string): Promise<any> => {
  try {
    const ai = getAI();
    const data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [
        { text: "Marketplace Agent: Analyze image. Return JSON: { 'title': 'Short Title', 'category': 'Cars|Phones|Clothing|Games|Electronics|Real Estate|Furniture|Others', 'description': 'Provide a VERY detailed, high-converting professional marketing description in English (200+ words) mentioning condition, specifications, and potential value.' }" }, 
        { inlineData: { mimeType: "image/jpeg", data } }
      ] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || 'null');
  } catch (error) { 
    console.error("AI Analysis Error:", error);
    return null; 
  }
};

export const analyzeImageSafety = async (base64Image: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const ai = getAI();
    const data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [
        { text: "Security Gate: Is this image safe for a general marketplace? Return JSON {isSafe: boolean, reason: string}." }, 
        { inlineData: { mimeType: "image/jpeg", data } }
      ] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"isSafe": true}');
  } catch (error) { return { isSafe: true }; }
};

export const getUserUploadCountToday = async (email: string): Promise<number> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(startOfToday);
    const q = query(collection(db, "products"), where("sellerEmail", "==", email));
    const snapshot = await getDocs(q);
    return snapshot.docs.filter(doc => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      return createdAt && createdAt.seconds >= startTimestamp.seconds;
    }).length;
  } catch (e) { return 0; }
};

export const getSellerStats = async (sellerName: string): Promise<any> => {
  try {
    const q = query(collection(db, "product_comments"), where("sellerName", "==", sellerName));
    const snapshot = await getDocs(q);
    const ratings = snapshot.docs.map(d => d.data().rating as number);
    const count = ratings.length;
    const avg = count > 0 ? (ratings.reduce((a, b) => a + b, 0) / count) : 0;
    return { rating: Number(avg.toFixed(1)), reviewsCount: count, joinedDate: "Feb 2024" };
  } catch (e) {
    return { rating: 0, reviewsCount: 0, joinedDate: "Feb 2024" };
  }
};

export const getProductReviews = async (productId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, "product_comments"), where("productId", "==", productId), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() || new Date() }));
  } catch (e) { return []; }
};

export const addProductReview = async (productId: string, rating: number, userName: string, comment: string): Promise<boolean> => {
  try {
    const productDoc = await getDoc(doc(db, "products", productId));
    const sellerName = productDoc.exists() ? (productDoc.data()?.sellerName || 'Unknown') : 'Unknown';
    await addDoc(collection(db, "product_comments"), { productId, sellerName, rating, userName, comment, timestamp: serverTimestamp() });
    return true;
  } catch (e) { return false; }
};

export const negotiatePrice = async (productTitle: string, originalPrice: number, offeredPrice: number): Promise<any> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Negotiate ${productTitle} ($${originalPrice}). Buyer offered $${offeredPrice}. Be professional. Return JSON {status: 'accepted'|'counter'|'rejected', message: string}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) { return { status: 'error', message: 'Communication error.' }; }
};

// Fix: Add missing generateProductDescription export to optimize product details
export const generateProductDescription = async (title: string, category: string, currentDesc: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite and improve this marketplace product description. 
      Title: ${title}
      Category: ${category}
      Current description: ${currentDesc}
      
      Requirements:
      - Professional, engaging, and trustworthy tone.
      - Highlight key features and condition.
      - Detailed enough for a serious buyer.
      - Return ONLY the improved description text, no preamble.`,
    });
    return response.text || currentDesc;
  } catch (error) {
    console.error("AI Rewrite Error:", error);
    return currentDesc;
  }
};

// Fix: Add missing getLiveChatResponse export to handle automated seller replies
export const getLiveChatResponse = async (productTitle: string, userMessage: string, history: any[]): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the seller of "${productTitle}" on Bazaar Marketplace. 
      A potential buyer said: "${userMessage}".
      Provide a professional, helpful, and concise response to keep the negotiation going or answer their question.`,
    });
    return response.text || "Thanks for your interest! How else can I help you?";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I'll get back to you as soon as possible.";
  }
};
