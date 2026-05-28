import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Category, Product, DeliveryBoy, Order, AdminSettings } from "./src/types";

dotenv.config();

let __filename = "";
let __dirname = "";
try {
  if (typeof import.meta !== "undefined" && import.meta.url) {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
  }
} catch (e) {
  // safe fallback
}

const app = express();
const PORT = 3000;

app.use(express.json());

// IN-MEMORY DATABASES (Loaded with rich, high-quality realistic seed data)
let nextId = 100;
const generateId = (prefix: string) => `${prefix}-${++nextId}`;

let categories: Category[] = [
  {
    id: "cat-1",
    name: "Fresh Vegetables",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "cat-2",
    name: "Organic Fruits",
    image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "cat-3",
    name: "Dairy & Groceries",
    image: "https://images.unsplash.com/photo-1528498029143-1525d632db3a?auto=format&fit=crop&q=80&w=400",
  },
];

let products: Product[] = [
  // Vegetables
  {
    id: "prod-1",
    name: "Premium Tomatoes",
    price: 40,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-1",
    inventory: 120,
  },
  {
    id: "prod-2",
    name: "Organic Potatoes",
    price: 30,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-1",
    inventory: 250,
  },
  {
    id: "prod-3",
    name: "Fresh Red Onions",
    price: 35,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-1",
    inventory: 180,
  },
  {
    id: "prod-4",
    name: "Hot Green Chilies",
    price: 80,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-1",
    inventory: 45,
  },
  // Fruits
  {
    id: "prod-5",
    name: "Rich Alphonso Mangoes",
    price: 150,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-2",
    inventory: 90,
  },
  {
    id: "prod-6",
    name: "Ripe Bananas",
    price: 50,
    unit: "dozen",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-2",
    inventory: 70,
  },
  {
    id: "prod-7",
    name: "Sweet Red Apples",
    price: 180,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-2",
    inventory: 110,
  },
  // Groceries & Dairy
  {
    id: "prod-8",
    name: "Fresh Paneer",
    price: 120,
    unit: "500g",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-3",
    inventory: 35,
  },
  {
    id: "prod-9",
    name: "Fresh Toned Milk",
    price: 32,
    unit: "litre",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400",
    categoryId: "cat-3",
    inventory: 80,
  },
];

let deliveryBoys: DeliveryBoy[] = [
  {
    id: "db-1",
    name: "Ramesh Kumar",
    mobile: "9876543210",
    username: "ramesh",
    password: "123",
    commissionRate: 12, // 12% commission
  },
  {
    id: "db-2",
    name: "Suresh Singh",
    mobile: "9812345678",
    username: "suresh",
    password: "456",
    commissionRate: 15, // 15% commission
  },
];

let orders: Order[] = [
  {
    id: "order-101",
    customerName: "Rohan Sharma",
    customerAddress: "Flat 402, Green Meadows, Sector 12, Dwarka, New Delhi",
    customerMobile: "9911223344",
    status: "Delivered",
    items: [
      { productId: "prod-1", productName: "Premium Tomatoes", price: 40, quantity: 2, unit: "kg" },
      { productId: "prod-2", productName: "Organic Potatoes", price: 30, quantity: 3, unit: "kg" },
    ],
    subtotal: 170,
    deliveryCharge: 30,
    discount: 10,
    total: 190,
    deliveryBoyId: "db-1",
    deliveryBoyName: "Ramesh Kumar",
    createdAt: new Date(Date.now() - 3600000 * 4).toLocaleString(),
  },
  {
    id: "order-102",
    customerName: "Anjali Gupta",
    customerAddress: "House No. 129, Gali 3, Rajouri Garden, New Delhi",
    customerMobile: "9897969594",
    status: "Assigned",
    items: [
      { productId: "prod-5", productName: "Rich Alphonso Mangoes", price: 150, quantity: 1, unit: "kg" },
      { productId: "prod-9", productName: "Fresh Toned Milk", price: 32, quantity: 2, unit: "litre" },
    ],
    subtotal: 214,
    deliveryCharge: 30,
    discount: 0,
    total: 244,
    deliveryBoyId: "db-1",
    deliveryBoyName: "Ramesh Kumar",
    createdAt: new Date(Date.now() - 3600000 * 2).toLocaleString(),
  },
  {
    id: "order-103",
    customerName: "Deepak Verma",
    customerAddress: "Villa 14, Lotus Boulevard, Noida Sector 47",
    customerMobile: "9512344321",
    status: "Pending",
    items: [
      { productId: "prod-7", productName: "Sweet Red Apples", price: 180, quantity: 2, unit: "kg" },
      { productId: "prod-8", productName: "Fresh Paneer", price: 120, quantity: 1, unit: "500g" },
    ],
    subtotal: 480,
    deliveryCharge: 0,
    discount: 48,
    total: 432,
    createdAt: new Date(Date.now() - 1800000).toLocaleString(),
  },
];

let globalSettings: AdminSettings = {
  storeOpen: true,
  storeName: "Fresh Sabzi Hub",
  storePhone: "011-99887766",
  deliveryCharge: 25,
  deliveryLocations: ["Dwarka", "Janakpuri", "Rajouri Garden", "Noida", "Gurugram"],
  promoCodes: [
    { code: "FRESH10", discountPercent: 10, active: true },
    { code: "SABZI20", discountPercent: 20, active: true },
    { code: "FREEHALF", discountPercent: 15, active: false },
  ],
  adminUsername: "admin",
  adminPassword: "123",
};

// Simulated OTP records
const otpStore: Record<string, string> = {};

// ================== CATEGORIES ENDPOINTS ==================
app.get("/api/categories", (req, res) => {
  res.json(categories);
});

app.post("/api/categories", (req, res) => {
  const { name, image } = req.body;
  if (!name || !image) {
    return res.status(400).json({ error: "Name and Image URL are required." });
  }
  const newCat: Category = {
    id: generateId("cat"),
    name,
    image,
  };
  categories.push(newCat);
  res.status(201).json(newCat);
});

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Category not found." });
  }
  categories[index] = { ...categories[index], name, image };
  res.json(categories[index]);
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  categories = categories.filter((c) => c.id !== id);
  // Optional: Delete/Update associated products or just keep them
  res.json({ success: true, message: "Category deleted." });
});

// ================== PRODUCTS ENDPOINTS ==================
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, price, unit, image, categoryId, inventory } = req.body;
  if (!name || price === undefined || !unit || !image || !categoryId) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const newProd: Product = {
    id: generateId("prod"),
    name,
    price: Number(price),
    unit,
    image,
    categoryId,
    inventory: Number(inventory || 0),
  };
  products.push(newProd);
  res.status(201).json(newProd);
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, unit, image, categoryId, inventory } = req.body;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found." });
  }
  products[index] = {
    ...products[index],
    name,
    price: Number(price),
    unit,
    image,
    categoryId,
    inventory: Number(inventory || 0),
  };
  res.json(products[index]);
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  products = products.filter((p) => p.id !== id);
  res.json({ success: true, message: "Product deleted." });
});

// ================== DELIVERY BOY ENDPOINTS ==================
app.get("/api/delivery-boys", (req, res) => {
  res.json(deliveryBoys);
});

app.post("/api/delivery-boys", (req, res) => {
  const { name, mobile, username, password, commissionRate } = req.body;
  if (!name || !mobile || !username || !password) {
    return res.status(400).json({ error: "All details are required." });
  }
  const newBoy: DeliveryBoy = {
    id: generateId("db"),
    name,
    mobile,
    username,
    password,
    commissionRate: Number(commissionRate || 10),
  };
  deliveryBoys.push(newBoy);
  res.status(201).json(newBoy);
});

app.put("/api/delivery-boys/:id", (req, res) => {
  const { id } = req.params;
  const { name, mobile, username, password, commissionRate } = req.body;
  const index = deliveryBoys.findIndex((db) => db.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Delivery boy not found." });
  }
  deliveryBoys[index] = {
    ...deliveryBoys[index],
    name,
    mobile,
    username,
    password: password || deliveryBoys[index].password,
    commissionRate: Number(commissionRate ?? deliveryBoys[index].commissionRate),
  };
  res.json(deliveryBoys[index]);
});

app.delete("/api/delivery-boys/:id", (req, res) => {
  const { id } = req.params;
  deliveryBoys = deliveryBoys.filter((db) => db.id !== id);
  res.json({ success: true, message: "Delivery boy deleted." });
});

// ================== ORDERS ENDPOINTS ==================
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { customerName, customerAddress, customerMobile, items, subtotal, deliveryCharge, discount, total } = req.body;
  if (!customerName || !customerAddress || !customerMobile || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing order parameters or empty cart." });
  }

  // Verify and update stock
  for (const item of items) {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      if (prod.inventory < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${prod.name}. Available: ${prod.inventory}` });
      }
      prod.inventory -= item.quantity;
    }
  }

  const newOrder: Order = {
    id: `order-${Math.floor(100 + Math.random() * 900)}`,
    customerName,
    customerAddress,
    customerMobile,
    status: "Pending",
    items,
    subtotal: Number(subtotal),
    deliveryCharge: Number(deliveryCharge),
    discount: Number(discount),
    total: Number(total),
    createdAt: new Date().toLocaleString(),
  };

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// Assign delivery boy or update status
app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status, deliveryBoyId } = req.body;

  const orderIndex = orders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found." });
  }

  if (status) {
    orders[orderIndex].status = status;
  }

  if (deliveryBoyId !== undefined) {
    if (deliveryBoyId === "") {
      orders[orderIndex].deliveryBoyId = undefined;
      orders[orderIndex].deliveryBoyName = undefined;
    } else {
      const db = deliveryBoys.find((b) => b.id === deliveryBoyId);
      if (db) {
        orders[orderIndex].deliveryBoyId = db.id;
        orders[orderIndex].deliveryBoyName = db.name;
        // Automatically progress state to Assigned if currently Pending
        if (orders[orderIndex].status === "Pending") {
          orders[orderIndex].status = "Assigned";
        }
      }
    }
  }

  res.json(orders[orderIndex]);
});

// ================== SETTINGS ENDPOINTS ==================
app.get("/api/settings", (req, res) => {
  res.json(globalSettings);
});

app.post("/api/settings", (req, res) => {
  const settingsUpdate = req.body;
  globalSettings = { ...globalSettings, ...settingsUpdate };
  res.json(globalSettings);
});

// ================== OTP AND AUTH MOCKS ==================
app.post("/api/auth/otp/send", (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length < 10) {
    return res.status(400).json({ error: "Valid mobile number is required." });
  }
  // Generate a random 6 digit code
  const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore[mobile] = generatedOtp;

  console.log(`[Fresh Sabzi Hub Auth] OTP for customer ${mobile} is: ${generatedOtp}`);

  res.json({
    success: true,
    message: "OTP sent successfully (Simulated).",
    otp: generatedOtp, // returning it for easy validation/simulation
  });
});

app.post("/api/auth/otp/verify", (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ error: "Mobile number and OTP are required." });
  }

  const storedOtp = otpStore[mobile];
  if (storedOtp && storedOtp === String(otp)) {
    delete otpStore[mobile]; // delete after use
    res.json({
      success: true,
      message: "Phone number authenticated successfully.",
      user: { mobile, name: "Customer Portal User" },
    });
  } else {
    res.status(400).json({ error: "Invalid OTP code entered." });
  }
});


// Production or Development Vite setups
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fresh Sabzi Hub] Full-stack server running successfully on http://localhost:${PORT}`);
  });
}

startServer();
