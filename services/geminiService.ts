
import { GoogleGenAI } from "@google/genai";
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

// Initializes a new GoogleGenAI instance using the environment variable.
const getAI = () => {
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

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
  const cleanData = { ...p, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, "products"), cleanData); 
  return docRef.id; 
};

export const deleteProductFromDB = async (productId: string) => { 
  await deleteDoc(doc(db, "products", productId)); 
};

export const markNotificationAsRead = async (id: string) => { 
  await updateDoc(doc(db, "notifications", id), { isRead: true }); 
};

// Uses Gemini to generate product title and description from an image
export const identifyProductFromImage = async (base64Image: string): Promise<any> => {
  try {
    const ai = getAI();
    if (!ai) return null;
    const data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [
        { text: "Identity this product from the photo. Provide a catchy title and a high-converting professional marketing description. Return ONLY JSON: { 'title': 'Name', 'category': 'Cars|Phones|Laptops & PCs|Home Appliances|Electronics|Real Estate|Furniture|Clothing|Jewelry|Watches|Sports & Fitness|Games|Tools & DIY|Beauty|Others', 'description': 'Full marketing pitch' }. Note: Jewelry includes Gold, Diamonds, Rings. Watches covers luxury and smart watches. Home Appliances includes washing machines, fridges, etc. Tools & DIY includes power tools and hardware." }, 
        { inlineData: { mimeType: "image/jpeg", data } }
      ] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || 'null');
  } catch (error) { return null; }
};

// Uses Gemini to determine if an image is safe for the marketplace
export const analyzeImageSafety = async (base64Image: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const ai = getAI();
    if (!ai) return { isSafe: true };
    const data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [
        { text: "Is this image safe for a marketplace? Return JSON {isSafe: boolean, reason: string}." }, 
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
    // Fetch product reviews
    const productReviewsQ = query(collection(db, "product_comments"), where("sellerName", "==", sellerName));
    const productSnap = await getDocs(productReviewsQ);
    
    // Fetch direct seller profile ratings
    const sellerRatingsQ = query(collection(db, "seller_ratings"), where("sellerName", "==", sellerName));
    const sellerSnap = await getDocs(sellerRatingsQ);

    const productRatings = productSnap.docs.map(d => d.data().rating as number);
    const directRatings = sellerSnap.docs.map(d => d.data().rating as number);
    
    const allRatings = [...productRatings, ...directRatings];
    const count = allRatings.length;
    const avg = count > 0 ? (allRatings.reduce((a, b) => a + b, 0) / count) : 0;
    
    return { rating: Number(avg.toFixed(1)), reviewsCount: count, joinedDate: "Feb 2024" };
  } catch (e) { return { rating: 0, reviewsCount: 0, joinedDate: "Feb 2024" }; }
};

export const addSellerRating = async (sellerName: string, rating: number, raterName: string): Promise<boolean> => {
  try {
    await addDoc(collection(db, "seller_ratings"), {
      sellerName,
      rating,
      raterName,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (e) { return false; }
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
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) return false;
    const productData = productSnap.data();
    const sellerEmail = productData.sellerEmail;
    const productTitle = productData.title;

    // 1. Add the review
    await addDoc(collection(db, "product_comments"), { 
      productId, 
      sellerName: productData.sellerName, 
      rating, 
      userName, 
      comment, 
      timestamp: serverTimestamp() 
    });

    // 2. Recalculate Average for the product specifically
    const q = query(collection(db, "product_comments"), where("productId", "==", productId));
    const snapshot = await getDocs(q);
    const ratings = snapshot.docs.map(d => d.data().rating as number);
    const newCount = ratings.length;
    const newAvg = ratings.reduce((a, b) => a + b, 0) / newCount;

    // 3. Strict Quality Check: If rating < 2, purge the product
    if (newAvg < 2 && newCount >= 1) {
      await deleteDoc(productRef);
      // Notify seller
      await addDoc(collection(db, "notifications"), {
        sellerEmail,
        productTitle,
        type: 'quality_removal',
        message: `Your ad "${productTitle}" was removed due to low ratings (below 2.0 stars).`,
        timestamp: serverTimestamp(),
        isRead: false
      });
      return true; 
    }

    // 4. Update product stats normally
    await updateDoc(productRef, {
      rating: Number(newAvg.toFixed(1)),
      reviewsCount: newCount
    });

    return true;
  } catch (e) { 
    console.error("Error adding review:", e);
    return false; 
  }
};

export const getLiveChatResponse = async (productTitle: string, userMessage: string, history: any[]): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "Service unavailable.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Product Context: "${productTitle}"\nBuyer Inquiry: "${userMessage}"`,
      config: {
        systemInstruction: `You are a helpful and professional seller on the Bazaar marketplace. Respond to the buyer's inquiry about your item: "${productTitle}". 
        Be concise, friendly, and act as a human seller would. Focus on helping the buyer and providing accurate information based on the context.`
      }
    });

    return response.text || "I'm sorry, I'm not sure how to answer that. Could you please clarify?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "The seller is currently unavailable.";
  }
};
