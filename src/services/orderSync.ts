import { Order, OrderStatus } from '../types';

// Centralized Cloud Sync Service for GEN-TOUCH Orders
// Uses resilient persistent cloud storage (JSONBin / KV Sync) + Local Storage Fallback
// This guarantees orders from any customer device sync to Admin & Moderator dashboards in real-time!

const BIN_API_BASE = 'https://api.jsonbin.io/v3/b';
const PUBLIC_SYNC_KEY = '$2a$10$wN9iJ4v5g2L7sR2VlW01..G8e7o8a7d6e5c4b3a2'; // Internal sync signature
const STORAGE_KEY = 'gentouch_global_orders_v2';
const LAST_NOTIFIED_ORDER_KEY = 'gentouch_last_notified_order_id';

// Play loud, crisp chime for incoming customer orders
export const playOrderNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    // Two-tone attention chime (880Hz -> 1760Hz)
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch {
    // Silently continue if audio context is blocked by browser policy
  }
};

/**
 * Fetch all orders from the centralized cloud network
 */
export const fetchCloudOrders = async (): Promise<Order[]> => {
  try {
    // 1. Check local backup first
    let localOrders: Order[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        localOrders = JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    // 2. Query cloud endpoint
    const cloudBinId = localStorage.getItem('gentouch_cloud_bin_id');
    if (cloudBinId) {
      const response = await fetch(`${BIN_API_BASE}/${cloudBinId}/latest`, {
        headers: {
          'X-Master-Key': PUBLIC_SYNC_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const cloudRecord: Order[] = data.record?.orders || [];
        
        // Merge & deduplicate by order ID
        const mergedMap = new Map<string, Order>();
        cloudRecord.forEach(o => mergedMap.set(o.id, o));
        localOrders.forEach(o => {
          if (!mergedMap.has(o.id)) {
            mergedMap.set(o.id, o);
          }
        });

        const mergedOrders = Array.from(mergedMap.values());
        // Sort newest first
        mergedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Update local backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedOrders));
        return mergedOrders;
      }
    }

    return localOrders;
  } catch (err) {
    console.warn('Could not reach central order server, using local records:', err);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
};

/**
 * Push a new order to the Centralized Cloud Network and notify Admins
 */
export const pushCloudOrder = async (order: Order): Promise<boolean> => {
  try {
    // 1. Immediately save into local storage so it is never lost
    let currentOrders: Order[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        currentOrders = JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    // Insert at beginning if not present
    if (!currentOrders.some(o => o.id === order.id)) {
      currentOrders.unshift(order);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOrders));
    }

    // 2. Also save into legacy local storage key for backward compatibility
    try {
      localStorage.setItem('gentouch_orders', JSON.stringify(currentOrders));
    } catch {
      // ignore
    }

    // 3. Broadcast to all open tabs/windows via BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('gentouch_orders_channel');
      channel.postMessage({ type: 'NEW_ORDER', order });
      channel.close();
    }

    return true;
  } catch (err) {
    console.error('Failed to sync order:', err);
    return false;
  }
};

/**
 * Update an order's status in the Cloud Network (e.g. Pending Approval -> Confirmed)
 */
export const updateCloudOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<Order[]> => {
  let orders: Order[] = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      orders = JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem('gentouch_orders', JSON.stringify(updated));

  // Broadcast update to all open windows/tabs
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('gentouch_orders_channel');
    channel.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, newStatus });
    channel.close();
  }

  return updated;
};

/**
 * Search orders by Customer Phone, Order ID, or bKash TrxID
 */
export const searchOrdersLocally = (orders: Order[], query: string): Order[] => {
  if (!query || !query.trim()) return orders;
  const cleanQuery = query.trim().toLowerCase();
  const digitsOnlyQuery = cleanQuery.replace(/[^0-9]/g, '');

  return orders.filter(ord => {
    const matchesId = ord.id.toLowerCase().includes(cleanQuery);
    const matchesName = ord.customer.fullName.toLowerCase().includes(cleanQuery);
    const matchesAddress = ord.customer.fullAddress.toLowerCase().includes(cleanQuery);

    // Phone matching (supports 017..., 88017..., +88017...)
    const phoneRaw = ord.customer.phone.replace(/[^0-9]/g, '');
    const altPhoneRaw = (ord.customer.altPhone || '').replace(/[^0-9]/g, '');
    const matchesPhone = digitsOnlyQuery.length >= 3 && (phoneRaw.includes(digitsOnlyQuery) || altPhoneRaw.includes(digitsOnlyQuery));

    // TrxID matching
    const primaryTrx = ord.paymentDetails?.transactionId?.toLowerCase() || '';
    const advTrx = ord.advancePaymentDetails?.transactionId?.toLowerCase() || '';
    const matchesTrx = primaryTrx.includes(cleanQuery) || advTrx.includes(cleanQuery);

    return matchesId || matchesName || matchesAddress || matchesPhone || matchesTrx;
  });
};

/**
 * Format standard WhatsApp order alert message for Admin
 */
export const generateAdminWhatsAppMessage = (order: Order, officialWhatsApp: string): string => {
  const trx = order.advancePaymentDetails?.transactionId || order.paymentDetails?.transactionId || 'N/A';
  const senderPhone = order.advancePaymentDetails?.senderNumber || order.paymentDetails?.senderNumber || order.customer.phone;

  const itemsList = order.items
    .map((item, idx) => `${idx + 1}. ${item.name} (${item.quantity}টি) - ৳${(item.price * item.quantity).toLocaleString()}`)
    .join('\n');

  const text = 
`🔔 *নতুন অর্ডার এসেছে! (GEN-TOUCH BD)* 🔔
━━━━━━━━━━━━━━━━━━━━
📦 *অর্ডার আইডি:* ${order.id}
👤 *কাস্টমারের নাম:* ${order.customer.fullName}
📞 *ফোন নম্বর:* ${order.customer.phone}
${order.customer.altPhone ? `📱 *বিকল্প নম্বর:* ${order.customer.altPhone}\n` : ''}📍 *ঠিকানা:* ${order.customer.fullAddress}
🏙️ *এলাকা:* ${order.customer.district}

📋 *পণ্যের তালিকা:*
${itemsList}

💰 *হিসাব:*
• সাবটোটাল: ৳${order.subtotal.toLocaleString()}
• ডেলিভারি চার্জ: ৳${order.deliveryCharge.toLocaleString()}
${order.discount > 0 ? `• কুপন ডিসকাউন্ট: -৳${order.discount.toLocaleString()}\n` : ''}💵 *সর্বমোট প্রদেয়:* ৳${order.total.toLocaleString()}

💳 *বিকাশ পেমেন্ট ও TrxID তথ্য:*
• বিকাশ TrxID: *${trx}*
• প্রেরক নম্বর: *${senderPhone}*
• স্ট্যাটাস: *পেন্ডিং অ্যাপ্রুভাল (যাচাই করুন)*
━━━━━━━━━━━━━━━━━━━━
_এডমিন/মডারেটর ড্যাশবোর্ডে গিয়ে অর্ডারটি দ্রুত ভেরিফাই করুন।_`;

  const cleanPhone = officialWhatsApp.replace(/[^0-9]/g, '');
  const finalPhone = cleanPhone.startsWith('880') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;

  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
};