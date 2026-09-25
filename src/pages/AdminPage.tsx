import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Tag, 
  Plus, 
  Trash2, 
  ArrowLeft,
  X,
  CheckCircle,
  MessageSquare,
  Clock,
  PhoneCall,
  Megaphone,
  Layers,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COUPONS } from '@/data/initialData';
import type { OrderStatus } from '@/types';
import { Product, Order, Coupon } from '@/types';
import toast from 'react-hot-toast';

export const AdminPage: React.FC = () => {
  // Tabs: 'orders' | 'products' | 'coupons' | 'manage_posts'
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'manage_posts'>('orders');

  // Products State (Contains all uploaded / catalog products)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('gen_touch_custom_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Orders State (Loaded from localStorage)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('gen_touch_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ord-sample-1',
        orderNumber: 'GT-849201',
        userId: 'guest-1',
        customerName: 'Rahim Ahmed',
        customerEmail: 'rahim@gmail.com',
        customerPhone: '01711-223344',
        shippingAddress: {
          id: 'addr-1',
          fullName: 'Rahim Ahmed',
          phone: '01711-223344',
          streetAddress: 'House 14, Road 5, Dhanmondi',
          city: 'Dhaka (Inside Dhaka)',
          stateDivision: 'Dhaka',
          postalCode: '1205',
          isDefault: true,
        },
        items: [
          {
            productId: 'gt-prod-1',
            name: 'AcousticPro ANC Wireless Headphones',
            price: 3499,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
          }
        ],
        subtotal: 3499,
        discountAmount: 0,
        deliveryCharge: 80,
        totalAmount: 3579,
        appliedCoupon: undefined,
        paymentMethod: 'bKash (Delivery Charge Advance) + COD',
        paymentStatus: 'Pending Verification',
        status: 'Pending',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  });

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('gen_touch_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  // User Ads / Community Uploaded Posts State (sync with localStorage)
  const [userAds, setUserAds] = useState<any[]>(() => {
    const savedAds = localStorage.getItem('gen_touch_user_ads');
    return savedAds ? JSON.parse(savedAds) : [];
  });

  // Add Product Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('electronics');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('15');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');

  // Add Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('1000');

  // Filter/Search in Manage Posts tab
  const [postSearchQuery, setPostSearchQuery] = useState('');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gen_touch_custom_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gen_touch_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gen_touch_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('gen_touch_user_ads', JSON.stringify(userAds));
  }, [userAds]);

  // Handler: Add New Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice) {
      toast.error('Please enter product name and price');
      return;
    }

    const priceNum = Number(newProductPrice);
    const origPriceNum = newProductOriginalPrice ? Number(newProductOriginalPrice) : undefined;
    const discount = origPriceNum && origPriceNum > priceNum
      ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)
      : undefined;

    const newProd: Product = {
      id: `gt-custom-${Date.now()}`,
      name: newProductName.trim(),
      slug: newProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      sku: `GT-${Math.floor(1000 + Math.random() * 9000)}`,
      description: newProductDescription.trim() || 'Engineered for high performance and premium lifestyle.',
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercentage: discount,
      stock: Number(newProductStock) || 10,
      category: newProductCategory,
      images: [
        newProductImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
      ],
      specifications: [
        { key: 'Warranty', value: '1 Year Brand Warranty' },
        { key: 'Authenticity', value: '100% Genuine Box Pack' },
      ],
      rating: 5.0,
      reviewCount: 1,
      isFeatured: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductOriginalPrice('');
    setNewProductImage('');
    setNewProductDescription('');
    toast.success('Product added successfully!');
  };

  // Handler: Delete Product (from catalog)
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product removed');
    }
  };

  // Handler: Delete ANY Uploaded Post / Product (Dedicated Admin Action)
  const handleRemoveUploadedPost = (postId: string, postTitle: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে আপনি "${postTitle}" পোস্টটি ওয়েবসাইট থেকে স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      // Remove from products
      const updatedProducts = products.filter((p) => p.id !== postId);
      setProducts(updatedProducts);

      // Also remove from userAds if present
      const updatedAds = userAds.filter((ad) => ad.id !== postId);
      setUserAds(updatedAds);

      toast.success(`"${postTitle}" পোস্টটি সফলভাবে ওয়েবসাইট থেকে মুছে ফেলা হয়েছে!`);
    }
  };

  // Handler: Update Order Status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          paymentStatus: newStatus === 'Confirmed' || newStatus === 'Delivered' ? 'Verified & Approved' : o.paymentStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    }));
    toast.success(`Order status updated to "${newStatus}"`);
  };

  // Handler: Create Coupon
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newC: Coupon = {
      id: `coup-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: 'percentage',
      discountValue: Number(newCouponDiscount) || 10,
      minOrderAmount: Number(newCouponMinOrder) || 500,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 0,
      isActive: true,
    };

    setCoupons([newC, ...coupons]);
    setNewCouponCode('');
    toast.success(`Coupon ${newC.code} created!`);
  };

  // Filtered posts for Manage Posts tab
  const filteredPosts = products.filter((p) => 
    p.name.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(postSearchQuery.toLowerCase()))
  );

  // Metrics calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-neutral-100 py-8 px-4 sm:px-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-neutral-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-black text-white">GEN-TOUCH Command Center</h1>
              <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Admin Mode
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Verify customer bKash TrxID, approve orders, and manage inventory
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#13161c] border border-neutral-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Total Orders Value</span>
            <div className="text-xl font-bold text-white">৳{totalRevenue.toLocaleString()}</div>
            <span className="text-[11px] text-red-400 font-medium">From all active orders</span>
          </div>

          <div className="bg-[#13161c] border border-neutral-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Pending Verifications</span>
            <div className="text-xl font-bold text-white">{orders.length}</div>
            <span className="text-[11px] text-amber-400 font-medium">{pendingOrdersCount} orders waiting review</span>
          </div>

          <div className="bg-[#13161c] border border-neutral-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Active Products & Posts</span>
            <div className="text-xl font-bold text-white">{products.length}</div>
            <span className="text-[11px] text-neutral-400 font-medium">In store catalog</span>
          </div>

          <div className="bg-[#13161c] border border-neutral-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Helpline / Support</span>
            <div className="text-sm font-bold text-white font-mono">01310588979</div>
            <span className="text-[11px] text-emerald-400 font-medium">WhatsApp Business</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 space-x-6 text-sm font-bold overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'products'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'coupons'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>কুপন কোড ম্যানেজার</span>
          </button>

          {/* NEW OPTION: USER ADS ER PASE POST DLT / MANAGE TAB */}
          <button
            onClick={() => setActiveTab('manage_posts')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'manage_posts'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>আপলোড পোস্ট রিমুভ / ম্যানেজ ({products.length})</span>
          </button>
        </div>

        {/* ------------------------------------------- */}
        {/* TAB 1: ORDERS & BKASH VERIFICATION */}
        {/* ------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map((order) => {
              // Retrieve bKash payment meta if saved
              const bkashMeta = JSON.parse(localStorage.getItem(`bkash_meta_${order.orderNumber}`) || '{}');

              return (
                <div key={order.id} className="bg-[#13161c] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base font-mono">Order #{order.orderNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          order.status === 'Shipped' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                          order.status === 'Confirmed' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400 font-medium">Update Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg bg-[#181b22] font-semibold text-white outline-none focus:border-red-600"
                      >
                        <option value="Pending">Pending Verification</option>
                        <option value="Confirmed">Confirmed (Approved)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* bKash Payment Box (Verification Highlight) */}
                  <div className="bg-[#181b22] border border-red-900/60 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                        Customer bKash Transaction Details:
                      </span>
                      <div className="text-xs text-neutral-200">
                        Sender bKash No: <strong className="text-white font-mono">{bkashMeta.senderBkash || order.customerPhone}</strong>
                      </div>
                      <div className="text-xs text-neutral-200">
                        bKash TrxID: <strong className="text-red-400 font-mono text-sm uppercase">{bkashMeta.trxId || 'PENDING_INPUT'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-neutral-400 block">Advance Amount:</span>
                        <span className="text-sm font-black text-red-500">৳{(bkashMeta.advancePaid || order.deliveryCharge).toLocaleString()}</span>
                      </div>

                      {/* WhatsApp Quick Chat with Customer */}
                      <a
                        href={`https://wa.me/88${order.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.customerName)},%20this%20is%20Gen-Touch%20regarding%20your%20Order%20${order.orderNumber}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold rounded-lg text-xs flex items-center gap-1.5 transition-transform active:scale-95"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-black" />
                        <span>Chat Customer</span>
                      </a>
                    </div>
                  </div>

                  {/* Customer & Shipping Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-neutral-500 font-medium">Customer Details</span>
                      <div className="font-semibold text-white">{order.customerName}</div>
                      <div className="text-neutral-300 font-mono">{order.customerPhone}</div>
                      <div className="text-neutral-500">{order.customerEmail}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-neutral-500 font-medium">Shipping Address</span>
                      <div className="text-neutral-300">
                        {order.shippingAddress.streetAddress}, {order.shippingAddress.city}
                      </div>
                      <div className="text-red-400 font-semibold pt-1">
                        Method: {order.paymentMethod}
                      </div>
                    </div>

                    <div className="space-y-1 md:text-right">
                      <span className="text-neutral-500 font-medium">Order Total</span>
                      <div className="text-neutral-400">Delivery: ৳{order.deliveryCharge}</div>
                      <div className="text-base font-black text-white">
                        ৳{order.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Items in this Order */}
                  <div className="bg-[#101217] rounded-xl p-3 divide-y divide-neutral-800 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={item.image} alt="" className="w-7 h-7 rounded object-cover" />
                          <span className="font-medium text-white">{item.name} × {item.quantity}</span>
                        </div>
                        <span className="font-bold text-neutral-300">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------- */}
        {/* TAB 2: PRODUCTS CATALOG */}
        {/* ------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="bg-[#13161c] border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181b22] border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-800/40">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-xs">{p.name}</div>
                          <div className="text-[11px] text-neutral-500">SKU: {p.sku}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 uppercase text-red-400 font-semibold">{p.category}</td>
                      <td className="px-4 py-3 font-bold text-white">৳{p.price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          p.stock > 5 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------- */}
        {/* TAB 3: COUPONS */}
        {/* ------------------------------------------- */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#13161c] border border-neutral-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Create New Coupon</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="e.g. EID20"
                    className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg uppercase text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Discount (% Percentage)</label>
                  <input
                    type="number"
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Min Order Amount (৳)</label>
                  <input
                    type="number"
                    required
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                >
                  Create Coupon
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-[#13161c] border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-500 text-sm">{coupon.code}</span>
                      <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {coupon.discountValue}% OFF
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      Min order: ৳{coupon.minOrderAmount.toLocaleString()} • Status: {coupon.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCoupons(coupons.filter((c) => c.id !== coupon.id));
                      toast.success('Coupon removed');
                    }}
                    className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------- */}
        {/* TAB 4: NEW - আপলোড করা পোস্ট ডিলিট ও ম্যানেজ */}
        {/* ------------------------------------------- */}
        {activeTab === 'manage_posts' && (
          <div className="space-y-4">
            {/* Search & Notice Bar */}
            <div className="bg-[#13161c] border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>এখানে আপনি ওয়েবসাইটে আপলোড করা যেকোনো পোস্ট বা প্রোডাক্ট সরাসরি ডিলিট করতে পারবেন।</span>
              </div>
              <input
                type="text"
                value={postSearchQuery}
                onChange={(e) => setPostSearchQuery(e.target.value)}
                placeholder="পোস্টের নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
                className="w-full sm:w-64 px-3 py-1.5 text-xs bg-[#181b22] border border-neutral-700 rounded-lg text-white placeholder-neutral-500 outline-none focus:border-red-600"
              />
            </div>

            {/* Posts Grid View with Inside Details & Direct Delete Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.length === 0 ? (
                <div className="col-span-full bg-[#13161c] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400 text-xs">
                  কোনো পোস্ট পাওয়া যায়নি।
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#13161c] border border-neutral-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between space-y-3 shadow-lg hover:border-neutral-700 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Image & Basic Badge */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                        <img
                          src={post.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                          alt={post.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-red-400 border border-red-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {post.category}
                        </span>
                      </div>

                      {/* Content Inside the Post */}
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{post.name}</h4>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                          {post.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Post Pricing & Stock Details */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 block">মূল্য:</span>
                          <span className="font-black text-red-500 text-sm">৳{post.price.toLocaleString()}</span>
                          {post.originalPrice && (
                            <span className="text-[10px] text-neutral-500 line-through ml-1.5">৳{post.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block">স্টক:</span>
                          <span className="text-neutral-300 font-semibold">{post.stock || 0} টি</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Delete Action Button */}
                    <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveUploadedPost(post.id, post.name)}
                        className="w-full py-2 bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>পোস্টটি ডিলিট করুন (Remove Post)</span>
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD PRODUCT */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[#13161c] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="font-bold text-white text-base">Add New Product</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Ultra Carbon Sport Watch"
                    className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Selling Price (৳) *</label>
                    <input
                      type="number"
                      required
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="2499"
                      className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Original Price (৳)</label>
                    <input
                      type="number"
                      value={newProductOriginalPrice}
                      onChange={(e) => setNewProductOriginalPrice(e.target.value)}
                      placeholder="2999"
                      className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Category</label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600"
                    >
                      {INITIAL_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                      placeholder="20"
                      className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    placeholder="Key specifications and warranty details..."
                    className="w-full px-3 py-2 bg-[#181b22] border border-neutral-700 rounded-lg text-white outline-none focus:border-red-600 resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-md"
                  >
                    Publish Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};