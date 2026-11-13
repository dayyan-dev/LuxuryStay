import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../Context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
const BASE_URL =
  process.env.REACT_APP_SERVER_URL ||
  API_URL.replace(/\/api$/, "") ||
  "http://localhost:5001";

const getImageUrl = (img) => {
  if (!img) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
  if (img.startsWith("http")) return img;
  if (img.startsWith("/Uploads/") || img.startsWith("/uploads/")) return `${BASE_URL}${img}`;
  return `${BASE_URL}/Uploads/${img}`;
};

const TABS = [
  { key: "Desi", label: "Desi Specialties", icon: "fa-bowl-rice" },
  { key: "Italian", label: "Italian & Continental", icon: "fa-pizza-slice" },
  { key: "Chinese", label: "Pan-Asian & Chinese", icon: "fa-utensils" },
  { key: "Fast Food", label: "Gourmet Fast Food", icon: "fa-burger" },
];

const DIETARY_CONFIG = {
  spicy: { label: "Spicy", icon: "fa-fire", color: "#CC5B55", bg: "rgba(231,76,60,0.12)" },
  veg: { label: "Vegetarian", icon: "fa-leaf", color: "#27ae60", bg: "rgba(54,133,104,0.12)" },
  "non-veg": { label: "Non-Veg", icon: "fa-drumstick-bite", color: "#e67e22", bg: "rgba(230,126,34,0.12)" },
  halal: { label: "Halal Certified", icon: "fa-star-and-crescent", color: "#2980b9", bg: "rgba(41,128,185,0.12)" },
};

// Premium curated fallback dishes in case backend is warming up
const DEFAULT_MENU_ITEMS = [
  {
    _id: "def-1",
    name: "Luxury Shahi Mutton Shinwari",
    description: "Tender mountain mutton slow-cooked in cold-pressed mustard oil with organic ginger, tomatoes, green chilies, and royal spices.",
    price: 2450,
    category: "Desi",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80",
    dietaryTags: ["spicy", "halal", "non-veg"],
    isAvailable: true,
  },
  {
    _id: "def-2",
    name: "Royal Dum Zafrani Biryani",
    description: "Aged long-grain basmati rice laye with aromatic saffron-marinated organic chicken, roasted almonds, and caramelized shallots.",
    price: 1850,
    category: "Desi",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
    dietaryTags: ["spicy", "halal", "non-veg"],
    isAvailable: true,
  },
  {
    _id: "def-3",
    name: "Reshmi Malai Boti Platter",
    description: "Char-grilled boneless chicken morsels steeped in cardamom-scented dairy cream, cashew paste, and light herbs.",
    price: 1950,
    category: "Desi",
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80",
    dietaryTags: ["halal", "non-veg"],
    isAvailable: true,
  },
  {
    _id: "def-4",
    name: "Dal Bukhara Slow-Simme",
    description: "Black lentils slow-cooked overnight with churned butter and dairy cream, subtly infused with whole cloves and garlic.",
    price: 1350,
    category: "Desi",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
    dietaryTags: ["veg", "halal"],
    isAvailable: true,
  },
  {
    _id: "def-5",
    name: "Truffle Tagliatelle Alfo",
    description: "Hand-crafted pasta ribbons tossed in aged Parmigiano-Reggiano emulsion, garlic butter, and Piedmont white truffle oil.",
    price: 2600,
    category: "Italian",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d628178d?w=500&q=80",
    dietaryTags: ["veg", "halal"],
    isAvailable: true,
  },
  {
    _id: "def-6",
    name: "Neapolitan Burrata Pizza",
    description: "Wood-fi crust with San Marzano tomatoes, artisanal creamy burrata, fresh Genovese basil, and EVOO.",
    price: 2200,
    category: "Italian",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
    dietaryTags: ["veg", "halal"],
    isAvailable: true,
  },
  {
    _id: "def-7",
    name: "Szechuan Kung Pao Chicken",
    description: "Wok-sea diced chicken with roasted peanuts, scallions, and dry facing-heaven chilies in a tangy dark glaze.",
    price: 1850,
    category: "Chinese",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&q=80",
    dietaryTags: ["spicy", "halal", "non-veg"],
    isAvailable: true,
  },
  {
    _id: "def-8",
    name: "Signature Angus Wagyu Burger",
    description: "Sea prime patty with aged cheddar, caramelized shallots, crisp butter lettuce, and truffle mayo on toasted brioche.",
    price: 2150,
    category: "Fast Food",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    dietaryTags: ["halal", "non-veg"],
    isAvailable: true,
  },
];

const STYLES = `
  .menu-section {
    background: var(--theme-surface-subtle, #F1F5F9);
    min-height: 80vh;
    padding: 60px 0 80px;
    font-family: 'Inter', sans-serif;
  }
  .menu-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 40px;
    font-weight: 700;
    color: var(--theme-text-dark, #0F172A);
    margin-bottom: 8px;
  }
  .menu-title span { color: ; }
  .menu-subtitle { font-size: 14px; color: var(--theme-text-secondary, #475569); letter-spacing: 0.5px; }
  .menu-tabs { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px; }
  .menu-tab-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 24px; border-radius: 50px;
    border: 1px solid var(--theme-border, #E2E8F0); background: #FFFFFF;
    color: #555555; font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: all 0.25s ease;
  }
  .menu-tab-btn:hover { border-color: ; color: ; transform: translateY(-1px); }
  .menu-tab-btn.active {
    background: linear-gradient(135deg, , var(--theme-primary-hover, #122642));
    border-color: transparent; color: var(--theme-primary, #1B365D);
    box-shadow: 0 6px 18px var(--theme-primary-soft, rgba(27, 54, 93, 0.35));
  }
  .menu-card {
    background: #FFFFFF;
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    gap: 16px;
    height: 100%;
    transition: box-shadow 0.25s, transform 0.25s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.03);
  }
  .menu-card:hover {
    box-shadow: 0 10px 28px rgba(0,0,0,0.08);
    transform: translateY(-3px);
    border-color: var(--theme-primary-soft, rgba(27, 54, 93, 0.40));
  }
  .menu-card-img {
    width: 95px; height: 95px;
    border-radius: 12px; object-fit: cover;
    flex-shrink: 0; border: 1px solid var(--theme-border, #E2E8F0);
  }
  .menu-card-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .menu-card-name { font-size: 15.5px; font-weight: 700; color: var(--theme-text-dark, #0F172A); margin-bottom: 4px; font-family: 'Playfair Display', Georgia, serif; }
  .menu-card-desc {
    font-size: 12px; color: var(--theme-text-secondary, #475569); margin-bottom: 8px; line-height: 1.5;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .menu-card-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: auto; }
  .menu-card-price { font-size: 16px; font-weight: 700; color: ; }
  .menu-dietary-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 6px; }
  .menu-dietary-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2.5px 8px; border-radius: 20px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.2px;
  }
  .menu-order-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 18px; border-radius: 50px; border: none;
    background: linear-gradient(135deg, , var(--theme-primary-hover, #122642));
    color: var(--theme-primary); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 12px var(--theme-primary-soft, rgba(27, 54, 93, 0.30));
  }
  .menu-order-btn:hover {
    box-shadow: 0 6px 18px var(--theme-primary-soft, rgba(27, 54, 93, 0.45));
    transform: translateY(-1px);
    color: var(--theme-primary-hover, #122642);
  }
  .menu-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .menu-modal {
    background: #FFFFFF; border-radius: 18px;
    width: 100%; max-width: 480px; overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.25);
  }
  .menu-modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 24px; border-bottom: 1px solid var(--theme-border, #E2E8F0);
    background: var(--theme-surface-subtle, #F1F5F9);
  }
  .menu-modal-title { font-size: 16px; font-weight: 700; color: var(--theme-text-dark, #0F172A); margin: 0; }
  .menu-modal-close {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid var(--theme-border, #E2E8F0); background: #FFFFFF; color: #888;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; transition: all 0.2s;
  }
  .menu-modal-close:hover { background: ; color: #FFFFFF; border-color: ; }
  .menu-modal-body { padding: 22px 24px; }
  .menu-modal-item {
    display: flex; gap: 14px; align-items: center;
    background: var(--theme-surface-subtle, #F1F5F9); border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 12px; padding: 14px; margin-bottom: 16px;
  }
  .menu-modal-item img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; }
  .menu-modal-item-name { font-size: 14.5px; font-weight: 700; color: var(--theme-text-dark, #0F172A); margin-bottom: 2px; }
  .menu-modal-item-price { font-size: 14px; font-weight: 700; color: ; }
  .menu-modal-input {
    width: 100%; padding: 10px 14px; border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 8px; font-size: 13px; color: #333;
    background: var(--theme-surface-subtle, #F1F5F9); outline: none; margin-bottom: 12px;
  }
  .menu-modal-input:focus { border-color: ; background: #FFFFFF; }
  .menu-qty-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--theme-surface-subtle, #F1F5F9); border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 8px; padding: 10px 16px; margin-bottom: 12px;
  }
  .menu-qty-controls { display: flex; align-items: center; gap: 12px; }
  .menu-qty-btn {
    width: 30px; height: 30px; border-radius: 50%;
    border: 1px solid var(--theme-border, #E2E8F0); background: #FFFFFF; color: #333;
    font-size: 16px; display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .menu-qty-btn:hover { background: ; color: #FFFFFF; border-color: ; }
  .menu-total-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--theme-surface-subtle, #F1F5F9); border: 1px dashed ;
    border-radius: 8px; padding: 12px 16px; margin-bottom: 18px;
  }
  .menu-modal-footer {
    display: flex; gap: 12px; padding: 16px 24px;
    border-top: 1px solid var(--theme-border, #E2E8F0); background: var(--theme-surface-subtle, #F1F5F9);
  }
`;

const DEFAULT_TAB_ICONS = {
  desi: 'fa-bowl-rice',
  italian: 'fa-pizza-slice',
  chinese: 'fa-utensils',
  fastfood: 'fa-burger',
  fast_food: 'fa-burger',
  bbq: 'fa-fire-burner',
  beverages: 'fa-wine-glass',
  dessert: 'fa-cake-candles',
  desserts: 'fa-cake-candles',
  breakfast: 'fa-egg',
  seafood: 'fa-fish',
};

const getTabIcon = (name) => {
  const key = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
  return DEFAULT_TAB_ICONS[key] || 'fa-utensils';
};

const RestaurantMenu = () => {
  const { user, token } = useAuth();

  const [menuData, setMenuData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("Desi");
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeStay, setActiveStay] = useState(null); // checked_in booking summary

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchMenuAndCategories = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch(`${API_URL}/restaurant/menu`),
          fetch(`${API_URL}/restaurant/menu/categories`),
        ]);

        if (menuRes.ok) {
          const data = await menuRes.json();
          if (isMounted) {
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
              setMenuData(data.data);
            } else {
              setMenuData(DEFAULT_MENU_ITEMS);
            }
          }
        } else if (isMounted) {
          setMenuData(DEFAULT_MENU_ITEMS);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          if (isMounted && catData.data && Array.isArray(catData.data)) {
            setCategories(catData.data);
          }
        }
      } catch (err) {
        console.warn("Backend restaurant menu fetch fallback:", err.message);
        if (isMounted) {
          setMenuData(DEFAULT_MENU_ITEMS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMenuAndCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Prefill room from an active checked-in booking when signed in
  useEffect(() => {
    let cancelled = false;
    const loadStay = async () => {
      if (!token || !user) {
        setActiveStay(null);
        return;
      }
      try {
        const uid = user._id || user.id;
        const res = await fetch(`${API_URL}/bookings/user/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.bookings || data.data || [];
        const checkedIn = list.find((b) => b.bookingStatus === "checked_in");
        if (!cancelled) {
          setActiveStay(checkedIn || null);
          if (checkedIn?.roomId?.roomNumber) {
            setRoomNumber(String(checkedIn.roomId.roomNumber));
          } else if (checkedIn?.roomNumber) {
            setRoomNumber(String(checkedIn.roomNumber));
          }
        }
      } catch {
        /* browse menu without stay is fine */
      }
    };
    loadStay();
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const openOrderModal = (item) => {
    if (!user) {
      showNotification("error", "Please sign in to order room service or reserve dishes.");
      return;
    }
    if (!activeStay) {
      showNotification(
        "error",
        "In-room dining is available after check-in. Open Profile → My Bookings to check in on your arrival date, then order with your room number."
      );
      return;
    }
    setSelectedItem(item);
    setQuantity(1);
    setGuestName(user.name || "");
    const rn =
      activeStay?.roomId?.roomNumber ||
      activeStay?.roomNumber ||
      user.roomNumber ||
      roomNumber ||
      "";
    setRoomNumber(String(rn));
    setNotes("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const placeOrder = async () => {
    try {
      if (!token) {
        showNotification("error", "Please sign in to place an in-room dining order.");
        return;
      }
      if (!selectedItem) return;

      const cleanedRoom = roomNumber.trim();
      if (!cleanedRoom) {
        showNotification(
          "error",
          "Enter your checked-in room number to place an in-room dining order."
        );
        return;
      }

      const computedTotal = Number(selectedItem.price * quantity);
      const orderData = {
        userId: user?._id || user?.id || null,
        guestName: guestName.trim() || user?.name || "Valued Guest",
        roomNumber: cleanedRoom,
        item: selectedItem,
        items: [
          {
            menuItemId: selectedItem._id,
            name: selectedItem.name,
            quantity: Number(quantity) || 1,
            price: Number(selectedItem.price) || 0,
          },
        ],
        quantity: Number(quantity) || 1,
        notes: notes.trim(),
        total: computedTotal,
        totalAmount: computedTotal,
      };

      const res = await fetch(`${API_URL}/restaurant/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit kitchen order");

      showNotification("success", "Dish order submitted successfully! Kitchen is preparing.");
      closeModal();
    } catch (err) {
      showNotification("error", err.message || "Order placement encounte an issue.");
    }
  };

  // Build tabs dynamically from categories or distinct menuData categories
  const dynamicTabs = React.useMemo(() => {
    const names = Array.from(
      new Set([
        ...categories.map(c => c.name),
        ...menuData.map(i => i.category),
        'Desi', 'Italian', 'Chinese', 'Fast Food'
      ].filter(Boolean))
    );
    return names.map(name => {
      const matchDefault = TABS.find(t => t.key.toLowerCase() === name.toLowerCase());
      return {
        key: name,
        label: matchDefault ? matchDefault.label : name,
        icon: matchDefault ? matchDefault.icon : getTabIcon(name),
      };
    });
  }, [categories, menuData]);

  // Match category flexibly
  const filterMenu = menuData.filter((item) => {
    const itemCat = (item.category || "").replace(/\s/g, "").toLowerCase();
    const tabCat = activeTab.replace(/\s/g, "").toLowerCase();
    return itemCat === tabCat || itemCat.includes(tabCat) || tabCat.includes(itemCat);
  });

  return (
    <>
      <style>{STYLES}</style>

      {/* Floating Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 99999,
            minWidth: 320,
            maxWidth: 420,
            background: "#FFFFFF",
            borderRadius: 14,
            boxShadow: "0 10px 36px rgba(0,0,0,0.18)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            borderLeft: `5px solid ${notification.type === "success" ? "" : "#CC5B55"}`,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              flexShrink: 0,
              background:
                notification.type === "success"
                  ? "linear-gradient(135deg, , var(--theme-primary-hover, #122642))"
                  : "#CC5B55",
              display: "grid",
              placeItems: "center",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {notification.type === "success" ? "✓" : "✕"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--theme-text-dark, #0F172A)", marginBottom: 2 }}>
              {notification.type === "success" ? "Order Confirmed" : "Notice"}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>{notification.message}</div>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      <section className="menu-section">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-4">
            <span
              style={{
                color: "",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Luxury Culinary Experiences
            </span>
            <h2 className="menu-title">
              Signature <span>Dining & Menus</span>
            </h2>
            <p className="menu-subtitle">
              Prepared by master chefs with organic farm ingredients and royal recipes.
            </p>
            <div
              className="mx-auto mt-3 px-3 py-2 rounded-3 text-start"
              style={{
                maxWidth: 640,
                background: activeStay ? "rgba(54,133,104,0.08)" : "var(--theme-primary-soft, rgba(27, 54, 93, 0.12))",
                border: `1px solid ${activeStay ? "rgba(54,133,104,0.35)" : "var(--theme-primary-soft, rgba(27, 54, 93, 0.35))"}`,
                fontSize: "0.88rem",
                color: "#444",
              }}
            >
              {activeStay ? (
                <>
                  <i className="fa-solid fa-circle-check me-2" style={{ color: "#27ae60" }}></i>
                  Active stay detected
                  {roomNumber ? ` — Room ${roomNumber}` : ""}. You can order dishes to your room.
                </>
              ) : (
                <>
                  <i className="fa-solid fa-info-circle me-2" style={{ color: "" }}></i>
                  Browse the menu anytime. <strong>Order to Room</strong> requires sign-in and an
                  active checked-in booking.{" "}
                  <Link to={user ? "/profile" : "/user-login"} style={{ color: "", fontWeight: 600 }}>
                    {user ? "Go to My Bookings" : "Sign in"}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="menu-tabs">
            {dynamicTabs.map((tab) => (
              <button
                key={tab.key}
                className={`menu-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: "", width: "3rem", height: "3rem" }}></div>
              <p className="mt-3" style={{ color: "#777", fontSize: "14px" }}>
                Curating exquisite dishes from the kitchen...
              </p>
            </div>
          ) : filterMenu.length === 0 ? (
            <div className="text-center py-5" style={{ color: "#888" }}>
              <i className="fa-solid fa-utensils fa-3x mb-3" style={{ color: "#DDD" }}></i>
              <p style={{ fontSize: "16px" }}>No dishes listed in this category at this moment.</p>
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill mt-2"
                onClick={() => setActiveTab(dynamicTabs[0]?.key || "Desi")}
              >
                View {dynamicTabs[0]?.label || "Menu"}
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filterMenu.map((item) => (
                <div key={item._id} className="col-md-6 col-lg-6 col-xl-4">
                  <div className="menu-card">
                    <img
                      className="menu-card-img"
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                      }}
                    />
                    <div className="menu-card-body">
                      <div>
                        <div className="menu-card-name">{item.name}</div>
                        <div className="menu-card-desc">{item.description}</div>
                        {item.dietaryTags && item.dietaryTags.length > 0 && (
                          <div className="menu-dietary-tags">
                            {item.dietaryTags.map((tag) => {
                              const config = DIETARY_CONFIG[tag];
                              if (!config) return null;
                              return (
                                <span
                                  key={tag}
                                  className="menu-dietary-tag"
                                  style={{ color: config.color, background: config.bg }}
                                >
                                  <i className={`fa-solid ${config.icon}`} style={{ fontSize: "9px" }}></i>
                                  {config.label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="menu-card-footer">
                        <div className="menu-card-price">PKR {Number(item.price).toLocaleString()}</div>
                        <button
                          className="menu-order-btn"
                          onClick={() => openOrderModal(item)}
                          disabled={item.isAvailable === false}
                        >
                          <i className="fa-solid fa-bell-concierge"></i>
                          {item.isAvailable === false ? "Unavailable" : "Order to Room"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Modal */}
        {showModal && selectedItem && (
          <div className="menu-modal-backdrop" onClick={closeModal}>
            <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
              <div className="menu-modal-header">
                <h6 className="menu-modal-title">
                  <i className="fa-solid fa-bell-concierge me-2" style={{ color: "" }}></i>
                  Place In-Room Dining Order
                </h6>
                <button className="menu-modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <div className="menu-modal-body">
                <div className="menu-modal-item">
                  <img src={getImageUrl(selectedItem.image)} alt={selectedItem.name} />
                  <div>
                    <div className="menu-modal-item-name">{selectedItem.name}</div>
                    <div className="menu-modal-item-price">
                      PKR {Number(selectedItem.price).toLocaleString()} each
                    </div>
                  </div>
                </div>

                <label style={{ fontSize: "12px", fontWeight: 700, color: "#555", marginBottom: 4 }}>
                  Guest Name
                </label>
                <input
                  className="menu-modal-input"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full name"
                />

                <label style={{ fontSize: "12px", fontWeight: 700, color: "#555", marginBottom: 4 }}>
                  Checked-in Room Number *
                </label>
                <input
                  className="menu-modal-input"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 301"
                  required
                />
                <p style={{ fontSize: "11px", color: "#888", marginTop: 4, marginBottom: 10 }}>
                  Available only while you are checked in to that room.
                </p>

                <div className="menu-qty-row">
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Quantity</span>
                  <div className="menu-qty-controls">
                    <button className="menu-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      −
                    </button>
                    <span style={{ fontSize: "15px", fontWeight: 700, minWidth: 24, textAlign: "center" }}>
                      {quantity}
                    </span>
                    <button className="menu-qty-btn" onClick={() => setQuantity(quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>

                <div className="menu-total-row">
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Total Payable</span>
                  <span style={{ fontSize: "17px", fontWeight: 700, color: "" }}>
                    PKR {Number(selectedItem.price * quantity).toLocaleString()}
                  </span>
                </div>

                <label style={{ fontSize: "12px", fontWeight: 700, color: "#555", marginBottom: 4 }}>
                  Special Culinary Notes (Optional)
                </label>
                <textarea
                  className="menu-modal-input"
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mild spice, extra napkins, serve warm..."
                  style={{ borderRadius: "8px", resize: "none" }}
                />
              </div>

              <div className="menu-modal-footer">
                <button
                  className="btn btn-outline-secondary w-50 rounded-pill py-2"
                  style={{ fontSize: "13px" }}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="btn ls-btn-gold w-50 rounded-pill py-2"
                  style={{ fontSize: "13px", fontWeight: 700 }}
                  onClick={placeOrder}
                >
                  <i className="fa-solid fa-check me-2"></i>Confirm Order
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default RestaurantMenu;
