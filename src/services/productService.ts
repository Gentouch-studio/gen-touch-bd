import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, UserAd } from '../types';

const PRODUCTS_COLLECTION = 'products';
const USER_ADS_COLLECTION = 'user_ads';

// Helper to remove undefined fields that Firestore rejects
const cleanData = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (k, v) => (v === undefined ? null : v)));
};

export const productService = {
  // 1. রিয়েল-টাইমে অল প্রোডাক্ট সিঙ্ক (মোবাইল ও পিসিতে একই সাথে আপডেট হবে)
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    try {
      const q = collection(db, PRODUCTS_COLLECTION);
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteProducts = snapshot.docs.map(doc => doc.data() as Product);
          callback(remoteProducts);
          try {
            localStorage.setItem('gentouch_products', JSON.stringify(remoteProducts));
            localStorage.setItem('gen_touch_custom_products', JSON.stringify(remoteProducts));
          } catch {
            // ignore storage quota errors safely
          }
        }
      }, (error) => {
        console.warn('Products sync fallback to local cache:', error);
      });
    } catch (err) {
      console.warn('Firestore subscription error:', err);
      return () => {};
    }
  },

  // 2. রিয়েল-টাইমে কমিউনিটি এডস সিঙ্ক
  subscribeToUserAds: (callback: (ads: UserAd[]) => void) => {
    try {
      const q = collection(db, USER_ADS_COLLECTION);
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteAds = snapshot.docs.map(doc => doc.data() as UserAd);
          callback(remoteAds);
          try {
            localStorage.setItem('gentouch_user_ads', JSON.stringify(remoteAds));
          } catch {
            // ignore storage quota errors safely
          }
        }
      }, (error) => {
        console.warn('User ads sync fallback to local cache:', error);
      });
    } catch (err) {
      console.warn('Firestore subscription error:', err);
      return () => {};
    }
  },

  // 3. এডমিন সরাসরি অল প্রোডাক্টে নতুন প্রোডাক্ট সেভ করা (Undefined মুক্ত ও সুরক্ষিত)
  saveProduct: async (product: Product): Promise<void> => {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await setDoc(docRef, cleanData(product));
    } catch (error) {
      console.warn('Failed to save product to Firestore, using local fallback:', error);
    }
  },

  // 4. সাধারণ মেম্বারের বিজ্ঞাপন সেভ করা (Undefined মুক্ত ও সুরক্ষিত)
  saveUserAd: async (ad: UserAd): Promise<void> => {
    try {
      const docRef = doc(db, USER_ADS_COLLECTION, ad.id);
      await setDoc(docRef, cleanData(ad));
    } catch (error) {
      console.warn('Failed to save ad to Firestore, using local fallback:', error);
    }
  },

  // 5. কম্পিউটার বা মোবাইল যেকোনো ডিভাইস থেকে পার্মানেন্টলি ডিলিট করা
  deleteProductOrAd: async (id: string): Promise<void> => {
    try {
      // Products কালেকশন থেকে ডিলিট
      const productRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(productRef);
    } catch (error) {
      console.warn('Could not delete from products collection:', error);
    }

    try {
      // User Ads কালেকশন থেকেও ডিলিট
      const adRef = doc(db, USER_ADS_COLLECTION, id);
      await deleteDoc(adRef);
    } catch (error) {
      console.warn('Could not delete from ads collection:', error);
    }
  },

  // 6. অল প্রোডাক্ট থেকে নির্দিষ্ট প্রোডাক্ট ডিলিট করা
  deleteProduct: async (id: string): Promise<void> => {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(productRef);
    } catch (error) {
      console.warn('Error deleting product from Firestore:', error);
    }
  },

  // 7. ইউজার এড ডিলিট করা
  deleteUserAd: async (id: string): Promise<void> => {
    try {
      const adRef = doc(db, USER_ADS_COLLECTION, id);
      await deleteDoc(adRef);
    } catch (error) {
      console.warn('Error deleting ad from Firestore:', error);
    }
  },

  // 8. ক্লাউড থেকে সব প্রোডাক্ট সরাসরি লোড করা
  getProducts: async (): Promise<Product[]> => {
    try {
      const snapshot = await new Promise<any>((resolve) => {
        const q = collection(db, PRODUCTS_COLLECTION);
        const unsubscribe = onSnapshot(q, (s) => {
          unsubscribe();
          resolve(s);
        }, () => resolve({ empty: true, docs: [] }));
      });

      if (!snapshot.empty) {
        return snapshot.docs.map((d: any) => d.data() as Product);
      }
    } catch (e) {
      console.warn('Could not fetch cloud products:', e);
    }

    try {
      const local = localStorage.getItem('gentouch_products');
      if (local) return JSON.parse(local);
    } catch {
      // ignore
    }
    return [];
  }
};
