const productStoreKey = "idukki-spices-products";
const orderStoreKey = "idukki-spices-orders";
const customerStoreKey = "idukki-spices-customers";
const sessionCustomerKey = "idukki-current-customer";
const customerTokenKey = "idukki-customer-session";
const otpStoreKey = "idukki-login-otp";
const adminSessionKey = "idukki-admin-session";
const backendEnabled = window.location.protocol === "http:" || window.location.protocol === "https:";

const countryDialCodes = [
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

const baseProducts = [
  {
    id: "green-cardamom-50",
    name: "Green Cardamom 50g",
    price: 4,
    icon: "C",
    art: "cardamom",
    category: "whole",
    stock: 30,
    image: "assets/cardamom-closeup.webp",
    uses: "Best for tea, sweets, biryani, and festive rice.",
    description: "Fragrant Idukki green cardamom pods for tea, desserts, biryani, and slow-cooked curries."
  },
  {
    id: "green-cardamom-100",
    name: "Green Cardamom 100g",
    price: 7,
    icon: "C",
    art: "cardamom",
    category: "whole",
    stock: 24,
    image: "assets/cardamom-bowl.jpg",
    uses: "Best for regular tea drinkers and family cooking.",
    description: "A larger pack of bright, aromatic cardamom pods with deep natural sweetness."
  },
  {
    id: "mixed-spices-100",
    name: "Mixed Spices 100g",
    price: 8,
    icon: "M",
    art: "mix",
    category: "blend",
    stock: 18,
    image: "assets/mixed-spices-pack.png",
    uses: "Best for everyday curries, marinades, and roasted dishes.",
    description: "A balanced blend for everyday cooking, roasted dishes, marinades, and festive meals."
  },
  {
    id: "black-pepper",
    name: "Black Pepper",
    price: 5,
    icon: "P",
    art: "pepper",
    category: "whole",
    stock: 20,
    image: "assets/black-pepper-pack.png",
    uses: "Best for finishing curries, soups, eggs, and grilled dishes.",
    description: "Bold peppercorns with sharp heat and a clean finish."
  },
  {
    id: "cloves",
    name: "Cloves",
    price: 4,
    icon: "L",
    art: "clove",
    category: "whole",
    stock: 20,
    image: "assets/product-cloves.svg",
    uses: "Best for spice blends, rice, pickles, and warm drinks.",
    description: "Warm, intense cloves for spice blends, sweets, teas, and pickles."
  },
  {
    id: "cinnamon",
    name: "Cinnamon",
    price: 3,
    icon: "N",
    art: "cinnamon",
    category: "whole",
    stock: 25,
    image: "assets/product-cinnamon.svg",
    uses: "Best for baking, tea, desserts, and slow-cooked sauces.",
    description: "Sweet, woody cinnamon for baking, drinks, and slow simmered dishes."
  },
  {
    id: "star-anise",
    name: "Star Anise",
    price: 4,
    icon: "S",
    art: "star",
    category: "whole",
    stock: 16,
    image: "assets/star-anise-pack.png",
    uses: "Best for broths, biryani, masala blends, and slow cooking.",
    description: "Beautiful star anise with licorice-like warmth for broths and masalas."
  },
  {
    id: "bay-leaves",
    name: "Bay Leaves",
    price: 2,
    icon: "B",
    art: "bay",
    category: "leaf",
    stock: 22,
    image: "assets/product-bay-leaves.svg",
    uses: "Best for soups, rice, stews, and curries.",
    description: "Dried bay leaves that add gentle herbal depth to soups, rice, and curries."
  }
];

function apiSync(method, path, body) {
  if (!backendEnabled) return null;
  try {
    window.lastApiError = null;
    const request = new XMLHttpRequest();
    request.open(method, path, false);
    request.setRequestHeader("Content-Type", "application/json");
    const adminToken = sessionStorage.getItem(adminSessionKey);
    const customerToken = sessionStorage.getItem(customerTokenKey);
    if (adminToken) request.setRequestHeader("Authorization", `Bearer ${adminToken}`);
    else if (customerToken) request.setRequestHeader("Authorization", `Bearer ${customerToken}`);
    request.send(body === undefined ? null : JSON.stringify(body));
    if (request.status < 200 || request.status >= 300) {
      window.lastApiError = request.responseText ? JSON.parse(request.responseText) : { error: "Request failed" };
      return null;
    }
    return request.responseText ? JSON.parse(request.responseText) : null;
  } catch {
    window.lastApiError = { error: "Connection failed" };
    return null;
  }
}

function loadProducts() {
  const remoteProducts = apiSync("GET", "/api/products");
  if (Array.isArray(remoteProducts) && remoteProducts.length) return remoteProducts;
  try {
    const saved = JSON.parse(localStorage.getItem(productStoreKey));
    return Array.isArray(saved) && saved.length ? saved : baseProducts;
  } catch {
    return baseProducts;
  }
}

function saveProducts(nextProducts) {
  const savedProducts = apiSync("PUT", "/api/products", nextProducts);
  if (!savedProducts) localStorage.setItem(productStoreKey, JSON.stringify(nextProducts));
  products = loadProducts();
  currentProductList = products;
}

function readOrders() {
  const remoteOrders = apiSync("GET", "/api/orders");
  if (Array.isArray(remoteOrders)) return remoteOrders;
  try {
    return JSON.parse(localStorage.getItem(orderStoreKey)) || [];
  } catch {
    return [];
  }
}

function readAccountOrders() {
  const remoteOrders = apiSync("GET", "/api/account/orders");
  if (Array.isArray(remoteOrders)) return remoteOrders;
  return readOrders();
}

function writeOrders(orders) {
  const savedOrders = apiSync("PUT", "/api/orders", orders);
  if (!savedOrders) localStorage.setItem(orderStoreKey, JSON.stringify(orders));
}

function readCustomers() {
  const remoteCustomers = apiSync("GET", "/api/customers");
  if (Array.isArray(remoteCustomers)) return remoteCustomers;
  try {
    return JSON.parse(localStorage.getItem(customerStoreKey)) || [];
  } catch {
    return [];
  }
}

function writeCustomers(customers) {
  const savedCustomers = apiSync("PUT", "/api/customers", customers);
  if (!savedCustomers) localStorage.setItem(customerStoreKey, JSON.stringify(customers));
}

function currentCustomer() {
  const email = sessionStorage.getItem(sessionCustomerKey);
  const profile = JSON.parse(sessionStorage.getItem("idukki-current-profile") || "null");
  if (profile?.email === email) return profile;
  return readCustomers().find((customer) => customer.email === email) || null;
}

function setCurrentCustomer(email, token, profile) {
  sessionStorage.setItem(sessionCustomerKey, email);
  if (token) sessionStorage.setItem(customerTokenKey, token);
  if (profile) sessionStorage.setItem("idukki-current-profile", JSON.stringify(profile));
  updateAccountLinks();
}

function logoutCustomer() {
  sessionStorage.removeItem(sessionCustomerKey);
  sessionStorage.removeItem(customerTokenKey);
  sessionStorage.removeItem("idukki-current-profile");
  updateAccountLinks();
  renderAccountPage();
}

let products = loadProducts();
let currentProductList = products;

const cartKey = "idukki-spices-cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || {};
  } catch {
    return {};
  }
}

function writeCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();
  updateProductCounts();
}

function cartQuantity() {
  return Object.values(readCart()).reduce((sum, qty) => sum + qty, 0);
}

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = cartQuantity();
  });
}

function updateAccountLinks() {
  const customer = currentCustomer();
  document.querySelectorAll("[data-account-link]").forEach((link) => {
    link.href = customer ? "account.html" : "auth.html";
    link.textContent = customer ? "My account" : "Login";
  });
}

function normalizeIdentity(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text.includes("@")) return text;
  return text.replace(/[\s().-]/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
}

function normalizePhone(value) {
  return String(value || "").trim().replace(/[\s().-]/g, "");
}

function buildPhoneNumber(countryCode, localNumber) {
  const raw = String(localNumber || "").trim();
  if (raw.startsWith("+")) return normalizePhone(raw);
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return "";
  return `${countryCode || ""}${digits}`;
}

function phoneValidationMessage(value) {
  const phone = normalizePhone(value);
  if (!phone) return "Enter your phone number.";
  if (!phone.startsWith("+")) return "Phone number must include country code, for example +33782504514.";
  if (!/^\+\d{8,15}$/.test(phone)) return "Phone number must contain only + and 8 to 15 digits.";
  if (phone.startsWith("+330")) return "For France, remove the 0 after +33. Use +33782504514.";
  return "";
}

function setFieldError(input, message) {
  if (!input) return;
  input.classList.toggle("input-error", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
  input.setCustomValidity(message || "");
}

function populateCountryCodeSelects() {
  document.querySelectorAll("[data-country-select]").forEach((select) => {
    if (select.options.length) return;
    countryDialCodes.forEach(([flag, country, code]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${flag} ${country} ${code}`;
      if (country === "France") option.selected = true;
      select.appendChild(option);
    });
  });
}

function findAccountByIdentity(identity) {
  const normalized = normalizeIdentity(identity);
  return readCustomers().find((customer) => (
    normalizeIdentity(customer.email) === normalized ||
    normalizeIdentity(customer.phone) === normalized
  ));
}

function updateProductCounts() {
  const cart = readCart();
  document.querySelectorAll("[data-product-count]").forEach((node) => {
    const qty = cart[node.dataset.productCount] || 0;
    node.textContent = qty;
    node.setAttribute("aria-label", `${qty} in cart`);
  });
}

function money(value) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(value);
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const cart = readCart();
  cart[id] = (cart[id] || 0) + 1;
  writeCart(cart);
  const button = document.querySelector(`[data-add="${id}"][data-add-label]`);
  if (button) {
    button.textContent = "Added";
    setTimeout(() => {
      button.textContent = "Add to cart";
    }, 850);
  }
}

function decreaseFromCart(id) {
  const cart = readCart();
  const qty = cart[id] || 0;
  if (qty <= 1) {
    delete cart[id];
  } else {
    cart[id] = qty - 1;
  }
  writeCart(cart);
}

function setQuantity(id, qty) {
  const cart = readCart();
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  writeCart(cart);
  renderCart();
}

function renderProducts(options = {}) {
  const grid = document.querySelector("[data-products]");
  if (!grid) return;
  const { limit, showCartControls = true, productList = currentProductList } = options;
  const shown = typeof limit === "number" ? productList.slice(0, limit) : productList;
  grid.innerHTML = shown.map((product) => {
    const price = money(product.price);
    const action = showCartControls
      ? `
        <div class="product-counter">
          <button type="button" data-dec-product="${product.id}" aria-label="Decrease ${product.name} quantity">-</button>
          <span class="product-count" data-product-count="${product.id}" aria-live="polite" aria-label="0 in cart">0</span>
          <button type="button" data-add="${product.id}" aria-label="Increase ${product.name} quantity">+</button>
        </div>
      `
      : `<button class="button small" type="button" data-add="${product.id}" data-add-label>Add to cart</button>`;
    return `
      <article class="product-card">
        <img class="product-image" src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="product-meta">${product.uses}</p>
        <div class="price">${price}</div>
        <div class="product-actions">
          ${action}
          ${showCartControls ? `<button class="quick-view" type="button" data-quick-view="${product.id}">Quick view</button>` : ""}
        </div>
      </article>
    `;
  }).join("");
  const emptyResults = document.querySelector("[data-empty-results]");
  if (emptyResults) emptyResults.hidden = shown.length > 0;
  grid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
  grid.querySelectorAll("[data-dec-product]").forEach((button) => {
    button.addEventListener("click", () => decreaseFromCart(button.dataset.decProduct));
  });
  grid.querySelectorAll("[data-quick-view]").forEach((button) => {
    button.addEventListener("click", () => openProductModal(button.dataset.quickView));
  });
  updateProductCounts();
}

function getShopFilteredProducts() {
  const search = (document.querySelector("[data-shop-search]")?.value || "").trim().toLowerCase();
  const category = document.querySelector("[data-shop-category]")?.value || "all";
  const sort = document.querySelector("[data-shop-sort]")?.value || "featured";

  let filtered = products.filter((product) => {
    const matchesSearch = [product.name, product.description, product.uses].join(" ").toLowerCase().includes(search);
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sort === "price-low") filtered = filtered.slice().sort((a, b) => a.price - b.price);
  if (sort === "price-high") filtered = filtered.slice().sort((a, b) => b.price - a.price);
  if (sort === "name") filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

function updateShopProducts() {
  currentProductList = getShopFilteredProducts();
  renderProducts({ showCartControls: true, productList: currentProductList });
}

function setupShopFilters() {
  if (!document.querySelector("[data-shop-search]")) return;
  ["[data-shop-search]", "[data-shop-category]", "[data-shop-sort]"].forEach((selector) => {
    document.querySelector(selector).addEventListener("input", updateShopProducts);
    document.querySelector(selector).addEventListener("change", updateShopProducts);
  });
}

function openProductModal(id) {
  const product = products.find((item) => item.id === id);
  const modal = document.querySelector("[data-product-modal]");
  if (!product || !modal) return;
  modal.querySelector("[data-modal-image]").src = product.image;
  modal.querySelector("[data-modal-image]").alt = product.name;
  modal.querySelector("[data-modal-title]").textContent = product.name;
  modal.querySelector("[data-modal-description]").textContent = product.description;
  modal.querySelector("[data-modal-uses]").textContent = product.uses;
  modal.querySelector("[data-modal-price]").textContent = money(product.price);
  modal.hidden = false;
}

function setupProductModal() {
  const modal = document.querySelector("[data-product-modal]");
  if (!modal) return;
  modal.querySelector("[data-modal-close]").addEventListener("click", () => {
    modal.hidden = true;
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.hidden = true;
  });
}

function renderCart() {
  const container = document.querySelector("[data-cart-items]");
  const summary = document.querySelector("[data-cart-summary]");
  if (!container || !summary) return;

  const cart = readCart();
  const entries = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((item) => item.id === id), qty }))
    .filter((entry) => entry.product);

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-cart modern-empty">
        <img src="assets/cardamom-closeup.webp" alt="Green cardamom pods">
        <div>
          <h2>Your cart is empty</h2>
          <p>Add cardamom, pepper, mixed spices, or whole spices from the shop to start an order.</p>
          <a class="button" href="shop.html">Browse shop</a>
        </div>
      </div>
    `;
    summary.innerHTML = `
      <h2>Order summary</h2>
      <div class="summary-row total"><span>Total</span><span>${money(0)}</span></div>
      <a class="button" href="shop.html">Visit shop</a>
    `;
    return;
  }

  const subtotal = entries.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0);
  const itemCount = entries.reduce((sum, entry) => sum + entry.qty, 0);
  container.innerHTML = `
    <div class="cart-list-header">
      <div>
        <p class="eyebrow">Selected products</p>
        <h2>${itemCount} item${itemCount === 1 ? "" : "s"} in your cart</h2>
      </div>
      <a class="button light small" href="shop.html">Continue shopping</a>
    </div>
    ${entries.map(({ product, qty }) => `
      <article class="cart-item">
        <img class="cart-item-image" src="${product.image}" alt="${product.name}">
        <div class="cart-item-main">
          <h3>${product.name}</h3>
          <p>${product.uses}</p>
          <span>${money(product.price)} each</span>
        </div>
        <div class="cart-item-actions">
          <div class="qty-controls" aria-label="Quantity controls for ${product.name}">
            <button type="button" data-dec="${product.id}" aria-label="Decrease quantity">-</button>
            <strong>${qty}</strong>
            <button type="button" data-inc="${product.id}" aria-label="Increase quantity">+</button>
          </div>
          <strong class="line-total">${money(product.price * qty)}</strong>
          <button class="remove-line" type="button" data-remove="${product.id}">Remove</button>
        </div>
      </article>
    `).join("")}
  `;

  summary.innerHTML = `
    <h2>Order summary</h2>
    <p class="summary-note">Your total updates instantly when you change quantities.</p>
    <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="summary-row"><span>Delivery</span><span>At checkout</span></div>
    <div class="summary-row total"><span>Total</span><span>${money(subtotal)}</span></div>
    <a class="button" href="checkout.html">Buy now</a>
    <div class="summary-trust">
      <span>Freshly packed</span>
      <span>Secure checkout setup</span>
      <span>Delivery details collected next</span>
    </div>
  `;

  container.querySelectorAll("[data-dec]").forEach((button) => {
    button.addEventListener("click", () => setQuantity(button.dataset.dec, (cart[button.dataset.dec] || 0) - 1));
  });
  container.querySelectorAll("[data-inc]").forEach((button) => {
    button.addEventListener("click", () => setQuantity(button.dataset.inc, (cart[button.dataset.inc] || 0) + 1));
  });
  container.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => setQuantity(button.dataset.remove, 0));
  });
}

function setupNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const note = document.querySelector("[data-form-note]");
  if (!form || !note) return;

  const params = new URLSearchParams(window.location.search);
  const product = params.get("product");
  if (product) {
    const subject = form.querySelector("#subject");
    const message = form.querySelector("#message");
    subject.value = `Enquiry about ${product}`;
    message.value = `Hello Idukki Spices, I would like to know the current price and availability for ${product}.`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    note.textContent = "Thanks. Your message is ready - please send it by email or phone.";
    form.reset();
  });
}

function renderCheckout() {
  const itemsNode = document.querySelector("[data-checkout-items]");
  const totalNode = document.querySelector("[data-checkout-total]");
  if (!itemsNode || !totalNode) return;
  const customer = currentCustomer();
  const name = document.querySelector("#checkout-name");
  const email = document.querySelector("#checkout-email");
  const address = document.querySelector("#checkout-address");
  if (customer && name && email && address) {
    name.value = customer.name || "";
    email.value = customer.email || "";
    address.value = customer.address || "";
  }

  const entries = Object.entries(readCart())
    .map(([id, qty]) => ({ product: products.find((item) => item.id === id), qty }))
    .filter((entry) => entry.product);

  if (entries.length === 0) {
    itemsNode.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
    totalNode.textContent = money(0);
    return;
  }

  const total = entries.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0);
  itemsNode.innerHTML = entries.map(({ product, qty }) => `
    <div class="summary-row">
      <span>${product.name} x ${qty}</span>
      <strong>${money(product.price * qty)}</strong>
    </div>
  `).join("");
  totalNode.textContent = money(total);
}

function getCartEntries() {
  return Object.entries(readCart())
    .map(([id, qty]) => ({ product: products.find((item) => item.id === id), qty }))
    .filter((entry) => entry.product);
}

function setupCheckoutForm() {
  const form = document.querySelector("[data-checkout-form]");
  const note = document.querySelector("[data-checkout-note]");
  if (!form || !note) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const entries = getCartEntries();
    if (entries.length === 0) {
      note.textContent = "Add products to the cart before checkout.";
      return;
    }

    const formData = new FormData(form);
    const order = {
      id: `IDK-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customer: {
        name: formData.get("name"),
        email: formData.get("email"),
        address: formData.get("address")
      },
      customerEmail: formData.get("email"),
      paymentMethod: formData.get("payment-method"),
      paymentStatus: "Pending",
      deliveryStatus: "New order",
      items: entries.map(({ product, qty }) => ({
        id: product.id,
        name: product.name,
        qty,
        price: product.price,
        image: product.image
      })),
      total: entries.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0)
    };

    const serverOrder = apiSync("POST", "/api/orders", order);
    if (serverOrder) {
      products = loadProducts();
      currentProductList = products;
      if (serverOrder.stripeSession?.url) {
        writeCart({});
        window.location.href = serverOrder.stripeSession.url;
        return;
      }
    } else {
      writeOrders([order, ...readOrders()]);
      const customers = readCustomers();
      const existing = customers.find((customer) => customer.email === order.customerEmail);
      if (existing) {
        writeCustomers(customers.map((customer) => customer.email === order.customerEmail
          ? { ...customer, name: order.customer.name, address: order.customer.address }
          : customer));
      }
      const nextProducts = products.map((product) => {
        const entry = entries.find((item) => item.product.id === product.id);
        return entry ? { ...product, stock: Math.max(0, (product.stock || 0) - entry.qty) } : product;
      });
      saveProducts(nextProducts);
    }
    writeCart({});
    renderCheckout();
    form.reset();
    if (serverOrder?.stripeSession?.setupRequired) {
      note.textContent = `Order ${order.id} saved. Stripe is not configured yet: ${serverOrder.stripeSession.setupRequired}.`;
    } else if (serverOrder?.emailResult?.setupRequired) {
      note.textContent = `Order ${order.id} saved. Email is not configured yet: ${serverOrder.emailResult.setupRequired}.`;
    } else if (serverOrder?.warning) {
      note.textContent = `Order ${order.id} saved. Setup needed: ${serverOrder.warning}.`;
    } else {
      note.textContent = `Order ${order.id} saved. Confirmation is recorded for ${order.customer.email}.`;
    }
  });
}

function setupCustomerAuth() {
  const signup = document.querySelector("[data-signup-form]");
  const login = document.querySelector("[data-login-form]");
  populateCountryCodeSelects();
  const activateAuthTab = (tab) => {
    document.querySelectorAll("[data-auth-tab]").forEach((item) => {
      item.classList.toggle("active", item.dataset.authTab === tab);
    });
    document.querySelectorAll("[data-auth-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.authPanel === tab);
    });
  };

  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activateAuthTab(button.dataset.authTab);
    });
  });

  if (signup) {
    signup.addEventListener("submit", (event) => {
      event.preventDefault();
      const note = document.querySelector("[data-signup-note]");
      const emailInput = signup.querySelector("#signup-email");
      const phoneInput = signup.querySelector("#signup-phone");
      const countryCodeInput = signup.querySelector("[data-signup-country-code]");
      const formData = new FormData(signup);
      const email = normalizeIdentity(formData.get("email"));
      const phone = buildPhoneNumber(countryCodeInput?.value, formData.get("phone"));
      setFieldError(emailInput, "");
      setFieldError(phoneInput, "");
      if (!isValidEmail(email)) {
        setFieldError(emailInput, "Enter a valid email address, for example you@example.com.");
        note.textContent = "Enter a valid email address, for example you@example.com.";
        emailInput.focus();
        return;
      }
      const phoneError = phoneValidationMessage(phone);
      if (phoneError) {
        setFieldError(phoneInput, phoneError);
        note.textContent = phoneError;
        phoneInput.focus();
        return;
      }
      const customers = readCustomers();
      if (customers.some((customer) => normalizeIdentity(customer.email) === email || normalizeIdentity(customer.phone) === phone)) {
        note.textContent = "An account already exists for this email or phone.";
        return;
      }
      const customer = {
        id: `CUS-${Date.now().toString().slice(-6)}`,
        name: formData.get("name"),
        email,
        phone,
        address: formData.get("address") || "",
        createdAt: new Date().toISOString()
      };
      const registered = apiSync("POST", "/api/accounts/register", customer);
      if (!registered && backendEnabled) {
        note.textContent = window.lastApiError?.error || "Signup failed. Please try again.";
        return;
      }
      if (!backendEnabled) writeCustomers([customer, ...customers]);
      sessionStorage.removeItem(customerTokenKey);
      sessionStorage.removeItem(sessionCustomerKey);
      signup.reset();
      activateAuthTab("login");
      const loginNote = document.querySelector("[data-login-note]");
      const loginIdentity = document.querySelector("#login-identity");
      if (loginIdentity) loginIdentity.value = email;
      if (loginNote) loginNote.textContent = "Account created. Send OTP to login.";
    });

    signup.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => setFieldError(input, ""));
    });
  }

  if (login) {
    const identityInput = login.querySelector("#login-identity");
    const phoneInput = login.querySelector("#login-phone");
    const phoneRow = login.querySelector("[data-login-phone-row]");
    const countryCodeInput = login.querySelector("[data-login-country-code]");
    const methodSelect = login.querySelector("[data-login-method]");
    const otpInput = login.querySelector("#login-otp");
    const sendButton = login.querySelector("[data-send-otp]");
    const note = document.querySelector("[data-login-note]");
    const currentLoginIdentity = () => (
      methodSelect.value === "phone"
        ? buildPhoneNumber(countryCodeInput?.value, phoneInput?.value)
        : normalizeIdentity(identityInput.value)
    );

    if (methodSelect && identityInput) {
      methodSelect.addEventListener("change", () => {
        const isPhone = methodSelect.value === "phone";
        identityInput.type = "email";
        identityInput.placeholder = "you@example.com";
        identityInput.required = !isPhone;
        phoneInput.required = isPhone;
        phoneRow.classList.toggle("is-hidden", !isPhone);
        identityInput.classList.toggle("is-hidden", isPhone);
        identityInput.value = "";
        phoneInput.value = "";
        setFieldError(identityInput, "");
        setFieldError(phoneInput, "");
        note.textContent = "";
      });
    }

    if (sendButton) {
      sendButton.addEventListener("click", () => {
        const identity = currentLoginIdentity();
        const activeInput = methodSelect.value === "phone" ? phoneInput : identityInput;
        setFieldError(identityInput, "");
        setFieldError(phoneInput, "");
        if (!identity) {
          note.textContent = "Enter your email or phone first.";
          setFieldError(activeInput, note.textContent);
          activeInput.focus();
          return;
        }
        if (methodSelect.value === "email" && !isValidEmail(identity)) {
          note.textContent = "Enter a valid email address, for example you@example.com.";
          setFieldError(identityInput, note.textContent);
          identityInput.focus();
          return;
        }
        if (methodSelect.value === "phone") {
          const phoneError = phoneValidationMessage(identity);
          if (phoneError) {
            note.textContent = phoneError;
            setFieldError(phoneInput, phoneError);
            phoneInput.focus();
            return;
          }
        }
        const account = backendEnabled ? null : findAccountByIdentity(identity);
        if (!backendEnabled && !account) {
          note.textContent = "No account found. Create an account first.";
          return;
        }
        const response = apiSync("POST", "/api/auth/request-otp", { identity, method: methodSelect.value });
        if (!response && backendEnabled) {
          note.textContent = window.lastApiError?.error || "OTP could not be sent. Configure email/SMS provider on the server.";
          return;
        }
        if (!backendEnabled) {
          const code = String(Math.floor(100000 + Math.random() * 900000));
          sessionStorage.setItem(otpStoreKey, JSON.stringify({ identity, code, expiresAt: Date.now() + 5 * 60 * 1000 }));
          note.textContent = `Demo OTP sent: ${code}.`;
        } else {
          note.textContent = "OTP sent. Check your email or phone.";
        }
        otpInput.focus();
      });
    }

    login.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(login);
      const identity = methodSelect.value === "phone"
        ? buildPhoneNumber(countryCodeInput?.value, formData.get("phoneLocal"))
        : normalizeIdentity(formData.get("identity"));
      setFieldError(identityInput, "");
      setFieldError(phoneInput, "");
      if (methodSelect.value === "email" && !isValidEmail(identity)) {
        note.textContent = "Enter a valid email address, for example you@example.com.";
        setFieldError(identityInput, note.textContent);
        identityInput.focus();
        return;
      }
      if (methodSelect.value === "phone") {
        const phoneError = phoneValidationMessage(identity);
        if (phoneError) {
          note.textContent = phoneError;
          setFieldError(phoneInput, phoneError);
          phoneInput.focus();
          return;
        }
      }
      if (backendEnabled) {
        const verified = apiSync("POST", "/api/auth/verify-otp", { identity, otp: formData.get("otp") });
        if (!verified?.ok) {
          note.textContent = "OTP is incorrect or expired.";
          return;
        }
        setCurrentCustomer(verified.email, verified.token, verified.account);
      } else {
        const account = findAccountByIdentity(identity);
        const otpData = JSON.parse(sessionStorage.getItem(otpStoreKey) || "null");
        if (!account) {
          note.textContent = "No account found. Create an account first.";
          return;
        }
        if (!otpData || otpData.identity !== identity || otpData.expiresAt < Date.now()) {
          note.textContent = "Please request a fresh OTP.";
          return;
        }
        if (String(formData.get("otp")).trim() !== otpData.code) {
          note.textContent = "OTP is incorrect.";
          return;
        }
        sessionStorage.removeItem(otpStoreKey);
        setCurrentCustomer(account.email, null, account);
      }
      window.location.href = "index.html";
    });

    identityInput.addEventListener("input", () => setFieldError(identityInput, ""));
    phoneInput.addEventListener("input", () => setFieldError(phoneInput, ""));
  }
}

function renderAccountPage() {
  const node = document.querySelector("[data-account-page]");
  if (!node) return;
  const customer = currentCustomer();
  if (!customer) {
    node.innerHTML = `
      <div class="form-card">
        <h2>Please login</h2>
        <p class="lead">Login or create an account to see order history.</p>
        <a class="button" href="auth.html">Login or signup</a>
      </div>
    `;
    return;
  }
  const orders = backendEnabled ? readAccountOrders() : readOrders().filter((order) => order.customerEmail === customer.email);
  node.innerHTML = `
    <aside class="account-card">
      <h2>${customer.name}</h2>
      <p>${customer.email}</p>
      <p>${customer.phone || "No phone saved."}</p>
      <p>${customer.address || "No saved address yet."}</p>
      <button class="button light small" type="button" data-customer-logout>Logout</button>
    </aside>
    <div class="account-orders">
      <div class="cart-list-header">
        <div>
          <p class="eyebrow">Order history</p>
          <h2>${orders.length} order${orders.length === 1 ? "" : "s"}</h2>
        </div>
        <a class="button light small" href="shop.html">Shop again</a>
      </div>
      ${orders.length ? orders.map((order) => `
        <article class="admin-order">
          <div class="admin-order-head">
            <div>
              <p class="eyebrow">${new Date(order.createdAt).toLocaleString()}</p>
              <h3>${order.id}</h3>
              <p>${order.paymentStatus} · ${order.deliveryStatus}</p>
            </div>
            <strong>${money(order.total)}</strong>
          </div>
          <div class="admin-order-items">
            ${order.items.map((item) => `<span>${item.name} x ${item.qty}</span>`).join("")}
          </div>
        </article>
      `).join("") : `<div class="empty-cart">No orders yet.</div>`}
    </div>
  `;
  node.querySelector("[data-customer-logout]").addEventListener("click", logoutCustomer);
}

function setupPaymentPanel() {
  const method = document.querySelector("[data-payment-method]");
  const panel = document.querySelector("[data-payment-panel]");
  if (!method || !panel) return;
  const messages = {
    card: "Secure card payment can be connected with Stripe when the live payment account is ready.",
    paypal: "PayPal checkout can be connected once your PayPal Business account is ready.",
    bank: "Bank transfer can show your business bank details after you add them."
  };
  method.addEventListener("change", () => {
    panel.textContent = messages[method.value];
  });
}

function setupFaq() {
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("open");
      const answer = button.nextElementSibling;
      if (answer) answer.classList.toggle("open");
    });
  });
}

function setupMoodPicker() {
  const picker = document.querySelector("[data-mood-picker]");
  const recommendation = document.querySelector("[data-recommendation]");
  if (!picker || !recommendation) return;
  const data = {
    tea: ["assets/cardamom-closeup.webp", "Green Cardamom", "Perfect for masala tea, payasam, cakes, and fragrant rice."],
    curry: ["assets/mixed-spices-pack.png", "Mixed Spices", "A ready helper for curries, marinades, roasted vegetables, and everyday meals."],
    baking: ["assets/product-cinnamon.svg", "Cinnamon", "Sweet and woody, ideal for cakes, desserts, porridge, and warm drinks."],
    broth: ["assets/star-anise-pack.png", "Star Anise", "Deep and aromatic for broths, slow-cooked sauces, biryani, and masala bases."]
  };
  picker.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      picker.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const [image, title, text] = data[button.dataset.mood];
      recommendation.querySelector("img").src = image;
      recommendation.querySelector("img").alt = title;
      recommendation.querySelector("h3").textContent = title;
      recommendation.querySelector("div p:last-child").textContent = text;
    });
  });
}

function renderAdminStats() {
  const node = document.querySelector("[data-admin-stats]");
  if (!node) return;
  const orders = readOrders();
  const customers = readCustomers();
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const lowStock = products.filter((product) => Number(product.stock || 0) <= 5).length;
  node.innerHTML = `
    <article><strong>${products.length}</strong><span>Products</span></article>
    <article><strong>${orders.length}</strong><span>Orders</span></article>
    <article><strong>${customers.length}</strong><span>Accounts</span></article>
    <article><strong>${money(revenue)}</strong><span>Order value</span></article>
    <article><strong>${lowStock}</strong><span>Low stock items</span></article>
  `;
}

function renderAdminProducts() {
  const tbody = document.querySelector("[data-admin-products]");
  if (!tbody) return;
  tbody.innerHTML = products.map((product) => `
    <tr data-admin-product="${product.id}">
      <td>
        <div class="admin-product-cell">
          <img src="${product.image}" alt="${product.name}">
          <input data-field="name" value="${product.name}">
        </div>
      </td>
      <td><input data-field="price" type="number" min="0" step="0.5" value="${product.price}"></td>
      <td><input data-field="stock" type="number" min="0" step="1" value="${product.stock || 0}"></td>
      <td><input data-field="image" value="${product.image}"></td>
      <td><textarea data-field="description">${product.description}</textarea></td>
      <td><button class="button small" type="button" data-save-product="${product.id}">Save</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-save-product]").forEach((button) => {
    button.addEventListener("click", () => saveAdminProduct(button.dataset.saveProduct));
  });
}

function saveAdminProduct(id) {
  const row = document.querySelector(`[data-admin-product="${id}"]`);
  if (!row) return;
  const value = (field) => row.querySelector(`[data-field="${field}"]`).value.trim();
  const nextProducts = products.map((product) => {
    if (product.id !== id) return product;
    return {
      ...product,
      name: value("name"),
      price: Number(value("price")),
      stock: Number(value("stock")),
      image: value("image"),
      description: value("description")
    };
  });
  saveProducts(nextProducts);
  renderAdminProducts();
  renderAdminStats();
}

function renderAdminOrders() {
  const node = document.querySelector("[data-admin-orders]");
  if (!node) return;
  const orders = readOrders();
  if (orders.length === 0) {
    node.innerHTML = `<div class="empty-cart">No orders yet. Submit a checkout order to see it here.</div>`;
    return;
  }
  node.innerHTML = orders.map((order) => `
    <article class="admin-order" data-admin-order="${order.id}">
      <div class="admin-order-head">
        <div>
          <p class="eyebrow">${new Date(order.createdAt).toLocaleString()}</p>
          <h3>${order.id}</h3>
          <p>${order.customer.name} · ${order.customer.email}</p>
        </div>
        <strong>${money(order.total)}</strong>
      </div>
      <div class="admin-order-items">
        ${order.items.map((item) => `
          <span>${item.name} x ${item.qty}</span>
        `).join("")}
      </div>
      <p class="admin-address">${order.customer.address}</p>
      <div class="admin-order-controls">
        <label>Payment
          <select data-order-field="paymentStatus">
            <option${order.paymentStatus === "Pending" ? " selected" : ""}>Pending</option>
            <option${order.paymentStatus === "Paid" ? " selected" : ""}>Paid</option>
            <option${order.paymentStatus === "Refunded" ? " selected" : ""}>Refunded</option>
          </select>
        </label>
        <label>Delivery
          <select data-order-field="deliveryStatus">
            <option${order.deliveryStatus === "New order" ? " selected" : ""}>New order</option>
            <option${order.deliveryStatus === "Packing" ? " selected" : ""}>Packing</option>
            <option${order.deliveryStatus === "Out for delivery" ? " selected" : ""}>Out for delivery</option>
            <option${order.deliveryStatus === "Delivered" ? " selected" : ""}>Delivered</option>
          </select>
        </label>
        <button class="button small" type="button" data-save-order="${order.id}">Update</button>
      </div>
      <p class="admin-save-note" data-order-note="${order.id}" aria-live="polite"></p>
    </article>
  `).join("");

  node.querySelectorAll("[data-save-order]").forEach((button) => {
    button.addEventListener("click", () => saveAdminOrder(button.dataset.saveOrder));
  });
}

function renderAdminCustomers() {
  const node = document.querySelector("[data-admin-customers]");
  if (!node) return;
  const customers = readCustomers();
  if (customers.length === 0) {
    node.innerHTML = `<div class="empty-cart">No accounts yet.</div>`;
    return;
  }
  node.innerHTML = customers.map((customer) => {
    const orders = readOrders().filter((order) => order.customerEmail === customer.email);
    const total = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    return `
      <article class="admin-order">
        <div class="admin-order-head">
          <div>
            <p class="eyebrow">Account</p>
            <h3>${customer.name}</h3>
            <p>${customer.email}</p>
            <p>${customer.phone || "No phone saved."}</p>
          </div>
          <strong>${money(total)}</strong>
        </div>
        <p class="admin-address">${customer.address || "No saved address."}</p>
        <div class="admin-order-items">
          <span>${orders.length} order${orders.length === 1 ? "" : "s"}</span>
          <span>Joined ${new Date(customer.createdAt).toLocaleDateString()}</span>
        </div>
      </article>
    `;
  }).join("");
}

function saveAdminOrder(id) {
  const card = document.querySelector(`[data-admin-order="${id}"]`);
  if (!card) return;
  const button = card.querySelector(`[data-save-order="${id}"]`);
  const note = card.querySelector(`[data-order-note="${id}"]`);
  const orders = readOrders().map((order) => {
    if (order.id !== id) return order;
    return {
      ...order,
      paymentStatus: card.querySelector('[data-order-field="paymentStatus"]').value,
      deliveryStatus: card.querySelector('[data-order-field="deliveryStatus"]').value
    };
  });
  writeOrders(orders);
  renderAdminStats();
  if (button) {
    button.textContent = "Saved";
    button.classList.add("saved");
  }
  if (note) {
    const savedOrder = orders.find((order) => order.id === id);
    note.textContent = `Order updated: ${savedOrder.paymentStatus}, ${savedOrder.deliveryStatus}.`;
  }
  setTimeout(() => {
    if (button) {
      button.textContent = "Update";
      button.classList.remove("saved");
    }
  }, 1400);
}

function activateAdminTab(tabName) {
  const target = document.querySelector(`[data-admin-panel="${tabName}"]`);
  if (!target) return;
  document.querySelectorAll("[data-admin-tab]").forEach((item) => {
    item.classList.toggle("active", item.dataset.adminTab === tabName);
  });
  document.querySelectorAll("[data-admin-nav-tab]").forEach((item) => {
    item.classList.toggle("active", item.dataset.adminNavTab === tabName);
  });
  document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.adminPanel === tabName);
  });
  if (window.location.hash !== `#${tabName}`) {
    window.history.replaceState(null, "", `#${tabName}`);
  }
}

function setupAdmin() {
  const login = document.querySelector("[data-admin-login]");
  const dashboard = document.querySelector("[data-admin-dashboard]");
  if (!login || !dashboard) return;
  const openDashboard = () => {
    login.hidden = true;
    dashboard.hidden = false;
    document.querySelector("[data-admin-logout]").hidden = false;
    renderAdminStats();
    renderAdminProducts();
    renderAdminOrders();
    renderAdminCustomers();
    const hashTab = window.location.hash.replace("#", "");
    activateAdminTab(["overview", "products", "orders", "customers"].includes(hashTab) ? hashTab : "overview");
  };

  if (sessionStorage.getItem(adminSessionKey)) openDashboard();

  document.querySelector("[data-admin-login-button]").addEventListener("click", () => {
    const email = document.querySelector("[data-admin-email]").value.trim();
    const password = document.querySelector("[data-admin-password]").value;
    const note = document.querySelector("[data-admin-login-note]");
    const loginResult = apiSync("POST", "/api/admin/login", { email, password });
    const fallbackOk = !backendEnabled && email === "admin@idukkispices.com" && password === "Idukki@2026";
    if (loginResult?.ok || fallbackOk) {
      sessionStorage.setItem(adminSessionKey, loginResult?.token || "file-mode-admin");
      openDashboard();
    } else {
      note.textContent = "Admin email or password is incorrect.";
    }
  });

  document.querySelector("[data-admin-logout]").addEventListener("click", () => {
    sessionStorage.removeItem(adminSessionKey);
    dashboard.hidden = true;
    login.hidden = false;
    document.querySelector("[data-admin-logout]").hidden = true;
    document.querySelector("[data-admin-password]").value = "";
    document.querySelector("[data-admin-login-note]").textContent = "Logged out.";
    window.history.replaceState(null, "", "admin.html");
  });

  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activateAdminTab(button.dataset.adminTab);
    });
  });

  document.querySelectorAll("[data-admin-nav-tab]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (dashboard.hidden) {
        document.querySelector("[data-admin-login-note]").textContent = "Log in first, then choose an admin section.";
        return;
      }
      activateAdminTab(link.dataset.adminNavTab);
    });
  });

  document.querySelector("[data-reset-products]").addEventListener("click", () => {
    saveProducts(baseProducts);
    renderAdminProducts();
    renderAdminStats();
  });

  document.querySelector("[data-clear-orders]").addEventListener("click", () => {
    writeOrders([]);
    renderAdminOrders();
    renderAdminStats();
  });
}

function orderIdFromUrl() {
  return new URLSearchParams(window.location.search).get("order");
}

function renderPaymentSuccess() {
  const node = document.querySelector("[data-payment-success]");
  if (!node) return;
  const orderId = orderIdFromUrl();
  const note = node.querySelector("[data-success-note]");
  const link = node.querySelector("[data-success-order-link]");
  if (!orderId) {
    note.textContent = "Order reference was not found.";
    return;
  }
  apiSync("POST", "/api/payments/confirm", { orderId });
  link.href = `order-detail.html?order=${encodeURIComponent(orderId)}`;
  note.textContent = `Order ${orderId} is marked as paid.`;
}

function renderOrderDetail() {
  const node = document.querySelector("[data-order-detail]");
  if (!node) return;
  const orderId = orderIdFromUrl();
  if (!orderId) {
    node.innerHTML = `<div class="empty-cart">Order reference was not found.</div>`;
    return;
  }
  const order = apiSync("GET", `/api/order-status?id=${encodeURIComponent(orderId)}`);
  if (!order) {
    node.innerHTML = `<div class="empty-cart">Order not found.</div>`;
    return;
  }
  node.innerHTML = `
    <div class="order-detail-card">
      <div class="admin-order-head">
        <div>
          <p class="eyebrow">${new Date(order.createdAt).toLocaleString()}</p>
          <h2>${order.id}</h2>
          <p>${order.customer.name} · ${order.customer.email}</p>
        </div>
        <strong>${money(order.total)}</strong>
      </div>
      <div class="status-grid">
        <article><span>Payment</span><strong>${order.paymentStatus}</strong></article>
        <article><span>Delivery</span><strong>${order.deliveryStatus}</strong></article>
      </div>
      <div class="admin-order-items">
        ${order.items.map((item) => `<span>${item.name} x ${item.qty}</span>`).join("")}
      </div>
      <div class="actions">
        <a class="button" href="account.html">Back to account</a>
        <a class="button light" href="shop.html">Shop again</a>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  updateCartCount();
  renderProducts({
    limit: document.body.dataset.page === "home" ? 3 : undefined,
    showCartControls: document.body.dataset.page !== "home"
  });
  renderCart();
  renderCheckout();
  setupShopFilters();
  setupProductModal();
  setupContactForm();
  setupCheckoutForm();
  setupPaymentPanel();
  setupFaq();
  setupMoodPicker();
  updateAccountLinks();
  setupCustomerAuth();
  renderAccountPage();
  renderPaymentSuccess();
  renderOrderDetail();
  setupAdmin();
});
