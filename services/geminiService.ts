import { GoogleGenerativeAI } from "@google/generative-ai";
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

// --- Gemini AI Configuration ---
// تم التعديل هنا ليعمل مع Vite و Vercel بشكل صحيح
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const data = base64Image.split(',')[1] || base64Image;
    const result = await model.generateContent([
      "Marketplace Agent: Analyze image. Return JSON: { 'title': 'Short Title', 'category': 'Cars|Phones|Clothing|Games|Electronics|Real Estate|Furniture|Others', 'description': 'Detailed marketing description in English.' }",
      { inlineData: { mimeType: "image/jpeg", data } }
    ]);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, "").trim());
  } catch (error) { 
    console.error("AI Analysis Error:", error);
    return null; 
  }
};

export const analyzeImageSafety = async (base64Image: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const data = base64Image.split(',')[1] || base64Image;
