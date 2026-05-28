import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  User,
  Truck,
  Settings,
  Plus,
  Trash2,
  Check,
  MapPin,
  Phone,
  Grid,
  Sparkles,
  Tag,
  Users,
  Eye,
  LogOut,
  Sliders,
  DollarSign,
  Power,
  Store,
  ChevronRight,
  ShieldCheck,
  Layers,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquareCode
} from "lucide-react";
import { Category, Product, DeliveryBoy, Order, AdminSettings, OrderItem, PromoCode } from "./types";

export default function App() {
  // Navigation & Multi-Portal State
  const [currentPortal, setCurrentPortal] = useState<"customer" | "delivery" | "admin">("customer");

  // Global Sync States from server.ts
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  // Authentication states
  // 1. Customer
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerLoginNum, setCustomerLoginNum] = useState("");
  const [customerOtpInput, setCustomerOtpInput] = useState("");
  const [customerOtpSent, setCustomerOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [customerUser, setCustomerUser] = useState<{ mobile: string; name: string; loginNumber?: string; photo?: string; address?: string } | null>(() => {
    const saved = localStorage.getItem("sabzi_customer");
    return saved ? JSON.parse(saved) : null;
  });

  const [customerTab, setCustomerTab] = useState<"catalog" | "cart" | "history" | "profile">("catalog");
  const [profileForm, setProfileForm] = useState({
    name: "Customer Guest",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    address: ""
  });

  // 2. Delivery Boy
  const [deliveryUsername, setDeliveryUsername] = useState("");
  const [deliveryPassword, setDeliveryPassword] = useState("");
  const [activeDeliveryBoy, setActiveDeliveryBoy] = useState<DeliveryBoy | null>(() => {
    const saved = localStorage.getItem("sabzi_delivery_boy");
    return saved ? JSON.parse(saved) : null;
  });

  // 3. Admin
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("sabzi_admin_logged") === "true";
  });

  // UI States - Client side
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [productSearch, setProductSearch] = useState<string>("");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [cartPromo, setCartPromo] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  
  // Checkout particulars
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutLocation, setCheckoutLocation] = useState("");

  // Sync profile details to checkout variables when customerUser is loaded or changes
  useEffect(() => {
    if (customerUser) {
      setProfileForm({
        name: customerUser.name || "Customer Guest",
        photo: customerUser.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
        address: customerUser.address || ""
      });
      setCheckoutName(customerUser.name || "Customer Guest");
      setCheckoutAddress(customerUser.address || "");
    }
  }, [customerUser]);

  // Admin Portal Sub-navigation state
  const [adminTab, setAdminTab] = useState<"live-orders" | "catalog" | "delivery-team" | "settings" | "promo">("live-orders");

  // Admin Form input states
  // Add category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");

  // Add/Edit product form
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    unit: "kg",
    image: "",
    categoryId: "",
    inventory: "50"
  });

  // Add/Edit Delivery boy form
  const [editingDB, setEditingDB] = useState<DeliveryBoy | null>(null);
  const [dbForm, setDbForm] = useState({
    name: "",
    mobile: "",
    username: "",
    password: "",
    commissionRate: "10"
  });

  // Promo Code Form state
  const [promoForm, setPromoForm] = useState({
    code: "",
    discountPercent: "10",
    active: true
  });

  // Global toasts or notification message banners
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch full dataset on mount + when transitioning
  useEffect(() => {
    syncAllData();
  }, [currentPortal]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const syncAllData = async () => {
    try {
      const [catRes, prodRes, dbRes, orderRes, settingsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products"),
        fetch("/api/delivery-boys"),
        fetch("/api/orders"),
        fetch("/api/settings")
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (dbRes.ok) setDeliveryBoys(await dbRes.json());
      if (orderRes.ok) setOrders(await orderRes.json());
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings(sData);
        if (sData.deliveryLocations?.length > 0) {
          setCheckoutLocation(sData.deliveryLocations[0]);
        }
      }
    } catch (err) {
      console.error("Error synchronizing backend data:", err);
    }
  };

  // Authentications:
  // 1. Customer OTP request
  const handleSendCustomerOtp = async () => {
    if (!customerMobile || customerMobile.trim().length < 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: customerMobile })
      });
      const data = await res.json();
      if (res.ok) {
        setCustomerOtpSent(true);
        setSimulatedOtp(data.otp);
        showToast(`OTP Sent! Use simulated code: ${data.otp}`, "success");
      } else {
        showToast(data.error || "Failed sending OTP.", "error");
      }
    } catch (err) {
      showToast("Network connection error.", "error");
    }
  };

  // Customer OTP Verification
  const handleVerifyCustomerOtp = async () => {
    if (!customerOtpInput) {
      showToast("Please enter the verification OTP digit code.", "error");
      return;
    }
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: customerMobile, otp: customerOtpInput })
      });
      const data = await res.json();
      if (res.ok) {
        // Load custom profile details saved in localStorage specifically for this phone
        const savedProfileKey = `sabzi_profile_${customerMobile}`;
        const savedProfileRaw = localStorage.getItem(savedProfileKey);
        let profileData = savedProfileRaw ? JSON.parse(savedProfileRaw) : null;

        if (!profileData) {
          profileData = {
            mobile: customerMobile,
            loginNumber: "Guest",
            name: "Customer Guest",
            photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
            address: "Sector 10, Dwarka, New Delhi"
          };
          localStorage.setItem(savedProfileKey, JSON.stringify(profileData));
        } else {
          // ensure loginNumber is fallback Guest
          profileData.loginNumber = profileData.loginNumber || "Guest";
          localStorage.setItem(savedProfileKey, JSON.stringify(profileData));
        }

        setCustomerUser(profileData);
        localStorage.setItem("sabzi_customer", JSON.stringify(profileData));
        showToast("Authenticated. Welcome to Fresh Sabzi Hub!", "success");
        setCustomerTab("catalog"); // Reset active tab to catalog on login
      } else {
        showToast(data.error || "Incorrect OTP code. Try again.", "error");
      }
    } catch (err) {
      showToast("Could not verify OTP.", "error");
    }
  };

  // Customer log out
  const handleCustomerLogout = () => {
    setCustomerUser(null);
    setCustomerMobile("");
    setCustomerLoginNum("");
    setCustomerOtpInput("");
    setCustomerOtpSent(false);
    setCart([]);
    setAppliedPromo(null);
    localStorage.removeItem("sabzi_customer");
    showToast("Logged out of customer panel.", "success");
  };

  // 2. Delivery Boy Login
  const handleDeliveryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryUsername || !deliveryPassword) {
      showToast("Please enter both username and password.", "error");
      return;
    }

    const matchingBoy = deliveryBoys.find(
      (b) => b.username.toLowerCase() === deliveryUsername.toLowerCase() && b.password === deliveryPassword
    );

    if (matchingBoy) {
      setActiveDeliveryBoy(matchingBoy);
      localStorage.setItem("sabzi_delivery_boy", JSON.stringify(matchingBoy));
      showToast(`Welcome back, ${matchingBoy.name}!`, "success");
    } else {
      showToast("Invalid credentials. Try generic profiles Ramesh: 123 or Suresh: 456.", "error");
    }
  };

  const handleDeliveryLogout = () => {
    setActiveDeliveryBoy(null);
    setDeliveryUsername("");
    setDeliveryPassword("");
    localStorage.removeItem("sabzi_delivery_boy");
    showToast("Logged out of delivery partner panel.", "success");
  };

  // 3. Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const desiredUser = settings?.adminUsername || "admin";
    const desiredPass = settings?.adminPassword || "123";

    if (adminUsername === desiredUser && adminPassword === desiredPass) {
      setIsAdminAuthenticated(true);
      localStorage.setItem("sabzi_admin_logged", "true");
      showToast("Access granted to Administrator Panel.", "success");
    } else {
      showToast("Wrong administrator login name or password.", "error");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminUsername("");
    setAdminPassword("");
    localStorage.removeItem("sabzi_admin_logged");
    showToast("Logged out of Admin Portal.", "success");
  };

  // ================== CUSTOMER CART LOGIC ==================
  const handleAddToCart = (product: Product) => {
    if (product.inventory <= 0) {
      showToast(`${product.name} is currently out of stock.`, "error");
      return;
    }

    const existingIndex = cart.findIndex((item) => item.productId === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.inventory) {
        showToast(`Cannot buy more than available stock (${product.inventory} ${product.unit}).`, "error");
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          unit: product.unit
        }
      ]);
    }
    showToast(`Added ${product.name} to cart.`, "success");
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    const pInfo = products.find((p) => p.id === productId);
    const updated = cart
      .map((item) => {
        if (item.productId === productId) {
          const targetQty = item.quantity + delta;
          if (pInfo && targetQty > pInfo.inventory) {
            showToast(`Only ${pInfo.inventory} ${pInfo.unit} available in stock.`, "error");
            return item;
          }
          return { ...item, quantity: targetQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    setCart(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((i) => i.productId !== productId));
    showToast("Removed item from cart.", "success");
  };

  // Apply Coupon Promo Code
  const handleApplyPromo = () => {
    if (!cartPromo.trim()) return;
    const match = settings?.promoCodes.find((p) => p.code.toLowerCase() === cartPromo.toLowerCase() && p.active);
    if (match) {
      setAppliedPromo(match);
      showToast(`${match.code} Coupon successfully applied! (${match.discountPercent}% OFF)`, "success");
    } else {
      showToast("Invalid coupon code or expired promo coupon.", "error");
      setAppliedPromo(null);
    }
  };

  // Calculate price structures
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartDiscount = appliedPromo ? Math.round((cartSubtotal * appliedPromo.discountPercent) / 100) : 0;
  const rawDeliveryCharge = settings?.deliveryCharge ?? 25;
  const finalDeliveryCharge = cartSubtotal >= 500 ? 0 : rawDeliveryCharge; // Free delivery for orders over ₹500!
  const cartTotal = cartSubtotal - cartDiscount + finalDeliveryCharge;

  // Submit Customer Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName.trim() || !checkoutAddress.trim() || !customerUser?.mobile) {
      showToast("Please provide your delivery recipient address and name.", "error");
      return;
    }
    if (cart.length === 0) {
      showToast("Your shopping cart is empty.", "error");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkoutName,
          customerAddress: `${checkoutAddress}, ${checkoutLocation}`,
          customerMobile: customerUser.mobile,
          items: cart,
          subtotal: cartSubtotal,
          deliveryCharge: finalDeliveryCharge,
          discount: cartDiscount,
          total: cartTotal
        })
      });

      const data = await response.json();
      if (response.ok) {
        showToast("Your fresh grocery order was placed successfully!", "success");
        setCart([]);
        setAppliedPromo(null);
        setCartPromo("");
        // Keep name and address filled based on profile default
        syncAllData();
        setCustomerTab("history"); // Transition customer to Bookings view professionally
      } else {
        showToast(data.error || "Failed to create order.", "error");
      }
    } catch (err) {
      showToast("Failed to place order over network.", "error");
    }
  };

  // ================== DELIVERY PANEL ACTION REGISTER ==================
  const handleMarkOrderDelivered = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Delivered" })
      });
      if (response.ok) {
        showToast("Order marked as DELIVERED successfully! Good job.", "success");
        syncAllData();
      } else {
        showToast("Could not update order status.", "error");
      }
    } catch (err) {
      showToast("Network error updating status.", "error");
    }
  };

  // ================== ADMIN PANEL CRUD CALLS ==================

  // Store setting update
  const handleUpdateStoreSettings = async (updates: Partial<AdminSettings>) => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        showToast("Settings updated successfully.", "success");
        syncAllData();
      } else {
        showToast("Failed to update general settings.", "error");
      }
    } catch (err) {
      showToast("Network error updating settings.", "error");
    }
  };

  // Assign Delivery boy to a pending order
  const handleAssignDeliveryBoy = async (orderId: string, dBoyId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryBoyId: dBoyId })
      });
      if (response.ok) {
        showToast(dBoyId === "" ? "Order returned to unallocated list." : "Delivery partner assigned successfully!", "success");
        syncAllData();
      } else {
        showToast("Failed to assign order.", "error");
      }
    } catch (err) {
      showToast("Error connecting to server.", "error");
    }
  };

  // Categories CRUD
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatImage) {
      showToast("Provide both Name and Photo URL.", "error");
      return;
    }
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, image: newCatImage })
      });
      if (response.ok) {
        showToast("New category created successfully!", "success");
        setNewCatName("");
        setNewCatImage("");
        syncAllData();
      } else {
        showToast("Failed to add category.", "error");
      }
    } catch (err) {
      showToast("Network error creating category.", "error");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (response.ok) {
        showToast("Category has been removed.", "success");
        syncAllData();
      } else {
        showToast("Error deleting category.", "error");
      }
    } catch (err) {
      showToast("Server error.", "error");
    }
  };

  // Products CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, price, unit, image, categoryId, inventory } = productForm;
    if (!name || !price || !unit || !image || !categoryId) {
      showToast("All product details must be completed.", "error");
      return;
    }

    const payload = {
      name,
      price: Number(price),
      unit,
      image,
      categoryId,
      inventory: Number(inventory || 0)
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(editingProduct ? "Product details altered!" : "New product published and in-stock!", "success");
        setEditingProduct(null);
        setProductForm({ name: "", price: "", unit: "kg", image: "", categoryId: "", inventory: "50" });
        syncAllData();
      } else {
        showToast("Failed saving product.", "error");
      }
    } catch (err) {
      showToast("Server communication error.", "error");
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: String(prod.price),
      unit: prod.unit,
      image: prod.image,
      categoryId: prod.categoryId,
      inventory: String(prod.inventory)
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Remove this product from active catalog?")) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (response.ok) {
        showToast("Product deleted.", "success");
        syncAllData();
      } else {
        showToast("Error deleting product.", "error");
      }
    } catch (err) {
      showToast("Network error.", "error");
    }
  };

  // Delivery Boy CRUD
  const handleSaveDeliveryBoy = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, mobile, username, password, commissionRate } = dbForm;
    if (!name || !mobile || !username) {
      showToast("Name, mobile, and username are mandatory.", "error");
      return;
    }

    const payload = {
      name,
      mobile,
      username,
      password: password || undefined,
      commissionRate: Number(commissionRate || 10)
    };

    try {
      const url = editingDB ? `/api/delivery-boys/${editingDB.id}` : "/api/delivery-boys";
      const method = editingDB ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(editingDB ? "Delivery boy registration modified." : "New delivery boy account live!", "success");
        setEditingDB(null);
        setDbForm({ name: "", mobile: "", username: "", password: "", commissionRate: "10" });
        syncAllData();
      } else {
        showToast("Error committing Delivery Boy profile.", "error");
      }
    } catch (err) {
      showToast("Server request error.", "error");
    }
  };

  const handleEditDBClick = (boy: DeliveryBoy) => {
    setEditingDB(boy);
    setDbForm({
      name: boy.name,
      mobile: boy.mobile,
      username: boy.username,
      password: boy.password || "",
      commissionRate: String(boy.commissionRate)
    });
  };

  const handleDeleteDB = async (id: string) => {
    if (!window.confirm("Deactivate and remove this delivery boy?")) return;
    try {
      const response = await fetch(`/api/delivery-boys/${id}`, { method: "DELETE" });
      if (response.ok) {
        showToast("Delivery partner removed.", "success");
        syncAllData();
      } else {
        showToast("Delete request failed.", "error");
      }
    } catch (err) {
      showToast("Network connection issue.", "error");
    }
  };

  // Promo Coupon CRUD
  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code.trim() || !promoForm.discountPercent) {
      showToast("Enter a coupon code and positive percent discount amount.", "error");
      return;
    }

    const updatedCodes = [...(settings?.promoCodes || [])];
    const existingIdx = updatedCodes.findIndex(
      (c) => c.code.toLowerCase() === promoForm.code.trim().toLowerCase()
    );

    const newPromo: PromoCode = {
      code: promoForm.code.trim().toUpperCase(),
      discountPercent: Number(promoForm.discountPercent),
      active: promoForm.active
    };

    if (existingIdx > -1) {
      updatedCodes[existingIdx] = newPromo;
    } else {
      updatedCodes.push(newPromo);
    }

    await handleUpdateStoreSettings({ promoCodes: updatedCodes });
    setPromoForm({ code: "", discountPercent: "15", active: true });
    showToast(`Promo coupon ${newPromo.code} registered!`, "success");
  };

  const handleTogglePromoStatus = async (code: string) => {
    const updatedCodes = (settings?.promoCodes || []).map((c) => {
      if (c.code === code) {
        return { ...c, active: !c.active };
      }
      return c;
    });
    await handleUpdateStoreSettings({ promoCodes: updatedCodes });
    showToast(`Promo state updated for ${code}.`, "success");
  };

  // Helper selectors
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === "all" || prod.categoryId === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myOrders = orders.filter((o) => o.customerMobile === customerUser?.mobile);

  // Delivery partner calculations
  const assignedDeliveryOrders = activeDeliveryBoy
    ? orders.filter((o) => o.deliveryBoyId === activeDeliveryBoy.id)
    : [];

  const completedDeliveryOrders = activeDeliveryBoy
    ? orders.filter((o) => o.deliveryBoyId === activeDeliveryBoy.id && o.status === "Delivered")
    : [];

  // Commission is based on Subtotal strictly to stay independent of deliveries fees & discounts
  const personalCommissionRate = activeDeliveryBoy?.commissionRate || 10;
  const completedDeliveriesSubtotal = completedDeliveryOrders.reduce((sum, ord) => sum + ord.subtotal, 0);
  const totalEarnedCommission = Math.round((completedDeliveriesSubtotal * personalCommissionRate) / 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* GLOBAL SYSTEM TOAST POPUPS */}
      {toastMessage && (
        <div id="status-toast" className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 ${
          toastMessage.type === "success" 
            ? "bg-emerald-600 text-white border border-emerald-500" 
            : "bg-rose-600 text-white border border-rose-500"
        }`}>
          {toastMessage.type === "success" ? <CheckCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* TOP LEVEL GLOBAL SYSTEM PORTAL SWITCHER */}
      <div id="portal-switcher-rail" className="bg-slate-900 text-slate-100 py-2.5 px-4 sticky top-0 z-40 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#a3e635] font-bold uppercase">
              PORTAL CONTROL RAILS:
            </span>
            <span className="text-xs text-slate-400">
              Select dashboard to view or simulate action
            </span>
          </div>

          <div className="flex bg-slate-850 p-1 rounded-xl border border-slate-700/80">
            <button
              id="switch-customer-portal"
              onClick={() => setCurrentPortal("customer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                currentPortal === "customer"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Panel</span>
            </button>
            <button
              id="switch-delivery-portal"
              onClick={() => setCurrentPortal("delivery")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                currentPortal === "delivery"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery Boy Panel</span>
            </button>
            <button
              id="switch-admin-portal"
              onClick={() => setCurrentPortal("admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                currentPortal === "admin"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Control Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* CORE LOGO HEADER */}
      <header className="bg-white border-b border-gray-100 select-none py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-500 flex items-center justify-center text-white shadow-md shadow-emerald-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-emerald-600 font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                100% Organic & Direct
              </span>
              <h1 className="text-2xl font-black font-display text-slate-900 tracking-tight">
                Fresh Sabzi Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 font-mono bg-slate-50 border border-gray-200/50 p-2 rounded-xl">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <Store className="w-4 h-4" />
              <span>Store is:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] text-white uppercase ${settings?.storeOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {settings?.storeOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            <span>•</span>
            <div>
              <span>Dial Order: </span>
              <span className="font-semibold text-slate-800">{settings?.storePhone || "9988776600"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* RENDER DYNAMIC PANELS */}
      <div className="flex-1 pb-16">
        
        {/* ======================= PORTAL: CUSTOMER ======================= */}
        {currentPortal === "customer" && (
          <div>
            {!customerUser ? (
              // Customer Login View with Hindi tagline & 3 requirements: login number, customer mobile, and OTP
              <div id="customer-login-view" className="max-w-md mx-auto my-12 px-4 animate-fade-in">
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-lime-400"></div>
                  
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                    <ShoppingBag className="w-8 h-8" />
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                    Welcome to Fresh Sabzi Hub
                  </h2>
                  
                  {/* Hindi tagline prominently in elegant green display typography */}
                  <div className="my-4 py-2 border-y border-emerald-100/60">
                    <p className="text-emerald-700 font-bold italic text-sm sm:text-base tracking-wide">
                      "ताज़ी और फ्रेश सब्जी, सीधे खेत से आपके घर तक!"
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                    To log in, please authenticate with your registered mobile phone and secure OTP verification code.
                  </p>

                  <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        1. Customer Mobile Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-sm text-gray-400 font-bold phone-prefix">
                          +91
                        </span>
                        <input
                          id="customer-login-phone"
                          type="text"
                          value={customerMobile}
                          onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Enter 10-digit phone number"
                          className="w-full bg-slate-50/80 rounded-xl border border-gray-200 pl-12 pr-4 py-2.5 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {!customerOtpSent ? (
                      <button
                        id="customer-send-otp-btn"
                        onClick={handleSendCustomerOtp}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold tracking-wide transition shadow-lg shadow-emerald-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Request Secure OTP Code</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="space-y-4 pt-1 animate-fade-in">
                        {/* Simulation OTP display */}
                        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 mb-3 flex items-start gap-2.5">
                          <MessageSquareCode className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold block">OTP Verification SMS Gateway:</span>
                            <span>A secured OTP has been generated for +91 {customerMobile}: </span>
                            <strong className="font-mono text-sm tracking-wider text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded block mt-1 w-fit">{simulatedOtp}</strong>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            2. Enter Verified OTP Code
                          </label>
                          <input
                            id="customer-otp-value"
                            type="text"
                            value={customerOtpInput}
                            onChange={(e) => setCustomerOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6 digit OTP"
                            className="w-full bg-slate-50/80 rounded-xl border border-gray-200 px-4 py-2.5 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition animate-pulse"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            id="customer-verify-btn"
                            onClick={handleVerifyCustomerOtp}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold tracking-wide transition shadow-md cursor-pointer"
                          >
                            Verify Credentials & Login
                          </button>
                          <button
                            onClick={() => setCustomerOtpSent(false)}
                            className="px-3 border border-gray-205 text-xs text-gray-500 rounded-xl hover:bg-gray-50 font-medium"
                          >
                            Edit Phone
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-5 border-t border-gray-150 text-[10px] text-gray-400 font-mono tracking-wider uppercase">
                    🔒 Secured Bank-Grade OTP Gateway
                  </div>
                </div>
              </div>
            ) : (
              // Active Customer panel with distinct separate options: Shop, Cart, History, and Profile
              <div id="customer-shop-interface" className="max-w-7xl mx-auto px-4 mt-6 animate-fade-in text-left">
                
                {/* Greeting header banner containing beautiful imagery, details and Hindi tagline */}
                <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-850 text-white rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-lg border border-emerald-800/20 select-none">
                  <div className="absolute right-0 bottom-0 opacity-15 translate-x-1/4 translate-y-1/4 pointer-events-none">
                    <ShoppingBag className="w-80 h-80 text-white pointer-events-none" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                      {/* Customer Info badging */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={profileForm.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"} 
                          alt="Customer Profile" 
                          className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400/50 shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                            Logged in: {profileForm.name}
                          </span>
                          <span className="text-xs text-emerald-100 font-mono font-bold block mt-0.5">
                            ID: #SBZ-{customerUser.loginNumber || "1001"}
                          </span>
                        </div>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black font-display mt-3 tracking-tight">
                        Fresh veggies & wholesome organic greens directly from rural farm fields
                      </h2>
                      
                      {/* In-app Hindi tagline */}
                      <p className="text-[#a3e635] font-bold text-sm sm:text-base italic mt-1 bg-emerald-950/30 w-fit px-2.5 py-0.5 rounded-lg border border-emerald-400/10">
                        "ताज़ी और फ्रेश सब्जी, सीधे खेत से आपके घर तक।"
                      </p>

                      <p className="text-xs text-emerald-200 mt-2">
                        Get free instant delivery on orders exceeding <strong className="text-[#a3e635]">₹500</strong>! Orders below ₹500 incur standard delivery fee settings.
                      </p>
                    </div>

                    <div className="flex flex-wrap md:flex-col items-start gap-2.5 shrink-0 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5 bg-black/15 text-xs px-3 py-1.5 rounded-xl border border-white/10 font-mono w-full sm:w-auto">
                        <Phone className="w-3.5 h-3.5 text-[#a3e635]" />
                        <span>Phone: +91 {customerUser.mobile}</span>
                      </div>
                      <button
                        onClick={handleCustomerLogout}
                        className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs px-3 py-2 rounded-xl font-bold tracking-wide transition flex items-center justify-center gap-1.5 border border-white/10 w-full cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-navigation tabs: separating categories from shopping bag and order records */}
                <div className="flex bg-white rounded-2xl border border-gray-200 p-1.5 shadow-sm mb-6 max-w-lg mx-auto sm:max-w-none select-none">
                  <button
                    id="customer-tab-catalog"
                    onClick={() => setCustomerTab("catalog")}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition duration-200 tracking-wide cursor-pointer ${
                      customerTab === "catalog"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline">Shop Produce</span>
                    <span className="inline sm:hidden">Shop</span>
                  </button>
                  
                  <button
                    id="customer-tab-cart"
                    onClick={() => setCustomerTab("cart")}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition duration-200 tracking-wide relative cursor-pointer ${
                      customerTab === "cart"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">My Basket</span>
                    <span className="inline sm:hidden">Cart</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black font-mono w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shrink-0 animate-bounce">
                        {cart.length}
                      </span>
                    )}
                  </button>

                  <button
                    id="customer-tab-history"
                    onClick={() => setCustomerTab("history")}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition duration-200 tracking-wide cursor-pointer ${
                      customerTab === "history"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Order History</span>
                    <span className="inline sm:hidden">History</span>
                    {myOrders.length > 0 && (
                      <span className="bg-slate-150 text-slate-700 font-mono text-[9px] px-1.5 py-0.5 rounded-md font-bold hidden sm:inline ml-1">
                        {myOrders.length}
                      </span>
                    )}
                  </button>

                  <button
                    id="customer-tab-profile"
                    onClick={() => setCustomerTab("profile")}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition duration-200 tracking-wide cursor-pointer ${
                      customerTab === "profile"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">My Profile</span>
                    <span className="inline sm:hidden">Profile</span>
                  </button>
                </div>


                {/* RENDER ACTIVE CUSTOMER TAB DYNAMICS */}
                {customerTab === "catalog" && (
                  <div className="space-y-6">

                {/* Categories Pills bar */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 select-none">
                    Browse Categories
                  </h3>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
                        selectedCategory === "all"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                      <span>All Items</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2.5 ${
                          selectedCategory === cat.id
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <img src={cat.image} alt={cat.name} className="w-4.5 h-4.5 object-cover rounded-md" />
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Responsive catalog produce grid list */}
                <div className="space-y-6">
                  
                  {/* Live Search controls */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input
                      type="search"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search fresh farm vegetables, crisp apples, pure paneer..."
                      className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder-gray-400"
                    />
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center text-gray-500 max-w-md mx-auto">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-base font-semibold text-slate-705">No fresh items found</p>
                      <p className="text-xs text-gray-400 mt-1">Try seeking a different name or checking other category filters.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {filteredProducts.map((prod) => {
                          const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Produce";
                          const isOutOfStock = prod.inventory <= 0;
                          return (
                            <div key={prod.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group">
                              <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                                />
                                <span className="absolute top-2.5 left-2.5 bg-black/50 text-white font-mono text-[9px] px-2 py-0.5 rounded backdrop-blur-xs">
                                  {catName}
                                </span>
                                {isOutOfStock ? (
                                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="bg-rose-600 text-white text-xs font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow-sm">
                                      Out Of Stock
                                    </span>
                                  </div>
                                ) : prod.inventory < 10 ? (
                                  <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                                    Only {prod.inventory} left
                                  </span>
                                ) : null}
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-bold text-slate-800 text-base tracking-tight leading-tight mb-1">
                                    {prod.name}
                                  </h4>
                                  <p className="text-xs text-gray-400 font-medium">unit: {prod.unit}</p>
                                </div>

                                <div className="pt-4 mt-4 border-t border-gray-55 flex items-center justify-between">
                                  <div>
                                    <span className="text-indigo-900 font-extrabold text-lg">
                                      ₹{prod.price}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold font-mono"> / {prod.unit}</span>
                                  </div>

                                  <button
                                    onClick={() => handleAddToCart(prod)}
                                    disabled={isOutOfStock}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                      isOutOfStock 
                                        ? "bg-slate-150 text-slate-400 cursor-not-allowed" 
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white"
                                    }`}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                    {/* Floating Bottom Basket jump button which appears if items are added */}
                    {cart.length > 0 && (
                      <div className="fixed bottom-6 right-6 z-30 animate-bounce">
                        <button
                          type="button"
                          onClick={() => setCustomerTab("cart")}
                          className="bg-emerald-600 text-white font-bold text-sm px-5 py-3.5 rounded-full shadow-2xl shadow-emerald-950 border-2 border-white flex items-center gap-2 hover:bg-emerald-700 transition cursor-pointer font-sans"
                        >
                          <ShoppingCart className="w-5 h-5 pointer-events-none animate-pulse" />
                          <span>View Basket ({cart.length} items • ₹{cartTotal})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}


                {/* TAB: MY PORTAL BASKET & ORDER CHECKOUT */}
                {customerTab === "cart" && (
                      <div className="animate-fade-in text-left">
                    {cart.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto shadow-sm my-6 select-none">
                        <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                          <ShoppingCart className="w-8 h-8 pointer-events-none" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Your Basket is Empty</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-6 max-w-xs mx-auto font-sans">
                          You haven't added any fresh farm produce to your basket yet. Return to catalog to select products.
                        </p>
                        <button
                          onClick={() => setCustomerTab("catalog")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                        >
                          Return to Catalog
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Basket Items and Adjusters */}
                        <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                          <div className="flex items-center justify-between border-b border-gray-150 pb-3 select-none">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                              <ShoppingBag className="w-5 h-5 text-emerald-600" />
                              <span>Current Grocery Items ({cart.length})</span>
                            </h3>
                            <button
                              onClick={() => {
                                setCart([]);
                                showToast("Cart cleared completely.", "success");
                              }}
                              className="text-xs text-rose-600 font-bold hover:underline cursor-pointer font-sans"
                            >
                              Clear All
                            </button>
                          </div>

                          <div className="divide-y divide-gray-100 text-left">
                            {cart.map((item) => {
                              const pInfo = products.find(p => p.id === item.productId);
                              return (
                                <div key={item.productId} className="py-3.5 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-gray-100 select-none">
                                      <img 
                                        src={pInfo?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300"} 
                                        alt={item.productName} 
                                        className="w-full h-full object-cover pointer-events-none"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-850 leading-tight">{item.productName}</h4>
                                      <p className="text-xs text-gray-400 font-mono">₹{item.price} / per {item.unit}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    {/* Small numeric quantity modifier */}
                                    <div className="flex items-center border border-gray-200 rounded-xl bg-slate-50 shrink-0 select-none">
                                      <button
                                        onClick={() => handleUpdateCartQuantity(item.productId, -1)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-105 rounded-l-xl transition font-black cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-xs font-mono font-bold text-slate-800">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => handleUpdateCartQuantity(item.productId, 1)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-105 rounded-r-xl transition font-black cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>

                                    {/* Price and remove item */}
                                    <span className="font-bold text-slate-850 w-16 text-right shrink-0 font-mono text-sm hidden sm:inline">
                                      ₹{item.price * item.quantity}
                                    </span>

                                    <button
                                      onClick={() => handleRemoveFromCart(item.productId)}
                                      className="text-gray-400 hover:text-rose-600 p-1 transition cursor-pointer"
                                      title="Remove from basket"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Coupon Promo Module */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-150/70 mt-6 space-y-2">
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider select-none">
                              <Tag className="w-4 h-4 text-emerald-600" />
                              <span>Have a promotional coupon?</span>
                            </span>
                            
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={cartPromo}
                                onChange={(e) => setCartPromo(e.target.value.toUpperCase())}
                                placeholder="E.g. SABZI15, OFF10"
                                className="bg-white rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none transition flex-1 font-mono text-slate-700"
                              />
                              <button
                                onClick={handleApplyPromo}
                                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                              >
                                Apply Coupon
                              </button>
                            </div>

                            {appliedPromo && (
                              <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-850 p-2.5 rounded-lg border border-emerald-100">
                                <span className="font-semibold">{appliedPromo.code} coupon applied successfully!</span>
                                <span className="font-bold font-mono">-{appliedPromo.discountPercent}% OFF</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order breakdown and actual checkout recipient form */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col justify-between">
                          {/* Receipt Balance Summary */}
                          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-gray-105 pb-2 flex items-center justify-between select-none">
                              <span>Billing Balance Sheet</span>
                              <span className="text-xs font-mono font-bold text-slate-400">₹INR</span>
                            </h3>

                            <div className="space-y-2.5 font-mono text-xs text-gray-500">
                              <div className="flex justify-between">
                                <span>Produce Subtotal:</span>
                                <span className="font-bold text-slate-800">₹{cartSubtotal}</span>
                              </div>
                              {cartDiscount > 0 && (
                                <div className="flex justify-between text-emerald-700 font-medium">
                                  <span>Coupon Discount:</span>
                                  <span>-₹{cartDiscount}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span>Logistics Delivery Charge:</span>
                                {finalDeliveryCharge === 0 ? (
                                  <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-sans">
                                    Waived (Free)
                                  </span>
                                ) : (
                                  <span className="font-bold text-slate-800">₹{finalDeliveryCharge}</span>
                                )}
                              </div>
                              {finalDeliveryCharge > 0 && (
                                <p className="text-[10px] text-amber-600 text-right font-sans italic pt-0.5 select-none font-bold">
                                  Add ₹{500 - cartSubtotal} more for automatic waiver!
                                </p>
                              )}
                              
                              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-slate-900 font-black text-sm">
                                <span className="font-sans">Grand Payable Total:</span>
                                <span className="text-emerald-800 text-base font-bold font-mono">₹{cartTotal}</span>
                              </div>
                            </div>
                          </div>

                          {/* Shipping Recipient Details Card */}
                          <form onSubmit={handlePlaceOrder} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 text-left">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 select-none text-left">
                              <MapPin className="w-4 h-4 text-emerald-600" />
                              <span>Recipient Delivery Details</span>
                            </h3>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 select-none font-sans">
                                  Recipient Full Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={checkoutName}
                                  onChange={(e) => setCheckoutName(e.target.value)}
                                  placeholder="E.g. Ramesh Kumar"
                                  className="w-full bg-slate-50 rounded-lg border border-gray-250 px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white transition font-sans text-slate-850"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-widest mb-1 select-none font-sans">
                                  Street Address, Landmark & Sector
                                </label>
                                <textarea
                                  required
                                  rows={3}
                                  value={checkoutAddress}
                                  onChange={(e) => setCheckoutAddress(e.target.value)}
                                  placeholder="E.g. Block C, Flat No. 402, Green Fields Residency"
                                  className="w-full bg-slate-50 rounded-lg border border-gray-250 px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white transition resize-none text-slate-850"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-widest mb-1 select-none font-sans">
                                  Select delivery Zone location
                                </label>
                                {settings?.deliveryLocations && settings.deliveryLocations.length > 0 ? (
                                  <select
                                    value={checkoutLocation}
                                    onChange={(e) => setCheckoutLocation(e.target.value)}
                                    className="w-full bg-slate-50 rounded-lg border border-gray-250 px-3 py-2 text-xs font-bold focus:outline-none focus:bg-white transition text-slate-850"
                                  >
                                    {settings.deliveryLocations.map((loc, index) => (
                                      <option key={index} value={loc}>
                                        {loc} Zone
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    required
                                    value={checkoutLocation}
                                    onChange={(e) => setCheckoutLocation(e.target.value)}
                                    placeholder="Enter your location town (e.g. Dwarka Sector 10)"
                                    className="w-full bg-slate-50 rounded-lg border border-gray-250 px-3 py-2 text-xs font-bold focus:outline-none focus:bg-white transition text-slate-850"
                                  />
                                )}
                              </div>
                            </div>

                            <button
                              type="submit"
                              id="customer-confirm-checkout-btn"
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wide transition shadow-lg shadow-emerald-50 flex items-center justify-center gap-1.5 cursor-pointer outline-none border-none mt-4 text-center block font-sans"
                            >
                              <ShieldCheck className="w-4 h-4 pointer-events-none" />
                              <span>Confirm Booking & Place Order (₹{cartTotal})</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: BOOKING ORDER LOG RECORDS (HISTORY) */}
                {customerTab === "history" && (
                  <div className="animate-fade-in space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-800 font-display text-lg tracking-tight">
                      My Booking History
                    </h3>
                  </div>

                  {myOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-sm">You haven't placed any bookings yet.</p>
                      <p className="text-xs text-gray-400 mt-0.5">Your live active orders will register here immediately after booking checkout.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.map((ord) => (
                        <div key={ord.id} className="p-5 rounded-3xl border border-gray-150/70 hover:border-emerald-300 transition bg-white shadow-xs space-y-5 text-left">
                          {/* TOP SECTION: DETAILS & ACTION */}
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                  {ord.id}
                                </span>
                                <span className="text-xs text-gray-400 font-medium font-mono">
                                  Placed on: {ord.createdAt}
                                </span>
                              </div>

                              <div className="space-y-0.5">
                                <p className="text-xs text-gray-500 font-bold">Deliver To: {ord.customerName}</p>
                                <p className="text-xs text-gray-400 truncate max-w-md">{ord.customerAddress}</p>
                              </div>

                              {/* Order items line summary */}
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700 pt-1">
                                <strong>Items:</strong>
                                {ord.items.map((i, idx3) => (
                                  <span key={idx3} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                                    {i.productName} ({i.quantity} {i.unit})
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col md:items-end justify-between text-right shrink-0">
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-widest mb-1">
                                  Delivery Boy Assigned
                                </span>
                                <span className="text-xs font-bold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                                  {ord.deliveryBoyName ? `🚴 ${ord.deliveryBoyName}` : "Waiting Dispatch..."}
                                </span>
                              </div>

                              <div className="mt-4 md:mt-0 flex items-center gap-3">
                                <div className="text-left md:text-right">
                                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-widest">
                                    Billing Total
                                  </span>
                                  <span className="font-semibold text-sm text-indigo-900">₹{ord.total}</span>
                                </div>

                                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border tracking-wide uppercase ${
                                  ord.status === "Delivered"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                    : ord.status === "Assigned"
                                    ? "bg-yellow-50 border-yellow-101 text-yellow-700 animate-pulse"
                                    : "bg-blue-50 border-blue-105 text-blue-700"
                                }`}>
                                  {ord.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* BOTTOM SECTION: VISUAL STEPS PROGRESS BAR */}
                          <div className="border-t border-gray-100 pt-5">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-widest mb-4">
                              Real-Time Shipping Status
                            </span>
                            <div className="relative">
                              {/* Background Line */}
                              <div className="absolute top-[18px] left-[16%] right-[16%] h-[3px] bg-slate-100 -translate-y-1/2 rounded-full pointer-events-none">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{
                                    width: ord.status === "Delivered" ? "100%" : ord.status === "Assigned" ? "50%" : "0%"
                                  }}
                                />
                              </div>

                              {/* Stepper Nodes */}
                              <div className="relative flex justify-between items-start z-10">
                                {/* Step 1: Placed */}
                                <div className="flex flex-col items-center text-center w-1/3">
                                  <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-emerald-50 border-emerald-500 text-emerald-600 shadow-xs ring-4 ring-emerald-50/50">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-800 mt-2 font-sans">Booking Placed</span>
                                  <span className="text-[9px] text-emerald-600 font-bold select-none font-sans uppercase tracking-wider">Success</span>
                                </div>

                                {/* Step 2: On The Way */}
                                <div className="flex flex-col items-center text-center w-1/3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                    ord.status === "Assigned" || ord.status === "Delivered"
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs ring-4 ring-emerald-50/50"
                                      : "bg-white border-slate-200 text-slate-400"
                                  }`}>
                                    <Truck className={`w-4 h-4 ${ord.status === "Assigned" ? "animate-bounce" : ""}`} />
                                  </div>
                                  <span className={`text-[11px] font-bold mt-2 font-sans transition-colors ${
                                    ord.status === "Assigned" || ord.status === "Delivered" ? "text-slate-800" : "text-gray-400"
                                  }`}>On The Way</span>
                                  <span className={`text-[9px] font-bold select-none font-sans uppercase tracking-wider ${
                                    ord.status === "Assigned" || ord.status === "Delivered" ? "text-emerald-600" : "text-gray-400"
                                  }`}>
                                    {ord.status === "Assigned" || ord.status === "Delivered" ? "Dispatched" : "Awaiting"}
                                  </span>
                                </div>

                                {/* Step 3: Delivered */}
                                <div className="flex flex-col items-center text-center w-1/3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                    ord.status === "Delivered"
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs ring-4 ring-emerald-50/50"
                                      : "bg-white border-slate-200 text-slate-400"
                                  }`}>
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[11px] font-bold mt-2 font-sans transition-colors ${
                                    ord.status === "Delivered" ? "text-slate-800" : "text-gray-400"
                                  }`}>Delivered</span>
                                  <span className={`text-[9px] font-bold select-none font-sans uppercase tracking-wider ${
                                    ord.status === "Delivered" ? "text-emerald-600" : "text-gray-400"
                                  }`}>
                                    {ord.status === "Delivered" ? "Completed" : "Awaiting"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}


                {/* TAB: MY COMPREHENSIVE CUSTOMER PROFILE EDITOR */}
                {customerTab === "profile" && (
                  <div className="animate-fade-in text-left max-w-2xl mx-auto pb-12">
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 relative select-none">
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                          <User className="w-48 h-48 pointer-events-none" />
                        </div>
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block">
                          My Profile Settings
                        </span>
                        <h3 className="text-xl font-bold tracking-tight mt-1.5 font-display font-sans">Manage Your Address & Details</h3>
                        <p className="text-xs text-emerald-100 mt-1 font-medium font-sans">Configure your default contact parameters. Saved information will pre-populate your shopping checkouts.</p>
                      </div>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const updatedUser = {
                            ...customerUser,
                            name: profileForm.name,
                            photo: profileForm.photo,
                            address: profileForm.address
                          };
                          setCustomerUser(updatedUser);
                          localStorage.setItem("sabzi_customer", JSON.stringify(updatedUser));
                          // Keyed profile persistence
                          localStorage.setItem(`sabzi_profile_${customerUser.mobile}`, JSON.stringify(updatedUser));
                          showToast("Profile settings synchronized successfully!", "success");
                        }} 
                        className="p-6 space-y-6 animate-fade-in"
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-150">
                          {/* Profile display image circle framed correctly */}
                          <div className="relative shrink-0 select-none">
                            <img 
                              src={profileForm.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"} 
                              alt="Customer Avatar" 
                              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-md"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full border border-white">
                              <User className="w-3.5 h-3.5 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-2 text-center sm:text-left w-full">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block select-none">Select Profile Photo Preset:</span>
                            {/* Horizontal selection of presets */}
                            <div className="grid grid-cols-4 gap-2 max-w-sm pt-1">
                              {[
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", 
                                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", 
                                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200", 
                                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                              ].map((presetUrl, presetIdx) => (
                                <button
                                  type="button"
                                  key={presetIdx}
                                  onClick={() => setProfileForm({ ...profileForm, photo: presetUrl })}
                                  className={`aspect-square w-full rounded-lg border-2 overflow-hidden transition cursor-pointer hover:border-emerald-500 hover:scale-105 active:scale-95 ${profileForm.photo === presetUrl ? 'border-emerald-600 ring-2 ring-emerald-50 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                                >
                                  <img src={presetUrl} alt="Preset Option" className="w-full h-full object-cover pointer-events-none" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 select-none font-sans">
                              Custom Profile Photo URL
                            </label>
                            <input
                              type="text"
                              value={profileForm.photo}
                              onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
                              placeholder="Paste any custom picture link"
                              className="w-full bg-slate-55 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition text-slate-850 font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-widest mb-1.5 select-none font-sans">
                              Full Consumer Name
                            </label>
                            <input
                              type="text"
                              required
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              placeholder="E.g. Ramesh Kumar"
                              className="w-full bg-slate-55 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition font-sans text-slate-850"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1 select-none font-sans">
                              <span>Mobile Telephone (Secure ID)</span>
                              <span>🔒</span>
                            </label>
                            <input
                              type="text"
                              disabled
                              value={`+91 ${customerUser.mobile}`}
                              className="w-full bg-slate-100 text-gray-500 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold font-mono tracking-wider cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1 select-none font-sans">
                              <span>Customer Login Number</span>
                              <span>🔒</span>
                            </label>
                            <input
                              type="text"
                              disabled
                              value={customerUser.loginNumber || "1001"}
                              className="w-full bg-slate-100 text-gray-500 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold font-mono tracking-wider cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-widest mb-1.5 select-none font-sans">
                            Default Home Street Address
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                            placeholder="E.g. Room/Flat No 402, Green Fields Residencies, Dwarka New Delhi"
                            className="w-full bg-slate-55 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition resize-none font-sans text-slate-850"
                          />
                          <p className="text-[10px] text-gray-400 mt-1 select-none font-sans">This address serves as your default shipping location when confirming orders.</p>
                        </div>

                        <button
                          type="submit"
                          id="customer-profile-save-btn"
                          className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs uppercase py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-none outline-none text-center block font-sans"
                        >
                          <Check className="w-4 h-4 pointer-events-none" />
                          <span>Save Customer Profile Changes</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ======================= PORTAL: DELIVERY BOY ======================= */}
        {currentPortal === "delivery" && (
          <div className="max-w-4xl mx-auto px-4 mt-8">
            {!activeDeliveryBoy ? (
              // Delivery Login layout
              <div id="delivery-login-view" className="max-w-md mx-auto my-12">
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-orange-400"></div>

                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 border border-amber-100">
                    <Truck className="w-8 h-8" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    Partner Delivery Login
                  </h2>
                  <p className="text-sm text-gray-500 mb-6 font-medium">
                    Authenticate to access assigned vegetable bookings, map delivery paths, and view earned commissions.
                  </p>

                  <form onSubmit={handleDeliveryLogin} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Delivery Username
                      </label>
                      <input
                        id="delivery-login-name"
                        type="text"
                        value={deliveryUsername}
                        onChange={(e) => setDeliveryUsername(e.target.value)}
                        placeholder="e.g. ramesh or suresh"
                        className="w-full bg-slate-50/80 rounded-xl border border-gray-200 px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Security Password
                      </label>
                      <input
                        id="delivery-login-pass"
                        type="password"
                        value={deliveryPassword}
                        onChange={(e) => setDeliveryPassword(e.target.value)}
                        placeholder="e.g. 123 or 456"
                        className="w-full bg-slate-50/80 rounded-xl border border-gray-200 px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:bg-white"
                      />
                    </div>

                    <button
                      id="delivery-submit-login"
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold tracking-wide transition shadow-md mt-2"
                    >
                      Verify Partner Profile
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-gray-100 text-[11px] text-gray-400 text-left bg-slate-50 p-3 rounded-xl font-medium">
                    <span className="font-bold text-slate-600 block mb-1">💡 Default test credentials:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Username: <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold">ramesh</code> / Password: <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold">123</code> (12% Comm)</li>
                      <li>Username: <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold">suresh</code> / Password: <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold">456</code> (15% Comm)</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              // Active Delivery dashboard
              <div id="delivery-panel-active" className="space-y-6">
                
                {/* Partner Header */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md select-none">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Delivery Partner Portal
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-display text-white mt-2.5">
                      🚴 {activeDeliveryBoy.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Register Mobile: {activeDeliveryBoy.mobile} | Partner ID: {activeDeliveryBoy.id}
                    </p>
                  </div>

                  <button
                    onClick={handleDeliveryLogout}
                    className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>

                {/* EARNED COMMISSION WIDGET */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">
                      Commission Rate (Editable by Admin)
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-amber-600">
                        {personalCommissionRate}%
                      </span>
                      <span className="text-xs text-gray-500">of raw item values</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">
                      Completed Deliveries
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-slate-800">
                        {completedDeliveryOrders.length}
                      </span>
                      <span className="text-xs text-gray-500">parcels completed</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 text-left">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest block mb-1">
                      My Commission Earned
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-emerald-700">
                        ₹{totalEarnedCommission}
                      </span>
                      <span className="text-xs text-emerald-600">to be dispatched</span>
                    </div>
                  </div>
                </div>

                {/* ASSIGNED DELIVERIES */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                    <Layers className="w-4.5 h-4.5 text-amber-600" />
                    <span>Assigned Grocery Consignments ({assignedDeliveryOrders.length})</span>
                  </h3>

                  {assignedDeliveryOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      No orders have been dispatched or assigned to you yet.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {assignedDeliveryOrders.map((ord) => (
                        <div key={ord.id} className="p-5 rounded-2xl border border-gray-200/90 hover:border-amber-400 transition bg-slate-50/40 text-left">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-gray-150 pb-3.5 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                                {ord.id}
                              </span>
                              <span className="text-xs text-gray-400 font-mono">Booked on: {ord.createdAt}</span>
                            </div>
                            
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                              ord.status === "Delivered"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold"
                                : "bg-yellow-50 border-yellow-200 text-yellow-700 animate-pulse"
                            }`}>
                              Status: {ord.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            {/* CUSTOMER PARTICULARS */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                                Customer Contact Info
                              </span>
                              <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-150 text-xs">
                                <p className="font-bold text-slate-800 text-sm">{ord.customerName}</p>
                                <p className="text-gray-600 flex items-start gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <span>{ord.customerAddress}</span>
                                </p>
                                <p className="text-slate-800 font-medium font-mono flex items-center gap-1 mt-1">
                                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>+91 {ord.customerMobile}</span>
                                </p>
                              </div>
                            </div>

                            {/* ITEM SUMMARY */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                                Produce Items Package
                              </span>
                              <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-150 text-xs">
                                {ord.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between font-medium">
                                    <span>{it.productName} ({it.quantity} {it.unit})</span>
                                    <span>₹{it.price * it.quantity}</span>
                                  </div>
                                ))}
                                <div className="border-t border-gray-100 pt-1.5 mt-1.5 flex justify-between font-bold text-indigo-900">
                                  <span>Billing Total (excl delivery)</span>
                                  <span>₹{ord.total}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ACTION BUTTON */}
                          {ord.status === "Assigned" && (
                            <div className="pt-3 border-t border-gray-100 flex justify-end">
                              <button
                                onClick={() => handleMarkOrderDelivered(ord.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide px-4 py-2 rounded-xl transition flex items-center gap-1 outline-none"
                              >
                                <Check className="w-4 h-4" />
                                <span>Mark as Delivered & Credit Commission (₹{Math.round((ord.subtotal * personalCommissionRate) / 100)})</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ======================= PORTAL: ADMINISTRATOR ======================= */}
        {currentPortal === "admin" && (
          <div className="max-w-7xl mx-auto px-4 mt-8">
            {!isAdminAuthenticated ? (
              // Admin Login layout
              <div id="admin-login-view" className="max-w-md mx-auto my-12">
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-slate-700 to-slate-900"></div>

                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-850 flex items-center justify-center mx-auto mb-6 border border-slate-200">
                    <Settings className="w-8 h-8" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    Administrator Control Portal
                  </h2>
                  <p className="text-sm text-gray-500 mb-6 font-medium">
                    Authenticate to design catalogs, manage delivery partner networks, configure live promo codes, and assign jobs.
                  </p>

                  <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Admin Login ID
                      </label>
                      <input
                        id="admin-login-name"
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Default standard: admin"
                        className="w-full bg-slate-50/80 rounded-xl border border-gray-200 px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-slate-800 focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Security Password
                      </label>
                      <input
                        id="admin-login-pass"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Default setup: 123"
                        className="w-full bg-slate-50/80 rounded-xl border border-gray-200 px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-slate-800 focus:outline-none focus:bg-white"
                      />
                    </div>

                    <button
                      id="admin-submit-login"
                      type="submit"
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold tracking-wide transition shadow-md mt-2"
                    >
                      Enter Administration Panel
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-gray-100 text-[11px] text-gray-400 font-mono text-left bg-slate-50 p-3 rounded-xl">
                    <span className="font-bold text-slate-600 block mb-0.5 uppercase tracking-wide">Standard Credentials:</span>
                    <p>Username: <code className="bg-white px-1 border rounded">admin</code> | Password: <code className="bg-white px-1 border rounded">123</code></p>
                  </div>
                </div>
              </div>
            ) : (
              // Authenticated Admin Dashboard
              <div id="admin-panel-desk" className="space-y-8 select-none">
                
                {/* Admin Header with quick logout */}
                <div className="bg-slate-800 text-white p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <Settings className="w-5 h-5 text-lime-400" />
                      <span>Fresh Sabzi Hub Control Tower</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Modify layout structure, configure prices, control delivery locations, and assign dispatch riders.
                    </p>
                  </div>

                  <button
                    onClick={handleAdminLogout}
                    className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit Desk</span>
                  </button>
                </div>

                {/* Sub-tabs navigation menu */}
                <div className="flex border-b border-gray-200 overflow-x-auto pb-0.5 scrollbar-none gap-2">
                  <button
                    onClick={() => setAdminTab("live-orders")}
                    className={`px-4 py-3 text-xs font-bold shrink-0 transition tracking-wider uppercase border-b-2 ${
                      adminTab === "live-orders"
                        ? "border-slate-800 text-slate-800"
                        : "border-transparent text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    Live Orders Queue
                  </button>
                  <button
                    onClick={() => setAdminTab("catalog")}
                    className={`px-4 py-3 text-xs font-bold shrink-0 transition tracking-wider uppercase border-b-2 ${
                      adminTab === "catalog"
                        ? "border-slate-800 text-slate-800"
                        : "border-transparent text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    Establish Catalog
                  </button>
                  <button
                    onClick={() => setAdminTab("delivery-team")}
                    className={`px-4 py-3 text-xs font-bold shrink-0 transition tracking-wider uppercase border-b-2 ${
                      adminTab === "delivery-team"
                        ? "border-slate-800 text-slate-800"
                        : "border-transparent text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    Delivery boys Management
                  </button>
                  <button
                    onClick={() => setAdminTab("promo")}
                    className={`px-4 py-3 text-xs font-bold shrink-0 transition tracking-wider uppercase border-b-2 ${
                      adminTab === "promo"
                        ? "border-slate-800 text-slate-800"
                        : "border-transparent text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    Promo Coupons
                  </button>
                  <button
                    onClick={() => setAdminTab("settings")}
                    className={`px-4 py-3 text-xs font-bold shrink-0 transition tracking-wider uppercase border-b-2 ${
                      adminTab === "settings"
                        ? "border-slate-800 text-slate-800"
                        : "border-transparent text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    Global Settings & Locations
                  </button>
                </div>

                {/* ============= TAB content: Live orders dispatcher ============= */}
                {adminTab === "live-orders" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-gray-100 pb-3 mb-4">
                        Live Display Dash — Received Orders list
                      </h3>

                      {orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                          No customer bookings registered on the network yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((ord) => (
                            <div key={ord.id} className="p-4 rounded-2xl border border-gray-200 hover:border-slate-400 bg-slate-50/30 transition flex flex-col lg:flex-row justify-between gap-4 text-left">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                    {ord.id}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">
                                    Booked: {ord.createdAt}
                                  </span>
                                </div>

                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-800">Customer: {ord.customerName} | Phone: {ord.customerMobile}</p>
                                  <p className="text-xs text-gray-500 leading-tight">{ord.customerAddress}</p>
                                </div>

                                {/* Items */}
                                <div className="text-xs space-y-0.5 pt-1 bg-white p-2.5 rounded-xl border border-gray-150 max-w-md">
                                  <span className="font-bold text-gray-400 block uppercase text-[10px] mb-1">Produce Packages:</span>
                                  {ord.items.map((it, itemIdx) => (
                                    <div key={itemIdx} className="flex justify-between text-slate-700">
                                      <span>• {it.productName} ({it.quantity} {it.unit})</span>
                                      <span className="font-mono text-slate-600">₹{it.price * it.quantity}</span>
                                    </div>
                                  ))}
                                  <div className="border-t border-slate-100 pt-1 mt-1 flex justify-between font-bold text-slate-900">
                                    <span>Consignment Value (excl charge/discount)</span>
                                    <span>₹{ord.subtotal}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col md:items-end justify-between text-right shrink-0">
                                <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-150 inline-block text-left">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                    Assign Delivery Rider Partner
                                  </label>
                                  <select
                                    value={ord.deliveryBoyId || ""}
                                    onChange={(e) => handleAssignDeliveryBoy(ord.id, e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none focus:ring-0"
                                  >
                                    <option value="">-- Click to Dispatch / Unassigned --</option>
                                    {deliveryBoys.map((db) => (
                                      <option key={db.id} value={db.id}>
                                        🚴 {db.name} (Comm: {db.commissionRate}%)
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-left md:text-right">
                                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-widest">
                                      Grand Total Paid
                                    </span>
                                    <strong className="text-indigo-900 font-bold text-base">₹{ord.total}</strong>
                                  </div>

                                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-gray-200">
                                    <button
                                      onClick={async () => {
                                        await fetch(`/api/orders/${ord.id}`, {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ status: "Pending" })
                                        });
                                        syncAllData();
                                      }}
                                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${ord.status === "Pending" ? "bg-indigo-600 text-white" : "text-gray-500"}`}
                                    >
                                      Pending
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await fetch(`/api/orders/${ord.id}`, {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ status: "Assigned" })
                                        });
                                        syncAllData();
                                      }}
                                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${ord.status === "Assigned" ? "bg-amber-500 text-white" : "text-gray-500"}`}
                                    >
                                      Assigned
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await fetch(`/api/orders/${ord.id}`, {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ status: "Delivered" })
                                        });
                                        syncAllData();
                                      }}
                                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${ord.status === "Delivered" ? "bg-emerald-600 text-white" : "text-gray-500"}`}
                                    >
                                      Delivered
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ============= TAB content: Catalog Categories & Products Establish ============= */}
                {adminTab === "catalog" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left panel: Add Category & Add product forms */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* ADD CATEGORY FORM */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                          Photo Upload Settings & Add Category
                        </h3>
                        <form onSubmit={handleAddCategory} className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Category Name
                            </label>
                            <input
                              type="text"
                              required
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              placeholder="e.g. Exotic Veggies, Sweet Berries"
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Photo URL Selection
                            </label>
                            <input
                              type="url"
                              required
                              value={newCatImage}
                              onChange={(e) => setNewCatImage(e.target.value)}
                              placeholder="Image link (Unsplash or SVG)"
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                            />
                            <div className="flex gap-2.5 mt-2">
                              <button
                                type="button"
                                onClick={() => setNewCatImage("https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400")}
                                className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 block"
                              >
                                Veg Unsplash
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewCatImage("https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400")}
                                className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 block"
                              >
                                Fruit Unsplash
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold w-full py-2 rounded-lg transition"
                          >
                            Add New Category
                          </button>
                        </form>
                      </div>

                      {/* ADD/EDIT PRODUCT FORM */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                          {editingProduct ? "✏️ Edit Product Details" : "＋ Register New Produce Item"}
                        </h3>
                        <form onSubmit={handleSaveProduct} className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Produce Name
                            </label>
                            <input
                              type="text"
                              required
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              placeholder="e.g. Green Coriander, Fresh Butter"
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Price (₹)
                              </label>
                              <input
                                type="number"
                                required
                                value={productForm.price}
                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                placeholder="45"
                                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Billing Unit
                              </label>
                              <input
                                type="text"
                                required
                                value={productForm.unit}
                                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                                placeholder="kg, 500g, dozen, piece"
                                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Category Allocation
                              </label>
                              <select
                                required
                                value={productForm.categoryId}
                                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                              >
                                <option value="">-- Select --</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                In-Stock Inventory Count
                              </label>
                              <input
                                type="number"
                                required
                                value={productForm.inventory}
                                onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                                placeholder="50"
                                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Product Photo URL setting (Required)
                            </label>
                            <input
                              type="url"
                              required
                              value={productForm.image}
                              onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                              placeholder="Url (or use preset)"
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                            />
                            <div className="flex gap-2.5 mt-2">
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, image: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400" })}
                                className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border text-gray-600 block"
                              >
                                Tomato Preset
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400" })}
                                className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border text-gray-600 block"
                              >
                                Potato Preset
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              className="flex-1 bg-slate-800 hover:bg-slate-900 border-none text-white text-xs font-bold py-2 rounded-lg transition"
                            >
                              {editingProduct ? "Save Changes" : "Save Product"}
                            </button>
                            {editingProduct && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(null);
                                  setProductForm({ name: "", price: "", unit: "kg", image: "", categoryId: "", inventory: "50" });
                                }}
                                className="px-3 border border-gray-200 text-xs rounded-lg text-gray-500"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                    </div>

                    {/* Right column: Manage displays */}
                    <div className="lg:col-span-8 space-y-8">
                      {/* Active Categories section */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs text-left">
                        <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block mb-4">
                          Registered Categories: Photo Upload configuration
                        </span>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {categories.map((c) => (
                            <div key={c.id} className="p-3 border border-gray-200 rounded-xl relative flex items-center gap-3 bg-slate-50/50">
                              <img src={c.image} alt={c.name} className="w-12 h-12 object-cover rounded-lg" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-slate-800 truncate">{c.name}</p>
                                <span className="text-[9px] text-gray-400 font-mono block uppercase">{c.id}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteCategory(c.id)}
                                className="text-gray-400 hover:text-rose-600 p-1 shrink-0"
                                title="Delete category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Active Products list */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs text-left">
                        <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block mb-4">
                          Establish Catalog: Products List & Stock Levels
                        </span>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-gray-500 font-semibold border-b border-gray-100">
                              <tr>
                                <th className="p-3">Produce Item</th>
                                <th className="p-3">Price Setting</th>
                                <th className="p-3">Category ID</th>
                                <th className="p-3 text-center">Remaining Stock</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {products.map((p) => {
                                const matchedCat = categories.find((c) => c.id === p.categoryId)?.name || "Produce";
                                return (
                                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                    <td className="p-3 font-semibold flex items-center gap-3">
                                      <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                                      <div>
                                        <span className="block font-bold text-slate-850">{p.name}</span>
                                        <span className="text-[9px] text-gray-400 font-mono uppercase">{p.id}</span>
                                      </div>
                                    </td>
                                    <td className="p-3 font-bold text-slate-800">
                                      ₹{p.price} <span className="text-[10px] text-gray-400 font-normal">/ {p.unit}</span>
                                    </td>
                                    <td className="p-3 text-gray-500 font-medium">
                                      {matchedCat}
                                    </td>
                                    <td className="p-3 text-center font-mono">
                                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${p.inventory <= 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {p.inventory}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          onClick={() => handleEditProductClick(p)}
                                          className="text-xs text-slate-600 hover:text-slate-900 font-bold px-2 py-1 hover:bg-slate-150 rounded"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteProduct(p.id)}
                                          className="text-xs text-rose-600 hover:text-rose-800 p-1"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ============= TAB content: Delivery Partners (Boy) Management ============= */}
                {adminTab === "delivery-team" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Add / Edit form of delivery boy */}
                    <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                        {editingDB ? "✏️ Edit Delivery Boy credentials" : "🚴 Add Delivery Boy profile"}
                      </h3>

                      <form onSubmit={handleSaveDeliveryBoy} className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                            Full Display Name
                          </label>
                          <input
                            type="text"
                            required
                            value={dbForm.name}
                            onChange={(e) => setDbForm({ ...dbForm, name: e.target.value })}
                            placeholder="e.g. Ramesh Kumar"
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                            Contact / Mobile Number
                          </label>
                          <input
                            type="text"
                            required
                            value={dbForm.mobile}
                            onChange={(e) => setDbForm({ ...dbForm, mobile: e.target.value.replace(/\D/g, "") })}
                            placeholder="e.g. 9876543210"
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                              Login Username
                            </label>
                            <input
                              type="text"
                              required
                              value={dbForm.username}
                              onChange={(e) => setDbForm({ ...dbForm, username: e.target.value })}
                              placeholder="ramesh"
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                              Login Password
                            </label>
                            <input
                              type="text"
                              required={!editingDB}
                              value={dbForm.password}
                              onChange={(e) => setDbForm({ ...dbForm, password: e.target.value })}
                              placeholder={editingDB ? "Keep same" : "123"}
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                            Delivery Commission Share (%)
                          </label>
                          <input
                            type="number"
                            required
                            value={dbForm.commissionRate}
                            onChange={(e) => setDbForm({ ...dbForm, commissionRate: e.target.value })}
                            placeholder="12"
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold font-mono text-indigo-900"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 rounded-lg transition"
                          >
                            {editingDB ? "Update Credentials" : "Save Account"}
                          </button>
                          {editingDB && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDB(null);
                                setDbForm({ name: "", mobile: "", username: "", password: "", commissionRate: "10" });
                              }}
                              className="px-3 border border-gray-200 text-xs rounded-lg text-slate-500"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Team display with complete stats */}
                    <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 text-left">
                      <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block mb-4">
                        Delivery Boys Commission Stats & Profile Management
                      </span>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-gray-500 font-semibold border-b">
                            <tr>
                              <th className="p-3">Partner Name</th>
                              <th className="p-3">Contact</th>
                              <th className="p-3">Secure Credentials</th>
                              <th className="p-3 text-center">Commission Rate</th>
                              <th className="p-3 text-right">Action Buttons</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {deliveryBoys.map((boy) => {
                              // calculate stats dynamically
                              const relevantCompleted = orders.filter((o) => o.deliveryBoyId === boy.id && o.status === "Delivered");
                              const completedSubtotal = relevantCompleted.reduce((sum, ord) => sum + ord.subtotal, 0);
                              const totalCommissionEarned = Math.round((completedSubtotal * boy.commissionRate) / 100);

                              return (
                                <tr key={boy.id} className="hover:bg-slate-50/50">
                                  <td className="p-3">
                                    <span className="block font-bold text-slate-800 text-sm">🚴 {boy.name}</span>
                                    <span className="text-[9px] text-gray-400 font-mono uppercase">{boy.id}</span>
                                  </td>
                                  <td className="p-3 font-mono font-medium text-slate-600">
                                    +91 {boy.mobile}
                                  </td>
                                  <td className="p-3">
                                    <span className="block font-mono text-[11px] font-bold text-slate-700">Username: {boy.username}</span>
                                    <span className="block font-mono text-[10px] text-gray-400">Password: {boy.password || "●●●●"}</span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="font-bold text-amber-600 text-sm font-mono">{boy.commissionRate}%</span>
                                    <span className="block text-[9px] font-semibold text-emerald-600 font-mono">Earned: ₹{totalCommissionEarned}</span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => handleEditDBClick(boy)}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1"
                                      >
                                        Edit Credentials
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDB(boy.id)}
                                        className="text-xs text-rose-500 hover:text-rose-700 p-1"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============= TAB content: Global Promo Coupon Manager ============= */}
                {adminTab === "promo" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Add Coupon code Form */}
                    <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b pb-2 mb-4">
                        Register Promo Coupon Code
                      </h3>

                      <form onSubmit={handleAddPromoCode} className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                            Promo Code Pattern
                          </label>
                          <input
                            type="text"
                            required
                            value={promoForm.code}
                            onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.replace(/[^a-zA-Z0-9]/g, "") })}
                            placeholder="e.g. SABZI50"
                            className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-mono uppercase font-semibold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                            Discount Percent (%)
                          </label>
                          <input
                            type="number"
                            required
                            value={promoForm.discountPercent}
                            onChange={(e) => setPromoForm({ ...promoForm, discountPercent: e.target.value })}
                            placeholder="15"
                            className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-mono font-bold text-indigo-900"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="check-active"
                            checked={promoForm.active}
                            onChange={(e) => setPromoForm({ ...promoForm, active: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 border-gray-350 rounded"
                          />
                          <label htmlFor="check-active" className="text-xs font-bold text-slate-700">
                            Set Active Immediately
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs w-full py-2 rounded-lg transition"
                        >
                          Register Coupon Promo
                        </button>
                      </form>
                    </div>

                    {/* Coupons list */}
                    <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 text-left">
                      <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block mb-4">
                        Store Active Coupons
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {settings?.promoCodes.map((coup) => (
                          <div key={coup.code} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between bg-slate-50/50">
                            <div>
                              <span className="font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded text-sm tracking-wider uppercase block mb-1">
                                {coup.code}
                              </span>
                              <span className="text-xs font-bold text-slate-700">{coup.discountPercent}% Instant discount</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                coup.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}>
                                {coup.active ? 'Active' : 'Disabled'}
                              </span>

                              <button
                                onClick={() => handleTogglePromoStatus(coup.code)}
                                className="text-xs text-indigo-600 hover:underline font-semibold text-[11px]"
                              >
                                Toggle
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* ============= TAB content: Store details, Delivery Charge & Boundary Settings ============= */}
                {adminTab === "settings" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    
                    {/* General metrics */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
                      <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block mb-2 border-b pb-2">
                        Store Global Management Setting
                      </span>

                      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">Operational Shop State</strong>
                          <span className="text-[11px] text-gray-400">Force close the database from taking consumer orders</span>
                        </div>
                        <button
                          onClick={() => handleUpdateStoreSettings({ storeOpen: !settings?.storeOpen })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                            settings?.storeOpen
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {settings?.storeOpen ? "STORE OPEN" : "STORE CLOSED"}
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Store Branded Title name
                          </label>
                          <input
                            type="text"
                            value={settings?.storeName ?? "Fresh Sabzi Hub"}
                            onChange={(e) => handleUpdateStoreSettings({ storeName: e.target.value })}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Store Dispatch / Support Phone Hotline
                          </label>
                          <input
                            type="text"
                            value={settings?.storePhone ?? "011-99887766"}
                            onChange={(e) => handleUpdateStoreSettings({ storePhone: e.target.value })}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Standard Delivery Charge Fee (₹)
                          </label>
                          <input
                            type="number"
                            value={settings?.deliveryCharge ?? 25}
                            onChange={(e) => handleUpdateStoreSettings({ deliveryCharge: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-850"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Orders with total price exceeding ₹300 automatically receive free delivery fee.</p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Locations */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
                      <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block mb-2 border-b pb-2">
                        Operational Delivery Location Zones
                      </span>

                      <div className="space-y-2">
                        {settings?.deliveryLocations.map((loc, index) => (
                          <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
                            <span className="text-xs font-bold text-slate-700">{loc} Sector Limit</span>
                            <button
                              onClick={() => {
                                const list = (settings?.deliveryLocations || []).filter((l) => l !== loc);
                                handleUpdateStoreSettings({ deliveryLocations: list });
                              }}
                              className="text-xs text-rose-500 font-semibold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Deploy New Delivery Location Sector
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Connaught Place"
                            id="add-loc-input"
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const inputNode = e.currentTarget as HTMLInputElement;
                                if (inputNode.value.trim() && settings) {
                                  const list = [...settings.deliveryLocations, inputNode.value.trim()];
                                  handleUpdateStoreSettings({ deliveryLocations: list });
                                  inputNode.value = "";
                                }
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const el = document.getElementById("add-loc-input") as HTMLInputElement;
                              if (el && el.value.trim() && settings) {
                                const list = [...settings.deliveryLocations, el.value.trim()];
                                handleUpdateStoreSettings({ deliveryLocations: list });
                                el.value = "";
                              }
                            }}
                            className="bg-slate-800 hover:bg-slate-900 border-none text-white text-xs font-bold px-4 rounded-lg transition shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
