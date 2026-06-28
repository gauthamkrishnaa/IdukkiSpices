import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Leaf,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X
} from "lucide-react";
import "./modern.css";

const money = (value) => `€${Number(value || 0).toFixed(2)}`;
const MIN_ORDER_VALUE = 1;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 0;
const cartKey = "idukki-react-cart";
const adminKey = "idukki-admin-session";
const customerKey = "idukki-customer-session";
const customerDataKey = "idukki-current-customer";
const accountSectionKey = "idukki-account-section";
const themeKey = "idukki-theme";
const customerNotificationsKey = "idukki-customer-notifications";
const customerOrderSnapshotKey = "idukki-customer-order-snapshots";
const companyContactEmail = "idukkispicesfr@gmail.com";
const companyContactPhone = "+33 7 82 50 45 14";
const companyContactLocation = "Paris, France";
const companyInstagramUrl = "https://www.instagram.com/idukkispicesfr?utm_source=qr";

const countries = [
  ["🇦🇫", "Afghanistan", "+93"], ["🇦🇱", "Albania", "+355"], ["🇩🇿", "Algeria", "+213"], ["🇦🇩", "Andorra", "+376"],
  ["🇦🇴", "Angola", "+244"], ["🇦🇬", "Antigua and Barbuda", "+1268"], ["🇦🇷", "Argentina", "+54"], ["🇦🇲", "Armenia", "+374"],
  ["🇦🇺", "Australia", "+61"], ["🇦🇹", "Austria", "+43"], ["🇦🇿", "Azerbaijan", "+994"], ["🇧🇸", "Bahamas", "+1242"],
  ["🇧🇭", "Bahrain", "+973"], ["🇧🇩", "Bangladesh", "+880"], ["🇧🇧", "Barbados", "+1246"], ["🇧🇾", "Belarus", "+375"],
  ["🇧🇪", "Belgium", "+32"], ["🇧🇿", "Belize", "+501"], ["🇧🇯", "Benin", "+229"], ["🇧🇹", "Bhutan", "+975"],
  ["🇧🇴", "Bolivia", "+591"], ["🇧🇦", "Bosnia and Herzegovina", "+387"], ["🇧🇼", "Botswana", "+267"], ["🇧🇷", "Brazil", "+55"],
  ["🇧🇳", "Brunei", "+673"], ["🇧🇬", "Bulgaria", "+359"], ["🇧🇫", "Burkina Faso", "+226"], ["🇧🇮", "Burundi", "+257"],
  ["🇰🇭", "Cambodia", "+855"], ["🇨🇲", "Cameroon", "+237"], ["🇨🇦", "Canada", "+1"], ["🇨🇻", "Cape Verde", "+238"],
  ["🇨🇫", "Central African Republic", "+236"], ["🇹🇩", "Chad", "+235"], ["🇨🇱", "Chile", "+56"], ["🇨🇳", "China", "+86"],
  ["🇨🇴", "Colombia", "+57"], ["🇰🇲", "Comoros", "+269"], ["🇨🇬", "Congo", "+242"], ["🇨🇷", "Costa Rica", "+506"],
  ["🇭🇷", "Croatia", "+385"], ["🇨🇺", "Cuba", "+53"], ["🇨🇾", "Cyprus", "+357"], ["🇨🇿", "Czech Republic", "+420"],
  ["🇩🇰", "Denmark", "+45"], ["🇩🇯", "Djibouti", "+253"], ["🇩🇲", "Dominica", "+1767"], ["🇩🇴", "Dominican Republic", "+1809"],
  ["🇪🇨", "Ecuador", "+593"], ["🇪🇬", "Egypt", "+20"], ["🇸🇻", "El Salvador", "+503"], ["🇬🇶", "Equatorial Guinea", "+240"],
  ["🇪🇷", "Eritrea", "+291"], ["🇪🇪", "Estonia", "+372"], ["🇪🇹", "Ethiopia", "+251"], ["🇫🇯", "Fiji", "+679"],
  ["🇫🇮", "Finland", "+358"], ["🇫🇷", "France", "+33"], ["🇬🇦", "Gabon", "+241"], ["🇬🇲", "Gambia", "+220"],
  ["🇬🇪", "Georgia", "+995"], ["🇩🇪", "Germany", "+49"], ["🇬🇭", "Ghana", "+233"], ["🇬🇷", "Greece", "+30"],
  ["🇬🇩", "Grenada", "+1473"], ["🇬🇹", "Guatemala", "+502"], ["🇬🇳", "Guinea", "+224"], ["🇬🇼", "Guinea-Bissau", "+245"],
  ["🇬🇾", "Guyana", "+592"], ["🇭🇹", "Haiti", "+509"], ["🇭🇳", "Honduras", "+504"], ["🇭🇰", "Hong Kong", "+852"],
  ["🇭🇺", "Hungary", "+36"], ["🇮🇸", "Iceland", "+354"], ["🇮🇳", "India", "+91"], ["🇮🇩", "Indonesia", "+62"],
  ["🇮🇷", "Iran", "+98"], ["🇮🇶", "Iraq", "+964"], ["🇮🇪", "Ireland", "+353"], ["🇮🇱", "Israel", "+972"],
  ["🇮🇹", "Italy", "+39"], ["🇯🇲", "Jamaica", "+1876"], ["🇯🇵", "Japan", "+81"], ["🇯🇴", "Jordan", "+962"],
  ["🇰🇿", "Kazakhstan", "+7"], ["🇰🇪", "Kenya", "+254"], ["🇰🇮", "Kiribati", "+686"], ["🇰🇼", "Kuwait", "+965"],
  ["🇰🇬", "Kyrgyzstan", "+996"], ["🇱🇦", "Laos", "+856"], ["🇱🇻", "Latvia", "+371"], ["🇱🇧", "Lebanon", "+961"],
  ["🇱🇸", "Lesotho", "+266"], ["🇱🇷", "Liberia", "+231"], ["🇱🇾", "Libya", "+218"], ["🇱🇮", "Liechtenstein", "+423"],
  ["🇱🇹", "Lithuania", "+370"], ["🇱🇺", "Luxembourg", "+352"], ["🇲🇴", "Macau", "+853"], ["🇲🇬", "Madagascar", "+261"],
  ["🇲🇼", "Malawi", "+265"], ["🇲🇾", "Malaysia", "+60"], ["🇲🇻", "Maldives", "+960"], ["🇲🇱", "Mali", "+223"],
  ["🇲🇹", "Malta", "+356"], ["🇲🇭", "Marshall Islands", "+692"], ["🇲🇷", "Mauritania", "+222"], ["🇲🇺", "Mauritius", "+230"],
  ["🇲🇽", "Mexico", "+52"], ["🇫🇲", "Micronesia", "+691"], ["🇲🇩", "Moldova", "+373"], ["🇲🇨", "Monaco", "+377"],
  ["🇲🇳", "Mongolia", "+976"], ["🇲🇪", "Montenegro", "+382"], ["🇲🇦", "Morocco", "+212"], ["🇲🇿", "Mozambique", "+258"],
  ["🇲🇲", "Myanmar", "+95"], ["🇳🇦", "Namibia", "+264"], ["🇳🇷", "Nauru", "+674"], ["🇳🇵", "Nepal", "+977"],
  ["🇳🇱", "Netherlands", "+31"], ["🇳🇿", "New Zealand", "+64"], ["🇳🇮", "Nicaragua", "+505"], ["🇳🇪", "Niger", "+227"],
  ["🇳🇬", "Nigeria", "+234"], ["🇰🇵", "North Korea", "+850"], ["🇲🇰", "North Macedonia", "+389"], ["🇳🇴", "Norway", "+47"],
  ["🇴🇲", "Oman", "+968"], ["🇵🇰", "Pakistan", "+92"], ["🇵🇼", "Palau", "+680"], ["🇵🇸", "Palestine", "+970"],
  ["🇵🇦", "Panama", "+507"], ["🇵🇬", "Papua New Guinea", "+675"], ["🇵🇾", "Paraguay", "+595"], ["🇵🇪", "Peru", "+51"],
  ["🇵🇭", "Philippines", "+63"], ["🇵🇱", "Poland", "+48"], ["🇵🇹", "Portugal", "+351"], ["🇵🇷", "Puerto Rico", "+1787"],
  ["🇶🇦", "Qatar", "+974"], ["🇷🇴", "Romania", "+40"], ["🇷🇺", "Russia", "+7"], ["🇷🇼", "Rwanda", "+250"],
  ["🇰🇳", "Saint Kitts and Nevis", "+1869"], ["🇱🇨", "Saint Lucia", "+1758"], ["🇻🇨", "Saint Vincent", "+1784"],
  ["🇼🇸", "Samoa", "+685"], ["🇸🇲", "San Marino", "+378"], ["🇸🇹", "Sao Tome and Principe", "+239"],
  ["🇸🇦", "Saudi Arabia", "+966"], ["🇸🇳", "Senegal", "+221"], ["🇷🇸", "Serbia", "+381"], ["🇸🇨", "Seychelles", "+248"],
  ["🇸🇱", "Sierra Leone", "+232"], ["🇸🇬", "Singapore", "+65"], ["🇸🇰", "Slovakia", "+421"], ["🇸🇮", "Slovenia", "+386"],
  ["🇸🇧", "Solomon Islands", "+677"], ["🇸🇴", "Somalia", "+252"], ["🇿🇦", "South Africa", "+27"], ["🇰🇷", "South Korea", "+82"],
  ["🇸🇸", "South Sudan", "+211"], ["🇪🇸", "Spain", "+34"], ["🇱🇰", "Sri Lanka", "+94"], ["🇸🇩", "Sudan", "+249"],
  ["🇸🇷", "Suriname", "+597"], ["🇸🇪", "Sweden", "+46"], ["🇨🇭", "Switzerland", "+41"], ["🇸🇾", "Syria", "+963"],
  ["🇹🇼", "Taiwan", "+886"], ["🇹🇯", "Tajikistan", "+992"], ["🇹🇿", "Tanzania", "+255"], ["🇹🇭", "Thailand", "+66"],
  ["🇹🇱", "Timor-Leste", "+670"], ["🇹🇬", "Togo", "+228"], ["🇹🇴", "Tonga", "+676"], ["🇹🇹", "Trinidad and Tobago", "+1868"],
  ["🇹🇳", "Tunisia", "+216"], ["🇹🇷", "Turkey", "+90"], ["🇹🇲", "Turkmenistan", "+993"], ["🇹🇻", "Tuvalu", "+688"],
  ["🇺🇬", "Uganda", "+256"], ["🇺🇦", "Ukraine", "+380"], ["🇦🇪", "United Arab Emirates", "+971"], ["🇬🇧", "United Kingdom", "+44"],
  ["🇺🇸", "United States", "+1"], ["🇺🇾", "Uruguay", "+598"], ["🇺🇿", "Uzbekistan", "+998"], ["🇻🇺", "Vanuatu", "+678"],
  ["🇻🇦", "Vatican City", "+379"], ["🇻🇪", "Venezuela", "+58"], ["🇻🇳", "Vietnam", "+84"], ["🇾🇪", "Yemen", "+967"],
  ["🇿🇲", "Zambia", "+260"], ["🇿🇼", "Zimbabwe", "+263"]
];

const api = async (path, options = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  const needsAdminToken = (
    path.startsWith("/api/admin") ||
    (path.startsWith("/api/contact-messages") && method !== "POST") ||
    path.startsWith("/api/customers") ||
    path.startsWith("/api/email-outbox") ||
    path.startsWith("/api/invoice") ||
    path.startsWith("/api/orders/refund") ||
    (path.startsWith("/api/orders") && method !== "POST") ||
    (path.startsWith("/api/products") && method !== "GET")
  );
  const token = needsAdminToken ? sessionStorage.getItem(adminKey) : sessionStorage.getItem(customerKey);
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || data?.detail || "Request failed");
  return data;
};

const pageFromPath = () => {
  const clean = window.location.pathname.split("/").pop() || "index.html";
  return clean.replace(".html", "") || "index";
};

const readJsonStorage = (storage, key, fallback) => {
  try {
    return JSON.parse(storage.getItem(key) || "null") || fallback;
  } catch {
    storage.removeItem(key);
    return fallback;
  }
};

const customerScopedKey = (base, customer) => `${base}:${String(customer?.email || "guest").trim().toLowerCase()}`;

const notificationForStatus = (order, field, status) => {
  const id = order.id || "your order";
  const total = money(order.total);
  if (field === "paymentStatus") {
    const paymentMessages = {
      Paid: ["Order confirmed", `Payment received for ${id}. Total paid: ${total}.`],
      "Refund requested": ["Refund requested", `Your refund request for ${id} was sent to Idukki Spices.`],
      Refunded: ["Refund approved", `Refund for ${id} has been approved and credited by the shop.`]
    };
    return paymentMessages[status] || null;
  }
  const deliveryMessages = {
    Processing: ["Order processing", `${id} is now being prepared.`],
    Packed: ["Order packed", `${id} has been packed and will be shipped soon.`],
    Shipped: ["Order shipped", `${id} is on the way.`],
    Delivered: ["Order delivered", `${id} has been marked as delivered.`],
    Cancelled: ["Order cancelled", `${id} has been cancelled.`]
  };
  return deliveryMessages[status] || null;
};

const translations = {
  "Home": "Accueil",
  "About": "À propos",
  "Shop": "Boutique",
  "Cart": "Panier",
  "Login": "Connexion",
  "Contact": "Contact",
  "My account": "Mon compte",
  "Kerala aroma, packed with care": "Arôme du Kerala, emballé avec soin",
  "Idukki Spices for real kitchens": "Idukki Spices pour les vraies cuisines",
  "Premium cardamom, pepper, warm whole spices, and ready-to-cook mixed packs with a simple secure checkout.": "Cardamome, poivre, épices entières et mélanges prêts à cuisiner avec un paiement sécurisé simple.",
  "Shop spices": "Acheter des épices",
  "Our plantation story": "Notre histoire",
  "Secure online checkout": "Paiement en ligne sécurisé",
  "Featured": "Sélection",
  "Fresh packs customers can buy quickly": "Des sachets frais à acheter rapidement",
  "Sourced from Idukki inspired farms": "Inspiré des plantations d'Idukki",
  "Stripe secure payment": "Paiement sécurisé Stripe",
  "Order tracking status": "Suivi de commande",
  "About Idukki Spices": "À propos d'Idukki Spices",
  "Built around freshness, aroma, and honest packing.": "Pensé pour la fraîcheur, l'arôme et un emballage sérieux.",
  "We bring classic Kerala spices into clean retail packs for everyday cooking, gifting, and family kitchens.": "Nous proposons les épices classiques du Kerala dans des packs propres pour la cuisine quotidienne, les cadeaux et les familles.",
  "Harvest": "Récolte",
  "Sort": "Tri",
  "Pack": "Emballage",
  "Deliver": "Livraison",
  "Each stage is handled with care so customers receive clean, aromatic spices ready for the shelf.": "Chaque étape est faite avec soin pour livrer des épices propres, parfumées et prêtes à utiliser.",
  "Choose spices and update quantity instantly": "Choisissez vos épices et ajustez la quantité",
  "Search cardamom, pepper...": "Rechercher cardamome, poivre...",
  "All categories": "Toutes les catégories",
  "Whole spices": "Épices entières",
  "Blends": "Mélanges",
  "Leaves": "Feuilles",
  "Add to cart": "Ajouter au panier",
  "Update cart": "Mettre à jour",
  "Ready to add": "Prêt à ajouter",
  "Close": "Fermer",
  "Review your spices": "Vérifiez vos épices",
  "Your cart is empty": "Votre panier est vide",
  "Start shopping": "Commencer les achats",
  "Order summary": "Résumé de commande",
  "Items": "Articles",
  "Subtotal": "Sous-total",
  "Shipping": "Livraison",
  "Free": "Gratuite",
  "Total": "Total",
  "Minimum order value is €1.": "Le minimum de commande est de 1 €.",
  "Free delivery for all test orders.": "Livraison gratuite pour toutes les commandes de test.",
  "Add more spices to reach the €1 minimum order.": "Ajoutez plus d'épices pour atteindre le minimum de commande de 1 €.",
  "You have free delivery on this order.": "La livraison est gratuite pour cette commande.",
  "Checkout": "Paiement",
  "Clear cart": "Vider le panier",
  "Delivery details": "Détails de livraison",
  "Full name": "Nom complet",
  "Email": "E-mail",
  "Phone number": "Numéro de téléphone",
  "Phone": "Téléphone",
  "Address": "Adresse",
  "Pay securely": "Payer en sécurité",
  "Your pack": "Votre panier",
  "Secure spice shopping starts here.": "Vos achats d'épices sécurisés commencent ici.",
  "Login with OTP, save delivery details, and track orders in a cleaner account experience.": "Connectez-vous avec OTP, enregistrez vos détails de livraison et suivez vos commandes.",
  "Create account": "Créer un compte",
  "Send OTP to": "Envoyer l'OTP à",
  "OTP code": "Code OTP",
  "Send OTP": "Envoyer l'OTP",
  "Verify and login": "Vérifier et se connecter",
  "Local phone number": "Numéro local",
  "Account": "Compte",
  "Your saved details": "Vos informations enregistrées",
  "Profile": "Profil",
  "Orders": "Commandes",
  "Account settings": "Paramètres du compte",
  "No phone saved": "Aucun téléphone enregistré",
  "No address saved": "Aucune adresse enregistrée",
  "Edit profile": "Modifier le profil",
  "View orders": "Voir les commandes",
  "Save details": "Enregistrer",
  "Cancel": "Annuler",
  "Name": "Nom",
  "Not saved": "Non enregistré",
  "My orders": "Mes commandes",
  "All orders from your account": "Toutes les commandes de votre compte",
  "Total orders": "Total commandes",
  "Total spent": "Total dépensé",
  "Latest status": "Dernier statut",
  "No orders": "Aucune commande",
  "No orders yet": "Aucune commande pour le moment",
  "Contact Idukki Spices": "Contacter Idukki Spices",
  "Questions, delivery help, product details, or business orders. Send a message and we will reply as soon as possible.": "Questions, aide à la livraison, détails produits ou commandes professionnelles. Envoyez un message et nous répondrons dès que possible.",
  "Email us": "Envoyez-nous un e-mail",
  "Business hours": "Horaires",
  "Monday to Saturday": "Lundi à samedi",
  "Send message": "Envoyer le message",
  "Sending...": "Envoi...",
  "Message sent. Idukki Spices will reply by email.": "Message envoyé. Idukki Spices répondra par e-mail.",
  "Contact details": "Coordonnées",
  "Quick contact": "Contact rapide",
  "Need help with an order or product?": "Besoin d'aide avec une commande ou un produit ?",
  "Write to us and include your order number if you already purchased.": "Écrivez-nous et ajoutez votre numéro de commande si vous avez déjà acheté.",
  "Fresh Kerala-inspired spices, secure checkout, and quick support.": "Épices inspirées du Kerala, paiement sécurisé et assistance rapide.",
  "Write to us": "Écrivez-nous",
  "Message": "Message",
  "How can we help?": "Comment pouvons-nous aider ?",
  "Location": "Adresse",
  "Deactivate account": "Désactiver le compte",
  "This removes your saved login account and delivery details. Past orders stay with the shop for invoice and business records.": "Cela supprime votre compte de connexion et vos informations de livraison. Les anciennes commandes restent dans la boutique pour les factures et les documents professionnels.",
  "Are you sure?": "Êtes-vous sûr ?",
  "Yes, deactivate": "Oui, désactiver",
  "Manage account access": "Gérer l'accès au compte",
  "Use this area only if you want to close your saved account.": "Utilisez cette zone uniquement si vous souhaitez fermer votre compte enregistré.",
  "Login required": "Connexion requise",
  "Go to login": "Aller à la connexion",
  "Logout": "Déconnexion",
  "Fresh Kerala-inspired spices, secure checkout, and order tracking.": "Épices inspirées du Kerala, paiement sécurisé et suivi de commande.",
  "Business dashboard login": "Connexion tableau de bord",
  "Sign in": "Se connecter",
  "Business dashboard": "Tableau de bord",
  "Operations": "Opérations",
  "Idukki Spices control room": "Espace de gestion Idukki Spices",
  "Products": "Produits",
  "Customers": "Clients",
  "Customer accounts": "Comptes clients",
  "Recent orders": "Commandes récentes",
  "Payment successful. Your order is now marked paid.": "Paiement réussi. Votre commande est marquée payée.",
  "View account": "Voir le compte",
  "Searching addresses...": "Recherche d'adresses..."
};

const productTranslations = {
  fr: {
    "green-cardamom-50": {
      name: "Cardamome verte 50g",
      category: "entier",
      description: "Gousses de cardamome verte parfumées d'Idukki pour le thé, les desserts, le biryani et les currys mijotés.",
      uses: "Idéal pour le thé, les douceurs, le biryani et le riz de fête."
    },
    "green-cardamom-100": {
      name: "Cardamome verte 100g",
      category: "entier",
      description: "Un grand sachet de gousses de cardamome lumineuses et aromatiques, avec une douceur naturelle profonde.",
      uses: "Idéal pour les amateurs de thé régulier et la cuisine familiale."
    },
    "mixed-spices-100": {
      name: "Mélange d'épices 100g",
      category: "mélange",
      description: "Un mélange équilibré pour la cuisine quotidienne, les plats rôtis, les marinades et les repas de fête.",
      uses: "Idéal pour les currys du quotidien, les marinades et les plats rôtis."
    },
    "black-pepper": {
      name: "Poivre noir",
      category: "entier",
      description: "Grains de poivre puissants avec une chaleur nette et une finale propre.",
      uses: "Idéal pour finir les currys, soupes, oeufs et grillades."
    },
    cloves: {
      name: "Clous de girofle",
      category: "entier",
      description: "Clous de girofle chauds et intenses pour mélanges d'épices, desserts, thés et pickles.",
      uses: "Idéal pour les mélanges d'épices, le riz, les pickles et les boissons chaudes."
    },
    cinnamon: {
      name: "Cannelle",
      category: "entier",
      description: "Cannelle douce et boisée pour la pâtisserie, les boissons et les plats mijotés.",
      uses: "Idéal pour la pâtisserie, le thé, les desserts et les sauces mijotées."
    },
    "star-anise": {
      name: "Anis étoilé",
      category: "entier",
      description: "Bel anis étoilé avec une chaleur rappelant la réglisse, parfait pour bouillons et masalas.",
      uses: "Idéal pour les bouillons, le biryani, les mélanges masala et la cuisson lente."
    },
    "bay-leaves": {
      name: "Feuilles de laurier",
      category: "feuille",
      description: "Feuilles de laurier séchées qui ajoutent une douceur herbacée aux soupes, riz et currys.",
      uses: "Idéal pour les soupes, le riz, les ragoûts et les currys."
    }
  }
};

const productFallbackIds = {
  "Green Cardamom 50g": "green-cardamom-50",
  "Green Cardamom 100g": "green-cardamom-100",
  "Mixed Spices 100g": "mixed-spices-100",
  "Black Pepper": "black-pepper",
  "Cloves": "cloves",
  "Cinnamon": "cinnamon",
  "Star Anise": "star-anise",
  "Bay Leaves": "bay-leaves"
};

const localizeProduct = (product, lang) => {
  if (lang !== "fr" || !product) return product;
  const id = product.id || productFallbackIds[product.name];
  const translated = productTranslations.fr[id];
  return translated ? { ...product, ...translated, originalName: product.name } : product;
};

const ShippingPrice = ({ subtotal, shippingFee, lang }) => {
  if (!subtotal) return <strong>{money(0)}</strong>;
  if (shippingFee) return <strong>{money(shippingFee)}</strong>;
  return (
    <strong className="free-shipping-price">
      <s>{money(SHIPPING_FEE)}</s>
      <span>{lang === "fr" ? "Gratuite" : "Free"}</span>
    </strong>
  );
};

function translateInterface(lang) {
  document.documentElement.lang = lang;
  if (lang !== "fr") return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const text = node.nodeValue.trim();
    if (translations[text]) node.nodeValue = node.nodeValue.replace(text, translations[text]);
  });
  document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((input) => {
    const placeholder = input.getAttribute("placeholder");
    if (translations[placeholder]) input.setAttribute("placeholder", translations[placeholder]);
  });
}

function useAddressSuggestions(value) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const query = String(value || "").trim();
    if (query.length < 4) {
      setSuggestions([]);
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
          q: query
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal
        });
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data.map((item) => item.display_name).filter(Boolean) : []);
      } catch (error) {
        if (error.name !== "AbortError") setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);
  return { suggestions, setSuggestions, loading };
}

function App() {
  const [page, setPage] = useState(pageFromPath());
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => (
    sessionStorage.getItem(customerKey) ? readJsonStorage(localStorage, cartKey, {}) : {}
  ));
  const [customer, setCustomer] = useState(() => readJsonStorage(sessionStorage, customerDataKey, null));
  const [lang, setLang] = useState(() => localStorage.getItem("idukki-language") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem(themeKey) || "light");
  const [pageBusy, setPageBusy] = useState(false);
  const [customerNotifications, setCustomerNotifications] = useState([]);
  const [cartToast, setCartToast] = useState(null);

  useEffect(() => {
    api("/api/products").then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    localStorage.setItem("idukki-language", lang);
    translateInterface(page === "admin" ? "en" : lang);
  }, [lang, page, products, cart, customer]);

  useEffect(() => {
    localStorage.setItem(themeKey, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!customer) {
      setCustomerNotifications([]);
      return;
    }
    setCustomerNotifications(readJsonStorage(localStorage, customerScopedKey(customerNotificationsKey, customer), []));
  }, [customer?.email]);

  useEffect(() => {
    if (!cartToast) return undefined;
    const timer = window.setTimeout(() => setCartToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [cartToast]);

  useEffect(() => {
    if (!customer) return;
    let active = true;
    api("/api/account/profile")
      .then((account) => {
        if (!active) return;
        sessionStorage.setItem(customerDataKey, JSON.stringify(account));
        setCustomer(account);
      })
      .catch((error) => {
        if (!active) return;
        if (["Account not found", "Account login required"].includes(error.message)) {
          sessionStorage.removeItem(customerKey);
          sessionStorage.removeItem(customerDataKey);
          sessionStorage.removeItem(accountSectionKey);
          localStorage.removeItem(cartKey);
          setCustomer(null);
          setCart({});
        }
      });
    return () => { active = false; };
  }, [customer?.email]);

  useEffect(() => {
    if (customer) return;
    localStorage.removeItem(cartKey);
    setCart({});
  }, [customer]);

  const go = (next) => {
    const path = next === "index" ? "/" : `/${next}.html`;
    setPageBusy(true);
    window.history.pushState({}, "", path);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => setPageBusy(false), 520);
  };

  useEffect(() => {
    const onPop = () => setPage(pageFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const saveCustomerNotifications = (next) => {
    setCustomerNotifications(next);
    if (customer) {
      localStorage.setItem(customerScopedKey(customerNotificationsKey, customer), JSON.stringify(next));
    }
  };

  const addCustomerNotification = (title, body) => {
    if (!customer || !title) return;
    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        body,
        createdAt: new Date().toISOString(),
        read: false
      },
      ...readJsonStorage(localStorage, customerScopedKey(customerNotificationsKey, customer), [])
    ].slice(0, 30);
    saveCustomerNotifications(next);
  };

  const clearCustomerNotifications = () => {
    if (customer) localStorage.removeItem(customerScopedKey(customerNotificationsKey, customer));
    setCustomerNotifications([]);
  };

  const markCustomerNotificationsRead = () => {
    if (!customerNotifications.some((item) => !item.read)) return;
    const next = customerNotifications.map((item) => ({ ...item, read: true }));
    saveCustomerNotifications(next);
  };

  const syncCustomerOrderNotifications = (orders = []) => {
    if (!customer) return;
    const snapshotKey = customerScopedKey(customerOrderSnapshotKey, customer);
    const previous = readJsonStorage(localStorage, snapshotKey, null);
    const nextSnapshot = orders.reduce((snapshot, order) => {
      snapshot[order.id] = {
        paymentStatus: order.paymentStatus || "",
        deliveryStatus: order.deliveryStatus || ""
      };
      return snapshot;
    }, {});

    if (previous) {
      const updates = [];
      orders.forEach((order) => {
        const before = previous[order.id];
        if (!before) return;
        [
          ["paymentStatus", order.paymentStatus || ""],
          ["deliveryStatus", order.deliveryStatus || ""]
        ].forEach(([field, status]) => {
          if (before[field] === status) return;
          const message = notificationForStatus(order, field, status);
          if (message) {
            updates.push({
              id: `${order.id}-${field}-${status}-${Date.now()}`,
              title: message[0],
              body: message[1],
              createdAt: new Date().toISOString(),
              read: false
            });
          }
        });
      });
      if (updates.length) {
        const existing = readJsonStorage(localStorage, customerScopedKey(customerNotificationsKey, customer), []);
        saveCustomerNotifications([...updates, ...existing].slice(0, 30));
      }
    }
    localStorage.setItem(snapshotKey, JSON.stringify(nextSnapshot));
  };

  const addToCart = (id, amount = 1) => {
    setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + amount) }));
    if (amount > 0) {
      const product = products.find((item) => item.id === id);
      const displayProduct = localizeProduct(product, lang);
      setCartToast({
        id: Date.now(),
        title: lang === "fr" ? "Ajouté au panier" : "Added to cart",
        message: `${amount} x ${displayProduct?.name || "Item"}`
      });
    }
  };

  const cartItems = useMemo(() => products
    .filter((product) => cart[product.id])
    .map((product) => ({ ...product, qty: cart[product.id] })), [products, cart]);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingFee = cartTotal > 0 && cartTotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const orderTotal = cartTotal + shippingFee;
  const canCheckout = cartTotal >= MIN_ORDER_VALUE;

  const props = { go, products, cart, setCart, addToCart, cartItems, cartTotal, shippingFee, orderTotal, canCheckout, customer, setCustomer, lang, theme, setTheme, addCustomerNotification, syncCustomerOrderNotifications };
  const view = {
    index: <Home {...props} />,
    about: <About />,
    shop: <Shop {...props} />,
    cart: <Cart {...props} />,
    contact: <Contact />,
    checkout: <Checkout {...props} />,
    auth: <Auth setCustomer={setCustomer} go={go} />,
    account: <Account customer={customer} setCustomer={setCustomer} setCart={setCart} go={go} lang={lang} theme={theme} setTheme={setTheme} addCustomerNotification={addCustomerNotification} syncCustomerOrderNotifications={syncCustomerOrderNotifications} />,
    admin: <Admin products={products} setProducts={setProducts} />,
    invoice: <Invoice />,
    "payment-success": <PaymentSuccess go={go} addCustomerNotification={addCustomerNotification} />,
    "order-detail": <OrderDetail lang={lang} />
  }[page] || <Home {...props} />;
  const isAdminPage = page === "admin" || page === "invoice";

  return (
    <React.Fragment key={`${lang}-${page}`}>
      {pageBusy && <div className="page-loader" aria-hidden="true" />}
      {pageBusy && (
        <div className="center-loader" aria-live="polite" aria-label="Loading">
          <div className="cardamom-loader">
            <img src="/assets/cardamom-closeup.webp" alt="" />
          </div>
        </div>
      )}
      {!isAdminPage && <Header go={go} page={page} cartCount={cartItems.reduce((sum, item) => sum + item.qty, 0)} customer={customer} lang={lang} setLang={setLang} notifications={customerNotifications} onOpenNotifications={markCustomerNotificationsRead} onClearNotifications={clearCustomerNotifications} />}
      {cartToast && (
        <div className="cart-toast" role="status" aria-live="polite">
          <ShoppingBag size={20} />
          <div>
            <strong>{cartToast.title}</strong>
            <span>{cartToast.message}</span>
          </div>
        </div>
      )}
      {view}
      {!isAdminPage && <Footer />}
    </React.Fragment>
  );
}

function Header({ go, page, cartCount, customer, lang, setLang, notifications = [], onOpenNotifications, onClearNotifications }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["index", "Home"], ["about", "About"], ["shop", "Shop"], ["cart", "Cart"], ["contact", "Contact"], ["auth", customer ? "My account" : "Login"]];
  const mobileLinks = [["auth", customer ? "My account" : "Login"], ["index", "Home"], ["about", "About"], ["shop", "Shop"], ["cart", "Cart"], ["contact", "Contact"]];
  const pathFor = (id) => id === "index" ? "/" : `/${id}.html`;
  const follow = (event, id) => {
    event.preventDefault();
    setMenuOpen(false);
    go(id === "auth" && customer ? "account" : id);
  };
  const navLinks = (className = "", { showLanguage = true, showNotifications = true, items = links } = {}) => (
    <nav className={className}>
      {items.map(([id, label]) => (
        <a className={page === id ? "active" : ""} href={pathFor(id === "auth" && customer ? "account" : id)} key={id} onClick={(event) => follow(event, id)}>
          {label}{id === "cart" && <b>{cartCount}</b>}
        </a>
      ))}
      {customer && showNotifications && (
        <CustomerNotificationBell
          notifications={notifications}
          onOpen={onOpenNotifications}
          onClear={onClearNotifications}
        />
      )}
      {showLanguage && (
        <div className="language-toggle" aria-label="Language">
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} type="button">EN</button>
          <button className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")} type="button">FR</button>
        </div>
      )}
    </nav>
  );
  return (
    <header className="topbar">
      <a className="brand" href="/" onClick={(event) => follow(event, "index")}>
        <img src="/assets/idukki-spices-logo.jpeg" alt="Idukki Spices" />
        <span>Idukki Spices</span>
      </a>
      {navLinks("desktop-nav")}
      <div className="mobile-header-actions">
        {customer && (
          <CustomerNotificationBell
            notifications={notifications}
            onOpen={onOpenNotifications}
            onClear={onClearNotifications}
          />
        )}
        <div className="language-toggle mobile-language" aria-label="Language">
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} type="button">EN</button>
          <button className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")} type="button">FR</button>
        </div>
        <button className="mobile-menu-button" onClick={() => setMenuOpen(true)} type="button" aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-sidebar-backdrop" role="presentation" onClick={() => setMenuOpen(false)}>
          <aside className="mobile-sidebar" role="dialog" aria-modal="true" aria-label="Site menu" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-sidebar-head">
              <div className="brand compact-brand">
                <img src="/assets/idukki-spices-logo.jpeg" alt="" />
                <span>Idukki Spices</span>
              </div>
              <button className="mobile-menu-button close" onClick={() => setMenuOpen(false)} type="button" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            {navLinks("mobile-nav", { showLanguage: false, showNotifications: false, items: mobileLinks })}
          </aside>
        </div>
      )}
    </header>
  );
}

function CustomerNotificationBell({ notifications, onOpen, onClear }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((item) => !item.read).length;
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) onOpen?.();
  };
  return (
    <div className="customer-notification">
      <button className={`notification-bell ${unread ? "has-unread" : ""}`} onClick={toggle} type="button" aria-label="Notifications">
        <Bell size={19} />
        {unread > 0 && <b>{unread}</b>}
      </button>
      {open && (
        <div className="customer-notification-panel">
          <div className="notification-head">
            <strong>Notifications</strong>
            {notifications.length > 0 && <button onClick={onClear} type="button">Clear</button>}
          </div>
          {notifications.length ? (
            <div className="customer-notification-list">
              {notifications.map((item) => (
                <article className={item.read ? "" : "unread"} key={item.id}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <span>{new Date(item.createdAt).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-notifications">No updates yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Hero({ go }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="kicker">Kerala aroma, packed with care</p>
        <h1>Idukki Spices for real kitchens</h1>
        <p>Premium cardamom, pepper, warm whole spices, and ready-to-cook mixed packs with a simple secure checkout.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => go("shop")} type="button"><ShoppingBag size={18} /> Shop spices</button>
          <button className="ghost" onClick={() => go("about")} type="button">Our plantation story <ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="hero-media">
        <img src="/assets/cardamom-closeup.webp" alt="Green cardamom pods" />
        <div className="floating-proof"><ShieldCheck size={20} /> Secure online checkout</div>
      </div>
    </section>
  );
}

function Home(props) {
  const featured = props.products.slice(0, 4);
  const [quickView, setQuickView] = useState(null);
  return (
    <main>
      <Hero go={props.go} />
      <HomeDeliveryBanner go={props.go} lang={props.lang} />
      <section className="section">
        <SectionTitle eyebrow="Featured" title="Fresh packs customers can buy quickly" />
        <div className="product-grid">
          {featured.map((product) => <ProductCard key={product.id} product={product} onView={setQuickView} {...props} />)}
        </div>
      </section>
      <section className="trust-band">
        <div><Leaf /> Sourced from Idukki inspired farms</div>
        <div><CreditCard /> Stripe secure payment</div>
        <div><Truck /> Order tracking status</div>
      </section>
      {quickView && <QuickView product={quickView} cart={props.cart} addToCart={props.addToCart} onClose={() => setQuickView(null)} lang={props.lang} />}
    </main>
  );
}

function HomeDeliveryBanner({ go, lang }) {
  const isFrench = lang === "fr";
  return (
    <section className="home-delivery-banner">
      <div>
        <Truck size={24} />
        <span>{isFrench ? "Livraison" : "Delivery"}</span>
      </div>
      <strong>{isFrench ? "Minimum de commande 1 €" : "Minimum order €1"}</strong>
      <strong>{isFrench ? "Livraison gratuite dès 50 €" : "Free delivery over €50"}</strong>
      <p>{isFrench ? "Livraison gratuite temporaire pour le test." : "Temporary free shipping for testing."}</p>
      <button className="primary small" onClick={() => go("shop")} type="button">
        {isFrench ? "Voir la boutique" : "Shop now"}
      </button>
    </section>
  );
}

function About() {
  return (
    <main>
      <section className="split-hero">
        <div>
          <p className="kicker">About Idukki Spices</p>
          <h1>Built around freshness, aroma, and honest packing.</h1>
          <p>We bring classic Kerala spices into clean retail packs for everyday cooking, gifting, and family kitchens.</p>
        </div>
        <img src="/assets/idukki-plantation-wide.png" alt="Idukki plantation" />
      </section>
      <section className="section story-grid">
        {["Harvest", "Sort", "Pack", "Deliver"].map((step, index) => (
          <article key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{step}</h3>
            <p>Each stage is handled with care so customers receive clean, aromatic spices ready for the shelf.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const send = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNote("");
    try {
      await api("/api/contact-messages", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", email: "", phone: "", message: "" });
      setNote("Message sent. Idukki Spices will reply by email.");
    } catch (error) {
      setNote(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main>
      <section className="split-hero contact-hero">
        <div>
          <p className="kicker">Contact Idukki Spices</p>
          <h1>Need help with an order or product?</h1>
          <p>Questions, delivery help, product details, or business orders. Send a message and we will reply as soon as possible.</p>
        </div>
        <img src="/assets/idukki-plantation-wide.png" alt="Idukki spice plantation" />
      </section>
      <section className="section contact-grid">
        <div className="contact-details">
          <SectionTitle eyebrow="Contact details" title="Quick contact" />
          <article>
            <Mail size={22} />
            <div>
              <span>Email us</span>
              <a href={`mailto:${companyContactEmail}`}>{companyContactEmail}</a>
            </div>
          </article>
          <article>
            <Phone size={22} />
            <div>
              <span>Phone</span>
              <a href={`tel:${companyContactPhone.replace(/\s/g, "")}`}>{companyContactPhone}</a>
            </div>
          </article>
          <article>
            <MapPin size={22} />
            <div>
              <span>Location</span>
              <strong>{companyContactLocation}</strong>
            </div>
          </article>
          <article>
            <InstagramIcon size={22} />
            <div>
              <span>Instagram</span>
              <a href={companyInstagramUrl} target="_blank" rel="noreferrer">@idukkispicesfr</a>
            </div>
          </article>
          <article>
            <Truck size={22} />
            <div>
              <span>Business hours</span>
              <strong>Monday to Saturday</strong>
            </div>
          </article>
        </div>
        <form className="panel contact-form" onSubmit={send}>
          <SectionTitle eyebrow="Write to us" title="Send message" />
          <p className="muted">Write to us and include your order number if you already purchased.</p>
          <Field label="Full name" value={form.name} onChange={(value) => update("name", value)} required />
          <Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
          <Field label="Phone" type="tel" value={form.phone} onChange={(value) => update("phone", value)} placeholder="+33782504514" />
          <label className="field">
            <span>Message</span>
            <textarea value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="How can we help?" required />
          </label>
          <button className="primary" disabled={busy} type="submit"><Mail size={18} /> {busy ? "Sending..." : "Send message"}</button>
          {note && <p className="notice compact">{note}</p>}
        </form>
      </section>
    </main>
  );
}

function Shop(props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [quickView, setQuickView] = useState(null);
  const shown = props.products
    .filter((product) => {
      const displayProduct = localizeProduct(product, props.lang);
      return (
        (category === "all" || product.category === category) &&
        `${displayProduct.name} ${displayProduct.description}`.toLowerCase().includes(query.toLowerCase())
      );
    });
  return (
    <main className="section">
      <SectionTitle eyebrow="Shop" title="Choose spices and update quantity instantly" />
      <div className="toolbar">
        <label><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cardamom, pepper..." /></label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          <option value="whole">Whole spices</option>
          <option value="blend">Blends</option>
          <option value="leaf">Leaves</option>
        </select>
      </div>
      <div className="product-grid">
        {shown.map((product) => <ProductCard key={product.id} product={product} onView={setQuickView} {...props} />)}
      </div>
      {quickView && <QuickView product={quickView} cart={props.cart} addToCart={props.addToCart} onClose={() => setQuickView(null)} lang={props.lang} />}
    </main>
  );
}

function ProductCard({ product, cart, addToCart, onView, lang }) {
  const displayProduct = localizeProduct(product, lang);
  const cartQty = cart[product.id] || 0;
  const [selectedQty, setSelectedQty] = useState(cartQty);
  useEffect(() => {
    setSelectedQty(cartQty);
  }, [cartQty]);
  const addSelected = (event) => {
    event.stopPropagation();
    const difference = selectedQty - cartQty;
    if (!difference) return;
    addToCart(product.id, difference);
  };
  return (
    <article className="product-card" onClick={() => onView?.(product)}>
      <button className="product-image-button" type="button" onClick={() => onView?.(product)}>
        <img src={`/${product.image}`} alt={displayProduct.name} />
      </button>
      <div className="product-copy">
        <p className="pill">{displayProduct.category || "spice"}</p>
        <h3>{displayProduct.name}</h3>
        <p>{displayProduct.description}</p>
      </div>
      <footer>
        <div>
          <strong>{money(product.price)}</strong>
          {cartQty > 0 && <p className="in-cart">{cartQty} in cart</p>}
        </div>
        <div className="buy-controls" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
          <div className="counter">
            <button disabled={!selectedQty} onClick={() => setSelectedQty((qty) => Math.max(0, qty - 1))} type="button" aria-label={`Decrease selected ${displayProduct.name}`}>-</button>
            <QuantityInput value={selectedQty} onChange={setSelectedQty} label={`Selected quantity for ${displayProduct.name}`} />
            <button onClick={() => setSelectedQty((qty) => qty + 1)} type="button" aria-label={`Increase selected ${displayProduct.name}`}>+</button>
          </div>
          <button className="primary small" disabled={selectedQty === cartQty} onClick={addSelected} type="button">{cartQty ? "Update cart" : "Add to cart"}</button>
        </div>
      </footer>
    </article>
  );
}

function QuickView({ product, cart, addToCart, onClose, lang }) {
  const displayProduct = localizeProduct(product, lang);
  const cartQty = cart[product.id] || 0;
  const [selectedQty, setSelectedQty] = useState(cartQty);
  useEffect(() => {
    setSelectedQty(cartQty);
  }, [cartQty]);
  const addSelected = () => {
    const difference = selectedQty - cartQty;
    if (!difference) return;
    addToCart(product.id, difference);
  };
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <article className="quick-view" role="dialog" aria-modal="true" aria-label={displayProduct.name} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}>Close</button>
        <img src={`/${product.image}`} alt={displayProduct.name} />
        <div>
          <p className="pill">{displayProduct.category || "spice"}</p>
          <h2>{displayProduct.name}</h2>
          <p>{displayProduct.description}</p>
          <p className="muted">{displayProduct.uses}</p>
          <div className="quick-meta">
            <strong>{money(product.price)}</strong>
            {cartQty ? <span>{cartQty} in cart</span> : <span>Ready to add</span>}
          </div>
          <div className="buy-controls quick-buy">
            <div className="counter wide">
              <button disabled={!selectedQty} onClick={() => setSelectedQty((qty) => Math.max(0, qty - 1))} type="button">-</button>
              <QuantityInput value={selectedQty} onChange={setSelectedQty} label={`Selected quantity for ${displayProduct.name}`} />
              <button onClick={() => setSelectedQty((qty) => qty + 1)} type="button">+</button>
            </div>
            <button className="primary" disabled={selectedQty === cartQty} onClick={addSelected} type="button"><Plus size={18} /> {cartQty ? "Update cart" : "Add to cart"}</button>
          </div>
        </div>
      </article>
    </div>
  );
}

function Cart({ cartItems, cartTotal, shippingFee, orderTotal, canCheckout, addToCart, setCart, go, lang }) {
  const setCartItemQty = (id, qty) => {
    setCart((current) => ({ ...current, [id]: qty }));
  };
  return (
    <main className="section cart-layout">
      <section>
        <SectionTitle eyebrow="Cart" title="Review your spices" />
        <DeliveryNotice subtotal={cartTotal} lang={lang} />
        {cartItems.length ? cartItems.map((item) => {
          const displayItem = localizeProduct(item, lang);
          return (
            <article className="cart-line" key={item.id}>
              <img src={`/${item.image}`} alt={displayItem.name} />
              <div><h3>{displayItem.name}</h3><p>{item.qty} x {money(item.price)}</p></div>
              <div className="counter">
                <button onClick={() => addToCart(item.id, -1)} type="button">-</button>
                <QuantityInput value={item.qty} onChange={(qty) => setCartItemQty(item.id, qty)} label={`Quantity for ${displayItem.name}`} />
                <button onClick={() => addToCart(item.id, 1)} type="button">+</button>
              </div>
            </article>
          );
        }) : <Empty title="Your cart is empty" action="Start shopping" onClick={() => go("shop")} />}
      </section>
      {cartItems.length > 0 && (
        <aside className="summary-card">
          <h2>Order summary</h2>
          <p><span>Items</span><strong>{cartItems.length}</strong></p>
          <p><span>Subtotal</span><strong>{money(cartTotal)}</strong></p>
          <p><span>Shipping</span><ShippingPrice subtotal={cartTotal} shippingFee={shippingFee} lang={lang} /></p>
          <p className="total"><span>Total</span><strong>{money(orderTotal)}</strong></p>
          {!canCheckout && <p className="notice compact">Add more spices to reach the €1 minimum order.</p>}
          <button className="primary" disabled={!canCheckout} onClick={() => go("checkout")} type="button"><Lock size={18} /> Checkout</button>
          <button className="ghost full" onClick={() => setCart({})} type="button">Clear cart</button>
        </aside>
      )}
    </main>
  );
}

function QuantityInput({ value, onChange, label }) {
  const clean = (input) => String(input || "").replace(/\D/g, "");
  return (
    <input
      aria-label={label}
      className="quantity-input"
      inputMode="numeric"
      pattern="[0-9]*"
      min="0"
      type="text"
      value={String(value)}
      onChange={(event) => onChange(Number(clean(event.target.value) || 0))}
      onClick={(event) => event.stopPropagation()}
    />
  );
}

function DeliveryNotice({ subtotal, lang }) {
  const remaining = Math.max(0, MIN_ORDER_VALUE - subtotal);
  const isFrench = lang === "fr";
  return (
    <div className="delivery-notice">
      <Truck size={20} />
      <div>
        <strong>{isFrench ? "Livraison gratuite temporaire pour toutes les commandes de test." : "Temporary free delivery for all test orders."}</strong>
        <p>
          {subtotal >= FREE_SHIPPING_THRESHOLD
            ? (isFrench ? "La livraison est gratuite pour cette commande." : "You have free delivery on this order.")
            : (isFrench
              ? `Minimum de commande : 1 €.${remaining > 0 ? ` Ajoutez encore ${money(remaining)} pour commander.` : ""}`
              : `Minimum order value is €1.${remaining > 0 ? ` Add ${money(remaining)} more to checkout.` : ""}`)}
        </p>
      </div>
    </div>
  );
}

function Checkout({ cartItems, cartTotal, shippingFee, orderTotal, canCheckout, setCart, customer, lang }) {
  const checkoutParams = new URLSearchParams(window.location.search);
  const cancelledOrderId = checkoutParams.get("payment") === "cancelled" ? checkoutParams.get("order") : "";
  const [form, setForm] = useState(() => ({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || ""
  }));
  const [note, setNote] = useState(cancelledOrderId ? `Payment was cancelled. Order ${cancelledOrderId} is not confirmed.` : "");
  useEffect(() => {
    if (!customer) return;
    setForm((current) => ({
      ...current,
      name: current.name || customer.name || "",
      email: current.email || customer.email || "",
      phone: current.phone || customer.phone || "",
      address: current.address || customer.address || ""
    }));
  }, [customer]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!cartItems.length) return setNote("Add products before checkout.");
    if (!canCheckout) return setNote("Add more spices to reach the €1 minimum order.");
    const order = {
      id: `IDK-${Date.now().toString().slice(-6)}`,
      customer: form,
      customerEmail: form.email,
      customerId: customer?.id || "",
      paymentMethod: "card",
      paymentStatus: "Pending",
      deliveryStatus: "New order",
      items: cartItems.map(({ id, name, qty, price, image }) => ({ id, name, qty, price, image })),
      subtotal: cartTotal,
      shippingFee,
      total: orderTotal
    };
    try {
      const saved = await api("/api/orders", { method: "POST", body: JSON.stringify(order) });
      if (saved.stripeSession?.url) {
        setCart({});
        window.location.href = saved.stripeSession.url;
        return;
      }
      setNote(saved.warning || "Order saved, but payment provider needs setup.");
    } catch (error) {
      setNote(error.message);
    }
  };
  return (
    <main className="section checkout-grid">
      <form className="panel" onSubmit={submit}>
        <SectionTitle eyebrow="Checkout" title="Delivery details" />
        {cancelledOrderId && (
          <div className="payment-cancelled">
            <strong>Order not confirmed</strong>
            <p>Your payment was cancelled, so the order has not been confirmed. You can review your details and try payment again.</p>
          </div>
        )}
        <DeliveryNotice subtotal={cartTotal} lang={lang} />
        <Field label="Full name" value={form.name} onChange={(value) => update("name", value)} required />
        <Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
        <Field label="Phone number" type="tel" value={form.phone} onChange={(value) => update("phone", value)} placeholder="Phone number" required />
        <AddressField value={form.address} onChange={(value) => update("address", value)} required />
        <button className="primary" type="submit"><CreditCard size={18} /> {cancelledOrderId ? "Try payment again" : "Pay securely"}</button>
        {note && <p className="notice">{note}</p>}
      </form>
      <aside className="summary-card">
        <h2>Your pack</h2>
        {cartItems.map((item) => {
          const displayItem = localizeProduct(item, lang);
          return <p key={item.id}><span>{displayItem.name} x {item.qty}</span><strong>{money(item.price * item.qty)}</strong></p>;
        })}
        <p><span>Subtotal</span><strong>{money(cartTotal)}</strong></p>
        <p><span>Shipping</span><ShippingPrice subtotal={cartTotal} shippingFee={shippingFee} lang={lang} /></p>
        <p className="total"><span>Total</span><strong>{money(orderTotal)}</strong></p>
      </aside>
    </main>
  );
}

function Auth({ setCustomer, go }) {
  const [mode, setMode] = useState("login");
  const [method, setMethod] = useState("email");
  const [country, setCountry] = useState("+33");
  const [localPhone, setLocalPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [otp, setOtp] = useState("");
  const [signup, setSignup] = useState({ name: "", email: "", phone: "", country: "+33", address: "" });
  const [note, setNote] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const phone = (code, value) => `${code}${String(value).replace(/\D/g, "").replace(/^0+/, "")}`;

  const requestOtp = async () => {
    const value = method === "phone" ? phone(country, localPhone) : identity.trim().toLowerCase();
    try {
      setAuthBusy(true);
      setNote("Sending OTP...");
      await api("/api/auth/request-otp", { method: "POST", body: JSON.stringify({ identity: value, method }) });
      setNote("OTP sent. Check your email or phone.");
    } catch (error) {
      setNote(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const verify = async (event) => {
    event?.preventDefault?.();
    const value = method === "phone" ? phone(country, localPhone) : identity.trim().toLowerCase();
    try {
      setAuthBusy(true);
      setNote("Verifying OTP...");
      const data = await api("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ identity: value, method, otp }) });
      sessionStorage.setItem(customerKey, data.token);
      sessionStorage.setItem(customerDataKey, JSON.stringify(data.account));
      setCustomer(data.account);
      go("index");
    } catch (error) {
      setNote(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const createAccount = async (event) => {
    event?.preventDefault?.();
    const body = { ...signup, phone: phone(signup.country, signup.phone) };
    try {
      setAuthBusy(true);
      setNote("Creating account...");
      await api("/api/accounts/register", { method: "POST", body: JSON.stringify(body) });
      setMode("login");
      setIdentity(body.email);
      setNote("Account created. Send OTP to login.");
    } catch (error) {
      setNote(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-modern">
        <aside>
          <img src="/assets/idukki-spices-logo.jpeg" alt="Idukki Spices" />
          <h1>Secure spice shopping starts here.</h1>
          <p>Login with OTP, save delivery details, and track orders in a cleaner account experience.</p>
        </aside>
        <div className="auth-box">
          <div className="tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Login</button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">Create account</button>
          </div>
          {mode === "login" ? (
            <form onSubmit={verify}>
              <Select label="Send OTP to" value={method} onChange={setMethod} options={[["email", "Email"], ["phone", "Phone"]]} />
              {method === "email" ? (
                <Field label="Email" type="email" value={identity} onChange={setIdentity} placeholder="you@example.com" required />
              ) : <PhoneInput country={country} setCountry={setCountry} value={localPhone} onChange={setLocalPhone} />}
              <button className="ghost full" disabled={authBusy} onClick={requestOtp} type="button"><Mail size={18} /> Send OTP</button>
              <Field label="OTP code" value={otp} onChange={setOtp} placeholder="Enter 6-digit code" required />
              <button className="primary" disabled={authBusy} onClick={verify} type="button">Verify and login</button>
            </form>
          ) : (
            <form onSubmit={createAccount}>
              <Field label="Full name" value={signup.name} onChange={(value) => setSignup({ ...signup, name: value })} required />
              <Field label="Email" type="email" value={signup.email} onChange={(value) => setSignup({ ...signup, email: value })} required />
              <PhoneInput country={signup.country} setCountry={(value) => setSignup({ ...signup, country: value })} value={signup.phone} onChange={(value) => setSignup({ ...signup, phone: value })} />
              <AddressField value={signup.address} onChange={(value) => setSignup({ ...signup, address: value })} />
              <button className="primary" disabled={authBusy} onClick={createAccount} type="button">Create account</button>
            </form>
          )}
          {note && <p className="notice">{note}</p>}
        </div>
      </section>
    </main>
  );
}

function PhoneInput({ country, setCountry, value, onChange }) {
  return (
    <label className="field">
      <span>Phone</span>
      <div className="phone-input">
        <select value={country} onChange={(event) => setCountry(event.target.value)}>
          {countries.map(([flag, name, code]) => <option key={`${name}-${code}`} value={code}>{flag} {name} {code}</option>)}
        </select>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Local phone number" type="tel" required />
      </div>
    </label>
  );
}

function Account({ customer, setCustomer, setCart, go, lang, theme, setTheme, addCustomerNotification, syncCustomerOrderNotifications }) {
  const [orders, setOrders] = useState([]);
  const [orderError, setOrderError] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [section, setSection] = useState(() => sessionStorage.getItem(accountSectionKey) || "profile");
  const [editing, setEditing] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivateOtp, setDeactivateOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [profileForm, setProfileForm] = useState(() => ({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || ""
  }));
  const [profileNote, setProfileNote] = useState("");
  const isFrench = lang === "fr";
  const clearCustomerSession = () => {
    sessionStorage.removeItem(customerKey);
    sessionStorage.removeItem(customerDataKey);
    sessionStorage.removeItem(accountSectionKey);
    localStorage.removeItem(cartKey);
    setCart({});
    setCustomer(null);
  };
  useEffect(() => {
    if (customer) {
      api("/api/account/orders")
        .then((data) => {
          setOrders(data);
          syncCustomerOrderNotifications?.(data);
          setOrderError("");
        })
        .catch((error) => {
          setOrders([]);
          setOrderError(error.message);
        });
    }
  }, [customer]);
  useEffect(() => {
    if (!customer) return;
    setProfileForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });
  }, [customer]);
  useEffect(() => {
    if (section !== "settings") {
      setConfirmDeactivate(false);
      setDeactivateOtp("");
      setOtpSent(false);
    }
    sessionStorage.setItem(accountSectionKey, section);
  }, [section]);
  if (!customer) return <main className="section"><Empty title="Login required" action="Go to login" onClick={() => go("auth")} /></main>;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const updateCustomerOrder = (updatedOrder) => {
    setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
  };
  const cancelOrder = async (order) => {
    const ok = window.confirm(isFrench
      ? `Annuler la commande ${order.id} ?`
      : `Cancel order ${order.id}?`);
    if (!ok) return;
    try {
      const updated = await api("/api/account/orders/action", { method: "POST", body: JSON.stringify({ orderId: order.id, action: "cancel" }) });
      updateCustomerOrder(updated);
      addCustomerNotification?.("Order cancelled", `${updated.id} has been cancelled.`);
      setOrderNote(isFrench ? "Commande annulée." : "Order cancelled.");
    } catch (error) {
      setOrderNote(error.message);
    }
  };
  const requestRefund = async (order) => {
    const ok = window.confirm(isFrench
      ? `Demander un remboursement pour ${order.id} ?`
      : `Request refund for ${order.id}?`);
    if (!ok) return;
    try {
      const updated = await api("/api/account/orders/action", { method: "POST", body: JSON.stringify({ orderId: order.id, action: "refund" }) });
      updateCustomerOrder(updated);
      addCustomerNotification?.("Refund requested", `Your refund request for ${updated.id} was sent to Idukki Spices.`);
      setOrderNote(isFrench ? "Demande de remboursement envoyée." : "Refund request sent.");
    } catch (error) {
      setOrderNote(error.message);
    }
  };
  const updateProfile = async (event) => {
    event.preventDefault();
    try {
      const updated = await api("/api/account/profile", { method: "PUT", body: JSON.stringify(profileForm) });
      sessionStorage.setItem(customerDataKey, JSON.stringify(updated));
      setCustomer(updated);
      setEditing(false);
      setProfileNote("Profile updated.");
    } catch (error) {
      if (error.message === "Account login required") {
        setProfileNote("Your login session expired. Please login again from the Login page, then come back to save changes.");
        return;
      }
      setProfileNote(error.message);
    }
  };
  const requestDeactivateOtp = async () => {
    try {
      await api("/api/account/deactivation-otp", { method: "POST" });
      setOtpSent(true);
      setProfileNote(isFrench ? "Code OTP envoyé à votre e-mail." : "OTP sent to your email.");
    } catch (error) {
      setProfileNote(error.message);
    }
  };
  const deactivateAccount = async () => {
    try {
      await api("/api/account/profile", { method: "DELETE", body: JSON.stringify({ otp: deactivateOtp }) });
      clearCustomerSession();
      go("index");
    } catch (error) {
      setProfileNote(error.message);
    }
  };
  return (
    <main className="section account-grid">
      <aside className="summary-card">
        <UserRound />
        <h2>{customer.name}</h2>
        <p>{customer.email}</p>
        <p>{customer.phone || "No phone saved"}</p>
        <p>{customer.address || "No address saved"}</p>
        <div className="account-menu">
          <button className={section === "profile" ? "active" : ""} onClick={() => setSection("profile")} type="button"><UserRound size={18} /> Profile</button>
          <button className={section === "orders" ? "active" : ""} onClick={() => setSection("orders")} type="button"><Package size={18} /> Orders</button>
          <button className={section === "settings" ? "active" : ""} onClick={() => setSection("settings")} type="button"><ShieldCheck size={18} /> Account settings</button>
        </div>
        <button className="ghost full" onClick={() => {
          clearCustomerSession();
          go("index");
        }} type="button"><LogOut size={18} /> {isFrench ? "Déconnexion" : "Logout"}</button>
      </aside>
      {section === "profile" ? (
        <section className="panel account-section">
          <SectionTitle eyebrow="Account" title="Your saved details" />
          {editing ? (
            <form className="profile-edit" onSubmit={updateProfile}>
              <Field label="Full name" value={profileForm.name} onChange={(value) => setProfileForm({ ...profileForm, name: value })} required />
              <Field label="Email" value={customer.email} onChange={() => null} type="email" readOnly />
              <Field label="Phone" value={profileForm.phone} onChange={(value) => setProfileForm({ ...profileForm, phone: value })} placeholder="+33782504514" required />
              <AddressField value={profileForm.address} onChange={(value) => setProfileForm({ ...profileForm, address: value })} />
              <div className="profile-actions">
                <button className="primary" type="submit">Save details</button>
                <button className="ghost" onClick={() => { setEditing(false); setProfileNote(""); }} type="button">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <p><span>Name</span><strong>{customer.name}</strong></p>
              <p><span>Email</span><strong>{customer.email}</strong></p>
              <p><span>Phone</span><strong>{customer.phone || "Not saved"}</strong></p>
              <p><span>Address</span><strong>{customer.address || "Not saved"}</strong></p>
            </div>
          )}
          {profileNote && <p className="notice">{profileNote}</p>}
          <div className="profile-actions">
            {!editing && <button className="primary" onClick={() => setEditing(true)} type="button">Edit profile</button>}
            <button className="ghost" onClick={() => setSection("orders")} type="button"><Package size={18} /> View orders</button>
          </div>
        </section>
      ) : section === "orders" ? (
        <section>
          <SectionTitle eyebrow="My orders" title="All orders from your account" />
          <div className="account-order-stats">
            <article><span>Total orders</span><strong>{orders.length}</strong></article>
            <article><span>Total spent</span><strong>{money(totalSpent)}</strong></article>
            <article><span>Latest status</span><strong>{orders[0]?.deliveryStatus || "No orders"}</strong></article>
          </div>
          {orderError && <p className="notice">{orderError}. Please login again.</p>}
          {orderNote && <p className="notice">{orderNote}</p>}
          {orders.length ? (
            <div className="account-orders">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  detailed
                  lang={lang}
                  onCancel={cancelOrder}
                  onRefund={requestRefund}
                />
              ))}
            </div>
          ) : <Empty title="No orders yet" action="Shop now" onClick={() => go("shop")} />}
        </section>
      ) : (
        <section className="panel account-section">
          <SectionTitle eyebrow={isFrench ? "Paramètres du compte" : "Account settings"} title={isFrench ? "Gérer l'accès au compte" : "Manage account access"} />
          <div className="settings-grid">
            <article className="settings-card">
              <div>
                <h3>{isFrench ? "Apparence" : "Appearance"}</h3>
                <p>{isFrench ? "Choisissez le mode visuel du site sur cet appareil." : "Choose how the site looks on this device."}</p>
              </div>
              <div className="theme-toggle" aria-label={isFrench ? "Mode d'affichage" : "Display mode"}>
                <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")} type="button">{isFrench ? "Clair" : "Light"}</button>
                <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")} type="button">{isFrench ? "Sombre" : "Dark"}</button>
              </div>
            </article>
          </div>
          <section className="danger-zone">
            <div>
              <h3>{isFrench ? "Désactiver le compte" : "Deactivate account"}</h3>
              <p>{isFrench ? "Cela supprime votre compte de connexion et vos informations de livraison. Un OTP est obligatoire. Les anciennes commandes restent dans la boutique pour les factures et les documents professionnels." : "This removes your saved login account and delivery details. OTP verification is required. Past orders stay with the shop for invoice and business records."}</p>
            </div>
            {!confirmDeactivate ? (
              <button className="danger-button" onClick={() => setConfirmDeactivate(true)} type="button">{isFrench ? "Désactiver le compte" : "Deactivate account"}</button>
            ) : (
              <div className="danger-confirm otp-confirm">
                <p>{isFrench ? "Recevez un OTP par e-mail avant de désactiver le compte." : "Get an email OTP before deactivating the account."}</p>
                <button className="ghost" onClick={requestDeactivateOtp} type="button">{otpSent ? (isFrench ? "Renvoyer OTP" : "Resend OTP") : (isFrench ? "Envoyer OTP" : "Send OTP")}</button>
                <label className="field compact-field">
                  <span>{isFrench ? "Code OTP" : "OTP code"}</span>
                  <input value={deactivateOtp} onChange={(event) => setDeactivateOtp(event.target.value)} placeholder="123456" inputMode="numeric" />
                </label>
                <button className="danger-button" disabled={!deactivateOtp.trim()} onClick={deactivateAccount} type="button">{isFrench ? "Vérifier et désactiver" : "Verify and deactivate"}</button>
                <button className="ghost" onClick={() => { setConfirmDeactivate(false); setDeactivateOtp(""); setOtpSent(false); }} type="button">{isFrench ? "Annuler" : "Cancel"}</button>
              </div>
            )}
          </section>
          {profileNote && <p className="notice">{profileNote}</p>}
        </section>
      )}
    </main>
  );
}

function Admin({ products, setProducts }) {
  const [token, setToken] = useState(sessionStorage.getItem(adminKey));
  const [email, setEmail] = useState("admin@idukkispices.com");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [note, setNote] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [activeOrderStatus, setActiveOrderStatus] = useState("New order");

  const loadAdmin = async () => {
    if (!sessionStorage.getItem(adminKey)) return;
    try {
      setOrders(await api("/api/orders"));
      setCustomers(await api("/api/customers"));
      setNotifications(await api("/api/admin/notifications"));
      setMessages(await api("/api/contact-messages"));
    } catch (error) {
      sessionStorage.removeItem(adminKey);
      setToken(null);
      setNote("Admin session expired. Please sign in again.");
    }
  };
  useEffect(() => { loadAdmin(); }, [token]);

  const login = async (event) => {
    event.preventDefault();
    try {
      const data = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
      sessionStorage.setItem(adminKey, data.token);
      setToken(data.token);
    } catch (error) {
      setNote(error.message);
    }
  };

  if (!token) return (
    <main className="auth-screen">
      <form className="admin-login panel" onSubmit={login}>
        <SectionTitle eyebrow="Admin" title="Business dashboard login" />
        <Field label="Email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <button className="primary" type="submit"><ShieldCheck size={18} /> Sign in</button>
        {note && <p className="notice">{note}</p>}
      </form>
    </main>
  );

  const adminTabs = [
    ["overview", "Overview", <BarChart3 size={18} />],
    ["orders", "Orders", <Package size={18} />],
    ["products", "Products", <ShoppingBag size={18} />],
    ["accounts", "Accounts", <UserRound size={18} />],
    ["messages", "Messages", <Mail size={18} />]
  ];
  const activePaidOrders = orders.filter((order) => order.paymentStatus === "Paid" && order.deliveryStatus !== "Cancelled");
  const paidOrders = activePaidOrders.length;
  const pendingOrders = orders.filter((order) => order.paymentStatus === "Pending").length;
  const refundedOrders = orders.filter((order) => order.paymentStatus === "Refunded").length;
  const pendingRefundTotal = orders
    .filter((order) => order.paymentStatus === "Refund requested" || (order.paymentStatus === "Paid" && order.deliveryStatus === "Cancelled"))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const refundedTotal = orders
    .filter((order) => order.paymentStatus === "Refunded")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const revenue = activePaidOrders
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const deliveryStatuses = ["New order", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"];
  const visibleOrders = orders.filter((order) => (order.deliveryStatus || "New order") === activeOrderStatus);
  const unreadMessages = messages.filter((message) => message.status !== "Replied").length;
  const deleteOrder = async (order) => {
    const ok = window.confirm(`Delete order ${order.id}? This cannot be undone.`);
    if (!ok) return;
    try {
      await api(`/api/orders?id=${encodeURIComponent(order.id)}`, { method: "DELETE" });
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setNote(`Order ${order.id} deleted.`);
    } catch (error) {
      setNote(error.message);
    }
  };
  const deleteCustomer = async (customer) => {
    const ok = window.confirm(`Delete account for ${customer.email}? This removes the saved customer login/profile.`);
    if (!ok) return;
    try {
      await api(`/api/customers?id=${encodeURIComponent(customer.id)}`, { method: "DELETE" });
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
      setNote(`Account ${customer.email} deleted.`);
    } catch (error) {
      setNote(error.message);
    }
  };
  const approveRefund = async (order) => {
    const ok = window.confirm(`Approve refund for ${order.id}? This will request a Stripe refund.`);
    if (!ok) return;
    try {
      const updated = await api("/api/orders/refund", { method: "POST", body: JSON.stringify({ orderId: order.id }) });
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNote(`Refund approved for ${order.id}.`);
    } catch (error) {
      setNote(error.message);
    }
  };
  const markNotificationsRead = async () => {
    try {
      setNotifications(await api("/api/admin/notifications", { method: "PUT" }));
    } catch (error) {
      setNote(error.message);
    }
  };
  const updateMessageStatus = async (message, status) => {
    try {
      const updated = await api("/api/contact-messages", { method: "PUT", body: JSON.stringify({ id: message.id, status }) });
      setMessages((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNote(`Message marked ${status.toLowerCase()}.`);
    } catch (error) {
      setNote(error.message);
    }
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <img src="/assets/idukki-spices-logo.jpeg" alt="Idukki Spices" />
        <div>
          <p className="kicker">Admin</p>
          <h1>Business dashboard</h1>
        </div>
        <div className="admin-menu">
          {adminTabs.map(([id, label, icon]) => (
            <button className={activeSection === id ? "active" : ""} key={id} onClick={() => setActiveSection(id)} type="button">
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button className="ghost full" onClick={() => { sessionStorage.removeItem(adminKey); setToken(null); }} type="button"><LogOut size={18} /> Logout</button>
      </aside>
      <section className="admin-workspace">
        <div className="admin-head">
          <SectionTitle eyebrow="Operations" title={adminTabs.find(([id]) => id === activeSection)?.[1] || "Overview"} />
        </div>
        {activeSection === "overview" && <AdminNotificationBar notifications={notifications} onMarkRead={markNotificationsRead} />}
        {note && <p className="notice compact">{note}</p>}
        {activeSection === "overview" && (
          <section className="admin-section-stack">
            <div className="stat-grid">
              <Stat icon={<Package />} label="Products" value={products.length} />
              <Stat icon={<BarChart3 />} label="Orders" value={orders.length} />
              <Stat icon={<UserRound />} label="Customers" value={customers.length} />
              <Stat icon={<Mail />} label="Messages" value={messages.length} />
              <Stat icon={<CreditCard />} label="Net revenue" value={money(revenue)} />
              <Stat icon={<CreditCard />} label="Pending refund" value={money(pendingRefundTotal)} />
              <Stat icon={<CreditCard />} label="Refunded" value={money(refundedTotal)} />
            </div>
            <div className="admin-quick-grid">
              <button onClick={() => setActiveSection("orders")} type="button"><Package size={20} /><strong>Manage orders</strong><span>{pendingOrders} pending · {paidOrders} paid · {refundedOrders} refunded</span></button>
              <button onClick={() => setActiveSection("products")} type="button"><ShoppingBag size={20} /><strong>Edit products</strong><span>{products.length} product records</span></button>
              <button onClick={() => setActiveSection("accounts")} type="button"><UserRound size={20} /><strong>Customer accounts</strong><span>{customers.length} saved accounts</span></button>
              <button onClick={() => setActiveSection("messages")} type="button"><Mail size={20} /><strong>Contact messages</strong><span>{unreadMessages} need review</span></button>
            </div>
          </section>
        )}
        {activeSection === "orders" && (
          <section className="panel admin-panel">
            <h2>Orders</h2>
            {orders.length ? (
              <>
                <div className="admin-status-tabs">
                  {deliveryStatuses.map((status) => {
                    const count = orders.filter((order) => (order.deliveryStatus || "New order") === status).length;
                    return (
                      <button className={activeOrderStatus === status ? "active" : ""} key={status} onClick={() => setActiveOrderStatus(status)} type="button">
                        <span>{status}</span>
                        <b>{count}</b>
                      </button>
                    );
                  })}
                </div>
                <section className="admin-order-group single">
                  <header>
                    <h3>{activeOrderStatus}</h3>
                    <span>{visibleOrders.length}</span>
                  </header>
                  <div className="admin-order-scroll">
                    {visibleOrders.length ? visibleOrders.map((order) => (
                      <AdminOrderRow key={order.id} order={order} orders={orders} setOrders={setOrders} onDelete={deleteOrder} onApproveRefund={approveRefund} />
                    )) : <p className="muted">No orders in this status.</p>}
                  </div>
                </section>
              </>
            ) : <p className="muted">No orders yet.</p>}
          </section>
        )}
        {activeSection === "products" && (
          <section className="panel admin-panel">
            <h2>Products</h2>
            <div className="admin-product admin-product-head" aria-hidden="true">
              <span>Photo</span>
              <span>Product name</span>
              <span>Price (€)</span>
              <span>Stock count</span>
              <span>Action</span>
            </div>
            {products.map((product) => <ProductAdminRow key={product.id} product={product} setProducts={setProducts} />)}
          </section>
        )}
        {activeSection === "accounts" && (
          <section className="panel admin-panel">
            <h2>Customer accounts</h2>
            <div className="customer-table">
              {customers.length ? customers.map((customer) => (
                <article key={customer.id || customer.email}>
                  <strong>{customer.name}</strong>
                  <span>{customer.email}</span>
                  <span>{customer.phone || "No phone"}</span>
                  <span>{customer.address || "No address saved"}</span>
                  <button className="danger-button small" onClick={() => deleteCustomer(customer)} type="button">Delete</button>
                </article>
              )) : <p className="muted">No customer accounts yet.</p>}
            </div>
          </section>
        )}
        {activeSection === "messages" && (
          <section className="panel admin-panel">
            <h2>Contact messages</h2>
            {messages.length ? (
              <div className="admin-message-scroll">
                {messages.map((message) => (
                  <AdminContactMessage key={message.id} message={message} onStatus={updateMessageStatus} />
                ))}
              </div>
            ) : <p className="muted">No contact messages yet.</p>}
          </section>
        )}
      </section>
    </main>
  );
}

function AdminContactMessage({ message, onStatus }) {
  const created = message.createdAt ? new Date(message.createdAt).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "Date unavailable";
  const replySubject = encodeURIComponent("Reply from Idukki Spices");
  const replyBody = encodeURIComponent([
    `Hello ${message.name},`,
    "",
    "Thank you for contacting Idukki Spices.",
    "",
    "Regards,",
    "Idukki Spices"
  ].join("\n"));
  return (
    <article className={`admin-message ${message.status === "New" ? "unread" : ""}`}>
      <header>
        <div>
          <strong>{message.name}</strong>
          <span>{message.email}{message.phone ? ` · ${message.phone}` : ""}</span>
        </div>
        <b>{message.status}</b>
      </header>
      <p>{message.message}</p>
      <footer>
        <span>{created}</span>
        <div>
          <a className="ghost small" href={`mailto:${message.email}?subject=${replySubject}&body=${replyBody}`}>Reply</a>
          <button className="ghost small" disabled={message.status === "Read"} onClick={() => onStatus(message, "Read")} type="button">Mark read</button>
          <button className="primary small" disabled={message.status === "Replied"} onClick={() => onStatus(message, "Replied")} type="button">Mark replied</button>
        </div>
      </footer>
    </article>
  );
}

function AdminNotificationBar({ notifications, onMarkRead }) {
  const unread = notifications.filter((item) => !Number(item.isRead)).length;
  const visible = notifications.slice(0, 3);
  return (
    <section className="admin-notification-bar">
      <div className="notification-bar-head">
        <div>
          <Bell size={18} />
          <strong>Customer updates</strong>
          {unread > 0 && <span>{unread} new</span>}
        </div>
        <button className="ghost small" disabled={!notifications.length || unread === 0} onClick={onMarkRead} type="button">Mark read</button>
      </div>
      {visible.length ? (
        <div className="notification-list">
          {visible.map((item) => {
            const created = item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            }) : "";
            return (
              <article className={Number(item.isRead) ? "" : "unread"} key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
                <span>{created}</span>
              </article>
            );
          })}
        </div>
      ) : <p className="muted">No customer updates yet.</p>}
    </section>
  );
}

function AdminOrderRow({ order, orders, setOrders, onDelete, onApproveRefund }) {
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || "Pending");
  const [deliveryStatus, setDeliveryStatus] = useState(order.deliveryStatus || "New order");
  const [saved, setSaved] = useState("");
  const orderedAt = order.createdAt ? new Date(order.createdAt).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "Date not available";
  const save = async () => {
    const next = orders.map((item) => item.id === order.id ? { ...item, paymentStatus, deliveryStatus } : item);
    const updated = await api("/api/orders", { method: "PUT", body: JSON.stringify(next) });
    setOrders(updated);
    setSaved("Updated");
    window.setTimeout(() => setSaved(""), 1600);
  };
  return (
    <article className="admin-order">
      <header>
        <div>
          <strong>{order.id}</strong>
          <p>{order.customer?.name || "Customer"} · {order.customer?.email || order.customerEmail}</p>
          <p className="admin-order-time">Ordered: {orderedAt}</p>
        </div>
        <b>{money(order.total)}</b>
      </header>
      <p className="muted">{order.items?.length || 0} items · {order.customer?.phone || "No phone saved"}</p>
      <div className="admin-order-controls">
        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
          <option>Pending</option>
          <option>Paid</option>
          <option>Failed</option>
          <option>Refund requested</option>
          <option>Refunded</option>
        </select>
        <select value={deliveryStatus} onChange={(event) => setDeliveryStatus(event.target.value)}>
          <option>New order</option>
          <option>Processing</option>
          <option>Packed</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
        <button className="primary small" onClick={save} type="button">Update</button>
        <button className="ghost small" onClick={() => { window.location.href = `/invoice.html?order=${encodeURIComponent(order.id)}`; }} type="button">Invoice</button>
        {order.paymentStatus === "Refund requested" && (
          <button className="primary small refund-approve" onClick={() => onApproveRefund(order)} type="button">Approve refund</button>
        )}
        <button className="danger-button small" onClick={() => onDelete(order)} type="button">Delete</button>
      </div>
      {saved && <p className="notice compact">{saved}</p>}
    </article>
  );
}

function ProductAdminRow({ product, setProducts }) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const save = async () => {
    const products = await api("/api/products");
    const next = products.map((item) => item.id === product.id ? { ...item, price: Number(price), stock: Number(stock) } : item);
    const saved = await api("/api/products", { method: "PUT", body: JSON.stringify(next) });
    setProducts(saved);
  };
  return (
    <div className="admin-product">
      <img src={`/${product.image}`} alt={product.name} />
      <strong>{product.name}</strong>
      <label><span>Price (€)</span><input aria-label={`${product.name} price in euros`} value={price} onChange={(e) => setPrice(e.target.value)} type="number" /></label>
      <label><span>Stock</span><input aria-label={`${product.name} stock count`} value={stock} onChange={(e) => setStock(e.target.value)} type="number" /></label>
      <button onClick={save} type="button">Save</button>
    </div>
  );
}

function PaymentSuccess({ go, addCustomerNotification }) {
  const [message, setMessage] = useState("Confirming your payment...");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order");
    const sessionId = params.get("session_id");
    if (!orderId) return setMessage("Payment completed, but order id was missing.");
    if (!sessionId) return setMessage("Payment session was missing. Please contact support with your order id.");
    api("/api/payments/confirm", { method: "POST", body: JSON.stringify({ orderId, sessionId }) })
      .then((data) => {
        addCustomerNotification?.("Order confirmed", `Payment received for ${orderId}. Your invoice has been sent.`);
        setMessage(data.warning ? `Payment successful, but invoice email needs attention: ${data.warning}` : "Payment successful. Your order confirmation and invoice have been sent.");
      })
      .catch((error) => setMessage(error.message));
  }, []);
  return <main className="section success"><CheckCircle2 size={54} /><h1>{message}</h1><button className="primary" onClick={() => go("account")} type="button">View account</button></main>;
}

function Invoice() {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("order");
    if (!orderId) {
      setError("Order id is missing.");
      return;
    }
    api(`/api/invoice?id=${encodeURIComponent(orderId)}`)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, []);
  if (error) {
    return <main className="invoice-screen"><Empty title={error} action="Retour admin" onClick={() => { window.location.href = "/admin.html"; }} /></main>;
  }
  if (!order) {
    return <main className="invoice-screen"><Empty title="Chargement de la facture..." /></main>;
  }
  const created = order.createdAt ? new Date(order.createdAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "Date non disponible";
  const subtotal = Number(order.subtotal ?? (order.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0));
  const shippingFee = Number(order.shippingFee || 0);
  return (
    <main className="invoice-screen">
      <div className="invoice-actions">
        <button className="ghost" onClick={() => { window.location.href = "/admin.html"; }} type="button">Retour admin</button>
        <button className="primary" onClick={() => window.print()} type="button">Imprimer la facture</button>
      </div>
      <section className="invoice-page">
        <header className="invoice-head">
          <div>
            <img src="/assets/idukki-spices-logo.jpeg" alt="Idukki Spices" />
            <h1>Facture</h1>
            <p>Idukki Spices</p>
          </div>
          <div>
            <strong>{order.id}</strong>
            <span>{created}</span>
          </div>
        </header>
        <section className="invoice-parties">
          <div>
            <span>Facturé à</span>
            <strong>{order.customer?.name || "Client"}</strong>
            <p>{order.customer?.email || order.customerEmail}</p>
            <p>{order.customer?.phone || "Téléphone non renseigné"}</p>
            <p>{order.customer?.address || "Adresse non renseignée"}</p>
          </div>
          <div>
            <span>Vendu par</span>
            <strong>Idukki Spices</strong>
            <p>Épices inspirées du Kerala</p>
            <p>Paiement en ligne sécurisé</p>
          </div>
        </section>
        <div className="invoice-table">
          <div className="invoice-row invoice-row-head">
            <span>Article</span>
            <span>Qté</span>
            <span>Prix</span>
            <span>Total</span>
          </div>
          {(order.items || []).map((item) => (
            <div className="invoice-row" key={item.id || item.name}>
              <span>{localizeProduct(item, "fr").name}</span>
              <span>{item.qty}</span>
              <span>{money(item.price)}</span>
              <span>{money(Number(item.qty || 0) * Number(item.price || 0))}</span>
            </div>
          ))}
        </div>
        <section className="invoice-totals">
          <p><span>Sous-total</span><strong>{money(subtotal)}</strong></p>
          <p><span>Livraison</span><strong>{shippingFee ? money(shippingFee) : "Gratuite"}</strong></p>
          <p className="grand-total"><span>Total</span><strong>{money(order.total)}</strong></p>
        </section>
        <footer className="invoice-footer">
          <p>Merci pour votre achat chez Idukki Spices.</p>
        </footer>
      </section>
    </main>
  );
}

function OrderDetail({ lang }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("order");
    api(`/api/order-status?id=${encodeURIComponent(id || "")}`).then(setOrder).catch((err) => setError(err.message));
  }, []);
  if (error) return <main className="section"><Empty title={error} /></main>;
  if (!order) return <main className="section"><Empty title="Loading order..." /></main>;
  return <main className="section"><OrderCard order={order} lang={lang} /></main>;
}

function OrderCard({ order, detailed = false, lang, onCancel, onRefund }) {
  const created = order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) : "Date not available";
  const isFrench = lang === "fr";
  const deliveryStatus = order.deliveryStatus || "New order";
  const paymentStatus = order.paymentStatus || "Pending";
  const canCancel = !["Packed", "Shipped", "Delivered", "Cancelled"].includes(deliveryStatus);
  const canRefund = deliveryStatus === "Cancelled" && paymentStatus === "Paid";
  const showActions = Boolean(onCancel || onRefund);
  return (
    <article className="order-card">
      <header>
        <div>
          <strong>{order.id}</strong>
          <p>{created}</p>
        </div>
        <span>{order.paymentStatus} / {order.deliveryStatus}</span>
      </header>
      <p>{order.items?.length || 0} items · {money(order.total)}</p>
      {showActions && (
        <div className="order-actions">
          {onCancel && (
            <button className="ghost small" disabled={!canCancel} onClick={() => onCancel(order)} type="button">
              {isFrench ? "Annuler" : "Cancel order"}
            </button>
          )}
          {onRefund && (
            <button className="primary small" disabled={!canRefund} onClick={() => onRefund(order)} type="button">
              {isFrench ? "Demander remboursement" : "Request refund"}
            </button>
          )}
        </div>
      )}
      {detailed && (
        <div className="order-items">
          {(order.items || []).map((item) => (
            <div key={`${order.id}-${item.id || item.name}`} className="order-item">
              {item.image && <img src={`/${item.image}`} alt={localizeProduct(item, lang).name} />}
              <div>
                <strong>{localizeProduct(item, lang).name}</strong>
                <p>{item.qty} x {money(item.price)} = {money(Number(item.qty || 0) * Number(item.price || 0))}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", required = false, readOnly = false }) {
  return <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} required={required} readOnly={readOnly} /></label>;
}

function AddressField({ value, onChange, required = false }) {
  const { suggestions, setSuggestions, loading } = useAddressSuggestions(value);
  const choose = (address) => {
    onChange(address);
    setSuggestions([]);
  };
  return (
    <label className="field address-field">
      <span>Address</span>
      <div className="address-input-wrap">
        <MapPin size={18} />
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Start typing your street, city, or postal code"
          required={required}
        />
      </div>
      {(loading || suggestions.length > 0) && (
        <div className="address-suggestions">
          {loading && <p>Searching addresses...</p>}
          {suggestions.map((address) => (
            <button key={address} type="button" onClick={() => choose(address)}>
              <MapPin size={16} />
              <span>{address}</span>
            </button>
          ))}
        </div>
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return <label className="field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>;
}

function SectionTitle({ eyebrow, title }) {
  return <div className="section-title"><p className="kicker">{eyebrow}</p><h2>{title}</h2></div>;
}

function Stat({ icon, label, value }) {
  return <article className="stat">{icon}<span>{label}</span><strong>{value}</strong></article>;
}

function InstagramIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.15" cy="6.85" r="1.25" fill="currentColor" />
    </svg>
  );
}

function Empty({ title, action, onClick }) {
  return <div className="empty"><Sparkles /><h2>{title}</h2>{action && <button className="primary" onClick={onClick} type="button">{action}</button>}</div>;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Idukki Spices</strong>
        <span>Fresh Kerala-inspired spices, secure checkout, and quick support.</span>
      </div>
      <div className="footer-contact">
        <a href={`mailto:${companyContactEmail}`}><Mail size={17} /> {companyContactEmail}</a>
        <a href={`tel:${companyContactPhone.replace(/\s/g, "")}`}><Phone size={17} /> {companyContactPhone}</a>
        <a href={companyInstagramUrl} target="_blank" rel="noreferrer"><InstagramIcon size={17} /> @idukkispicesfr</a>
        <span><MapPin size={17} /> {companyContactLocation}</span>
      </div>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
