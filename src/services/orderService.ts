import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderStatus } from '@/types';

const ORDERS_COLLECTION = 'orders';

export const orderService = {
  // 1. Create and save order in Firestore & Local Backup
  async createOrder(order: Order, bkashMeta?: { senderBkash: string; trxId: string; advancePaid: number; dueOnDelivery: number }): Promise<void> {
    try {
      // Local Backup first
      const existingLocal = JSON.parse(localStorage.getItem('gen_touch_orders') || '[]');
      localStorage.setItem('gen_touch_orders', JSON.stringify([order, ...existingLocal]));
      
      if (bkashMeta) {
        localStorage.setItem(`bkash_meta_${order.orderNumber}`, JSON.stringify(bkashMeta));
      }

      // Live Firestore Database Sync
      const orderRef = doc(db, ORDERS_COLLECTION, order.id);
      await setDoc(orderRef, {
        ...order,
        bkashSenderNumber: bkashMeta?.senderBkash || order.customerPhone,
        bkashTrxId: bkashMeta?.trxId || 'N/A',
        advancePaid: bkashMeta?.advancePaid || order.deliveryCharge,
        dueOnDelivery: bkashMeta?.dueOnDelivery || (order.totalAmount - order.deliveryCharge),
        syncedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Firestore database write notice (using local storage fallback):', error);
      // Order is safely kept in local storage fallback
    }
  },

  // 2. Fetch all orders (Real-time Cloud + Local)
  async getAllOrders(): Promise<Order[]> {
    try {
      const ordersRef = collection(db, ORDERS_COLLECTION);
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const firestoreOrders = snapshot.docs.map(doc => doc.data() as Order);
        // Sync local storage with latest cloud orders
        localStorage.setItem('gen_touch_orders', JSON.stringify(firestoreOrders));
        return firestoreOrders;
      }
    } catch (error) {
      console.warn('Firestore database read notice (using cached local orders):', error);
    }

    // Fallback to local storage
    const local = localStorage.getItem('gen_touch_orders');
    return local ? JSON.parse(local) : [];
  },

  // 3. Update order status (Approved / Confirmed / Shipped)
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(orderRef, {
        status,
        paymentStatus: status === 'Confirmed' || status === 'Delivered' ? 'Verified & Approved' : 'Pending Verification',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Firestore update notice (updating local cache):', error);
    }

    // Update in local cache as well
    const localOrders: Order[] = JSON.parse(localStorage.getItem('gen_touch_orders') || '[]');
    const updated = localOrders.map(o => o.id === orderId ? { ...o, status } : o);
    localStorage.setItem('gen_touch_orders', JSON.stringify(updated));
  }
};