import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, UserAd } from '../types';

const PRODUCTS_COLLECTION = 'products';
const USER_ADS_COLLECTION = 'user_ads';

export const productService = {
  // ১. রিয়েল-টাইমে অল প্রোডাক্ট সিঙ্ক (মোবাইল ও পিসিতে একই সাথে আপডেট হবে)
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
            // ignore storage errors
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

  // ২. রিয়েল-টাইমে কমিউনিটি এডস সিঙ্ক
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
            // ignore storage errors
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

  // ৩. এডমিন সরাসরি অল প্রোডাক্টে নতুন প্রোডাক্ট সেভ করা
  saveProduct: async (product: Product): Promise<void> => {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await setDoc(docRef, product);
    } catch (error) {
      console.warn('Failed to save product to Firestore, using local fallback:', error);
    }
  },

  // ৪. সাধারণ মেম্বারের বিজ্ঞাপন সেভ করা
  saveUserAd: async (ad: UserAd): Promise<void> => {
    try {
      const docRef = doc(db, USER_ADS_COLLECTION, ad.id);
      await setDoc(docRef, ad);
    } catch (error) {
      console.warn('Failed to save ad to Firestore, using local fallback:', error);
    }
  },

  // ৫. কম্পিউটার বা মোবাইল যেকোনো ডিভাইস থেকে পার্মানেন্টলি ডিলিট করা
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
  }
};
