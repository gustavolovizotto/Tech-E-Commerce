async function loadPage(pageName) {
  const mainContent = document.getElementById("main-content");

  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error("Página não encontrada");

    const html = await response.text();
    mainContent.innerHTML = html;

    localStorage.setItem("currentPage", pageName);

    initPageEventListeners();

    if (pageName === "promo") {
      initializeFilters();
      const initialCount = document.querySelectorAll(".promo-card").length;
      updateProductCount(initialCount);
    }

    if (pageName === "account") {
      loadUserProfile();
    }

    if (pageName === "product") {
      initProductPage();
    }

    if (pageName === "cart") {
      initCartPage();
    }
  } catch (error) {
    console.error("Erro ao carregar página:", error);
    mainContent.innerHTML = "<p>Erro ao carregar o conteúdo.</p>";
  }
}

function initPageEventListeners() {
  document.querySelectorAll(".catalog-fav").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const img = btn.querySelector("img");
      const isFilled = img.getAttribute("data-filled") === "true";
      if (isFilled) {
        img.src = "images/coracao-header.svg";
        img.setAttribute("data-filled", "false");
      } else {
        img.src = "images/coracao1.svg";
        img.setAttribute("data-filled", "true");
      }
    });
  });

  document.querySelectorAll(".catalog-card").forEach((card) => {
    card.addEventListener("click", function () {
      loadPage("product");
    });
  });

  document.querySelectorAll(".promo-quantity").forEach((qtyControl) => {
    const minusBtn = qtyControl.querySelector(".qty-btn:first-child");
    const plusBtn = qtyControl.querySelector(".qty-btn:last-child");
    const qtyDisplay = qtyControl.querySelector("span");

    if (minusBtn && plusBtn && qtyDisplay) {
      minusBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        let currentQty = parseInt(qtyDisplay.textContent);
        if (currentQty > 1) {
          qtyDisplay.textContent = currentQty - 1;
        }
      });

      plusBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        let currentQty = parseInt(qtyDisplay.textContent);
        qtyDisplay.textContent = currentQty + 1;
      });
    }
  });

  document.querySelectorAll(".promo-buy-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const productCard = this.closest(".promo-card");
      const productData = getProductDataFromCatalog(productCard);
      addToCart(productData);
    });
  });

  document.querySelectorAll(".promo-card").forEach((card) => {
    card.addEventListener("click", function () {
      loadPage("product");
    });
  });

  const goToRegisterBtn = document.getElementById("go-to-register");
  const goToLoginBtn = document.getElementById("go-to-login");

  if (goToRegisterBtn) {
    goToRegisterBtn.addEventListener("click", function (e) {
      e.preventDefault();
      loadPage("register");
    });
  }

  if (goToLoginBtn) {
    goToLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      loadPage("login");
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileUpdate);
  }

  const passwordForm = document.getElementById("password-form");
  if (passwordForm) {
    passwordForm.addEventListener("submit", handlePasswordChange);
  }

  document.querySelectorAll(".account-nav-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      const sectionName = this.getAttribute("data-section");

      document
        .querySelectorAll(".account-nav-item")
        .forEach((i) => i.classList.remove("active"));
      document
        .querySelectorAll(".account-section")
        .forEach((s) => s.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(sectionName + "-section").classList.add("active");
    });
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (confirm("Deseja realmente sair?")) {
        localStorage.removeItem("currentUser");
        loadPage("home");
        alert("Logout realizado com sucesso!");
      }
    });
  }

  const clearBtn = document.querySelector(".filter-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      document
        .querySelectorAll('.filter-section input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });

      document.querySelectorAll(".filter-section select").forEach((select) => {
        select.selectedIndex = 0;
      });

      const searchInput = document.querySelector(".promo-search input");
      if (searchInput) {
        searchInput.value = "";
      }

      filterProducts();
    });
  }

  const searchInput = document.querySelector(".promo-search input");
  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  document
    .querySelectorAll('.filter-section input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", filterProducts);
    });

  const processorSelect = document.querySelector(".filter-section select");
  if (processorSelect) {
    processorSelect.addEventListener("change", filterProducts);
  }
}

const logoHome = document.getElementById("logo-home");
if (logoHome) {
  logoHome.addEventListener("click", () => loadPage("home"));
}

const promoLink = document.getElementById("promo-link");
if (promoLink) {
  promoLink.addEventListener("click", function (e) {
    e.preventDefault();
    loadPage("promo");
  });
}

const userIcon = document.getElementById("user-icon");
if (userIcon) {
  userIcon.addEventListener("click", function () {
    if (isLoggedIn()) {
      loadPage("account");
    } else {
      loadPage("login");
    }
  });
}

const cartIcon = document.querySelector(
  '.header-icons img[alt="Shopping cart icon"]'
);
if (cartIcon) {
  cartIcon.addEventListener("click", function () {
    loadPage("cart");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = localStorage.getItem("currentPage") || "home";
  loadPage(currentPage);
  updateCartIcon();
});

function isLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

function getCurrentUser() {
  const userData = localStorage.getItem("currentUser");
  return userData ? JSON.parse(userData) : null;
}

function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm").value;
  const acceptTerms = document.getElementById("accept-terms").checked;

  if (password.length < 6) {
    alert("A senha deve ter no mínimo 6 caracteres!");
    return;
  }

  if (password !== confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }

  if (!acceptTerms) {
    alert("Você precisa aceitar os termos de uso!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (users.find((u) => u.email === email)) {
    alert("Este e-mail já está cadastrado!");
    return;
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    phone: "",
    cpf: "",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

  alert("Cadastro realizado com sucesso!");
  loadPage("account");
}

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

    alert("Login realizado com sucesso!");
    loadPage("account");
  } else {
    alert("E-mail ou senha incorretos!");
  }
}

function loadUserProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profilePhone = document.getElementById("profile-phone");
  const profileCpf = document.getElementById("profile-cpf");

  if (profileName) profileName.value = user.name || "";
  if (profileEmail) profileEmail.value = user.email || "";
  if (profilePhone) profilePhone.value = user.phone || "";
  if (profileCpf) profileCpf.value = user.cpf || "";
}

function handleProfileUpdate(e) {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) return;

  user.name = document.getElementById("profile-name").value;
  user.email = document.getElementById("profile-email").value;
  user.phone = document.getElementById("profile-phone").value;
  user.cpf = document.getElementById("profile-cpf").value;

  localStorage.setItem("currentUser", JSON.stringify(user));

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const userIndex = users.findIndex((u) => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...user };
    localStorage.setItem("users", JSON.stringify(users));
  }

  alert("Perfil atualizado com sucesso!");
}

function handlePasswordChange(e) {
  e.preventDefault();

  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmNewPassword = document.getElementById(
    "confirm-new-password"
  ).value;

  if (newPassword.length < 6) {
    alert("A nova senha deve ter no mínimo 6 caracteres!");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    alert("As senhas não coincidem!");
    return;
  }

  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const fullUser = users.find((u) => u.id === user.id);

  if (fullUser && fullUser.password === currentPassword) {
    fullUser.password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("password-form").reset();
    alert("Senha alterada com sucesso!");
  } else {
    alert("Senha atual incorreta!");
  }
}

function filterProducts() {
  const searchValue = document
    .querySelector(".promo-search input")
    .value.toLowerCase();
  const products = document.querySelectorAll(".promo-card");

  const activeFilters = {
    portao: getCheckedValues("portao"),
    marca: getCheckedValues("marca"),
    tamanho: getCheckedValues("tamanho"),
    ram: getCheckedValues("ram"),
    processador: document.querySelector(".filter-section select")?.value || "",
  };

  let visibleCount = 0;

  products.forEach((product) => {
    let shouldShow = true;

    if (searchValue) {
      const productText = product.textContent.toLowerCase();
      if (!productText.includes(searchValue)) {
        shouldShow = false;
      }
    }

    if (activeFilters.portao.length > 0) {
      const productPortao = product.dataset.portao;
      if (!activeFilters.portao.includes(productPortao)) {
        shouldShow = false;
      }
    }

    if (activeFilters.marca.length > 0) {
      const productMarca = product.dataset.marca;
      if (!activeFilters.marca.includes(productMarca)) {
        shouldShow = false;
      }
    }

    if (activeFilters.tamanho.length > 0) {
      const productTamanho = product.dataset.tamanho;
      if (!activeFilters.tamanho.includes(productTamanho)) {
        shouldShow = false;
      }
    }

    if (activeFilters.ram.length > 0) {
      const productRam = product.dataset.ram;
      if (!activeFilters.ram.includes(productRam)) {
        shouldShow = false;
      }
    }

    if (activeFilters.processador && activeFilters.processador !== "") {
      const productProcessador = product.dataset.processador;
      if (productProcessador !== activeFilters.processador) {
        shouldShow = false;
      }
    }

    if (shouldShow) {
      product.style.display = "flex";
      visibleCount++;
    } else {
      product.style.display = "none";
    }
  });

  updateProductCount(visibleCount);

  const noResults = document.querySelector(".no-results");
  if (noResults) {
    if (visibleCount === 0) {
      noResults.style.display = "block";
    } else {
      noResults.style.display = "none";
    }
  }
}

function getCheckedValues(filterName) {
  const checkboxes = document.querySelectorAll(
    `.filter-section input[type="checkbox"][data-filter="${filterName}"]:checked`
  );
  return Array.from(checkboxes).map((cb) => cb.value);
}

function updateProductCount(count) {
  const titleElement = document.querySelector(".promo-title");
  if (titleElement) {
    titleElement.textContent = `Promoções (${count})`;
  }
}

function initializeFilters() {
  const filterSections = document.querySelectorAll(".filter-section");

  filterSections.forEach((section) => {
    const heading = section.querySelector("h3")?.textContent.toLowerCase();
    const checkboxes = section.querySelectorAll('input[type="checkbox"]');

    let filterType = "";
    if (heading === "portão") filterType = "portao";
    else if (heading === "marca") filterType = "marca";
    else if (heading === "tamanho") filterType = "tamanho";
    else if (heading === "ram") filterType = "ram";

    if (filterType) {
      checkboxes.forEach((checkbox) => {
        checkbox.setAttribute("data-filter", filterType);
        const label = checkbox.parentElement;
        const labelText = label.textContent.trim().toLowerCase();

        if (labelText.includes("apple")) checkbox.value = "apple";
        else if (labelText.includes("acer")) checkbox.value = "acer";
        else if (labelText.includes("microsoft")) checkbox.value = "microsoft";
        else if (labelText.includes("msi")) checkbox.value = "msi";
        else if (labelText.includes("lenovo")) checkbox.value = "lenovo";
        else if (labelText.includes("menor que 11"))
          checkbox.value = "menor-11";
        else if (labelText.includes("11-13")) checkbox.value = "11-13";
        else if (labelText.includes("13-14")) checkbox.value = "13-14";
        else if (labelText.includes("15-16")) checkbox.value = "15-16";
        else if (labelText.includes("16-17")) checkbox.value = "16-17";
        else if (labelText.includes("2gb")) checkbox.value = "2gb";
        else if (labelText.includes("4gb")) checkbox.value = "4gb";
        else if (labelText.includes("8gb")) checkbox.value = "8gb";
        else if (labelText.includes("16gb")) checkbox.value = "16gb";
        else if (labelText.includes("14.0 gb") || labelText.includes("14gb"))
          checkbox.value = "14gb";
      });
    }
  });
}

function initProductPage() {
  document.querySelectorAll(".thumbnail").forEach((thumb) => {
    thumb.addEventListener("click", function () {
      const imgSrc = this.querySelector("img").src;
      changeMainImage(imgSrc);
    });
  });

  const decreaseBtn = document.querySelector(
    '.qty-btn[onclick="decreaseQuantity()"]'
  );
  const increaseBtn = document.querySelector(
    '.qty-btn[onclick="increaseQuantity()"]'
  );

  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", decreaseQuantity);
  }

  if (increaseBtn) {
    increaseBtn.addEventListener("click", increaseQuantity);
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabName = this.getAttribute("onclick").match(/'([^']+)'/)[1];
      showTab(tabName);
    });
  });

  const buyBtn = document.querySelector(".purchase-buy-btn");
  if (buyBtn) {
    buyBtn.addEventListener("click", function () {
      const productData = getProductDataFromProductPage();
      addToCart(productData);
    });
  }
}

function changeMainImage(imageSrc) {
  const mainImg = document.getElementById("main-product-img");
  if (mainImg) {
    mainImg.src = imageSrc;
  }
}

function decreaseQuantity() {
  const quantitySpan = document.getElementById("quantity");
  if (quantitySpan) {
    let currentQty = parseInt(quantitySpan.textContent);
    if (currentQty > 1) {
      quantitySpan.textContent = currentQty - 1;
    }
  }
}

function increaseQuantity() {
  const quantitySpan = document.getElementById("quantity");
  if (quantitySpan) {
    let currentQty = parseInt(quantitySpan.textContent);
    quantitySpan.textContent = currentQty + 1;
  }
}

function showTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  const activeBtn = document.querySelector(
    `.tab-btn[onclick="showTab('${tabName}')"]`
  );
  const activeContent = document.getElementById(tabName);

  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  if (activeContent) {
    activeContent.classList.add("active");
  }
}

function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productData) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productData.id);

  if (existingItem) {
    existingItem.quantity += productData.quantity;
  } else {
    cart.push(productData);
  }

  saveCart(cart);
  updateCartIcon();
  showAddToCartNotification();
}

function removeFromCart(productId) {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== productId);
  saveCart(updatedCart);
  updateCartIcon();
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
  updateCartIcon();
}

function clearCart() {
  localStorage.removeItem("cart");
  updateCartIcon();
}

function getProductDataFromProductPage() {
  const productTitle =
    document.querySelector(".product-title")?.textContent || "Produto";
  const productBrand =
    document.querySelector(".product-brand")?.textContent || "";
  const productSpecs =
    document.querySelector(".product-specs")?.textContent || "";
  const productPrice =
    document.querySelector(".purchase-price")?.textContent || "R$ 0";
  const productImage =
    document.querySelector(".gallery-item.active img")?.src ||
    "images/promo/macbook.png";
  const quantity = parseInt(
    document.getElementById("quantity")?.textContent || "1"
  );

  return {
    id: `product-${Date.now()}`,
    name: productTitle,
    brand: productBrand,
    specs: productSpecs,
    price: productPrice,
    image: productImage,
    quantity: quantity,
  };
}

function getProductDataFromCatalog(cardElement) {
  const title =
    cardElement.querySelector(".promo-product-title")?.textContent || "Produto";
  const brand = cardElement.querySelector(".promo-brand")?.textContent || "";
  const specs = cardElement.querySelector(".promo-specs")?.textContent || "";
  const price =
    cardElement.querySelector(".promo-price")?.textContent || "R$ 0";
  const image =
    cardElement.querySelector(".promo-product-img")?.src ||
    "images/promo/macbook.png";
  const quantity = parseInt(
    cardElement.querySelector(".promo-quantity span")?.textContent || "1"
  );

  return {
    id: `catalog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: title,
    brand: brand,
    specs: specs,
    price: price,
    image: image,
    quantity: quantity,
  };
}

function showAddToCartNotification() {
  const notification = document.createElement("div");
  notification.className = "cart-notification";
  notification.innerHTML = `
    <div class="notification-content">
      <span>✅ Produto adicionado ao carrinho!</span>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function updateCartIcon() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  let badge = document.querySelector(".cart-badge");
  if (!badge) {
    const cartIcon = document.querySelector(
      '.header-icons img[alt="Shopping cart icon"]'
    );
    if (cartIcon) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      `;
      cartIcon.parentElement.style.position = "relative";
      cartIcon.parentElement.appendChild(badge);
    }
  }

  if (badge) {
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
}
function initCartPage() {
  loadCartItems();

  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const isMinus = this.classList.contains("minus");
      const qtyInput = this.parentElement.querySelector(".qty-input");
      const currentValue = parseInt(qtyInput.value);
      const productId = this.closest(".cart-item").dataset.productId;

      if (isMinus && currentValue > 1) {
        qtyInput.value = currentValue - 1;
        updateCartQuantity(productId, currentValue - 1);
      } else if (!isMinus) {
        qtyInput.value = currentValue + 1;
        updateCartQuantity(productId, currentValue + 1);
      }

      updateItemTotal(this.closest(".cart-item"));
    });
  });

  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", function () {
      if (this.value < 1) this.value = 1;
      const productId = this.closest(".cart-item").dataset.productId;
      updateCartQuantity(productId, parseInt(this.value));
      updateItemTotal(this.closest(".cart-item"));
    });
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const cartItem = this.closest(".cart-item");
      const productId = cartItem.dataset.productId;

      if (confirm("Deseja remover este item do carrinho?")) {
        removeFromCart(productId);
        cartItem.remove();
        updateCartSummary();
        checkEmptyCart();
      }
    });
  });

  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      alert("Redirecionando para o checkout...");
    });
  }

  const continueBtn = document.querySelector(".continue-shopping-btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      loadPage("home");
    });
  }

  updateCartSummary();
}

function loadCartItems() {
  const cart = getCart();
  const cartItemsContainer = document.querySelector(".cart-items");

  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    checkEmptyCart();
    return;
  }

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.dataset.productId = item.id;

    cartItem.innerHTML = `
      <div class="item-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="item-details">
        <h3 class="item-name">${item.name}</h3>
        <p class="item-specs">${item.specs}</p>
        <div class="item-price">
          <span class="current-price">${item.price}</span>
        </div>
      </div>
      <div class="item-quantity">
        <button class="qty-btn minus">-</button>
        <input type="number" value="${item.quantity}" min="1" class="qty-input" />
        <button class="qty-btn plus">+</button>
      </div>
      <div class="item-total">
        <span class="total-price">${item.price}</span>
      </div>
      <button class="remove-btn">
        <span>×</span>
      </button>
    `;

    cartItemsContainer.appendChild(cartItem);
  });
}

function updateItemTotal(cartItem) {
  const qtyInput = cartItem.querySelector(".qty-input");
  const currentPrice = cartItem.querySelector(".current-price");
  const totalPrice = cartItem.querySelector(".total-price");

  if (qtyInput && currentPrice && totalPrice) {
    const quantity = parseInt(qtyInput.value);
    const price = parseFloat(
      currentPrice.textContent.replace("R$ ", "").replace(".", "")
    );
    const total = quantity * price;

    totalPrice.textContent = `R$ ${total.toLocaleString("pt-BR")}`;
    updateCartSummary();
  }
}

function updateCartSummary() {
  const cart = getCart();
  let subtotal = 0;
  let itemCount = 0;

  cart.forEach((item) => {
    const quantity = item.quantity;
    const price = parseFloat(item.price.replace("R$ ", "").replace(".", ""));
    subtotal += quantity * price;
    itemCount += quantity;
  });

  const subtotalElement = document.querySelector(
    ".summary-row span:last-child"
  );
  if (subtotalElement) {
    subtotalElement.textContent = `R$ ${subtotal.toLocaleString("pt-BR")}`;
  }

  const discount = 1000;
  const total = Math.max(0, subtotal - discount);

  const totalElement = document.querySelector(
    ".summary-row.total span:last-child"
  );
  if (totalElement) {
    totalElement.textContent = `R$ ${total.toLocaleString("pt-BR")}`;
  }

  const itemCountElement = document.querySelector(
    ".summary-row span:first-child"
  );
  if (itemCountElement) {
    itemCountElement.textContent = `Subtotal (${itemCount} itens)`;
  }
}

function checkEmptyCart() {
  const cart = getCart();
  const cartContent = document.querySelector(".cart-content");
  const emptyCart = document.querySelector(".empty-cart");

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = "none";
    if (emptyCart) emptyCart.style.display = "block";
  } else {
    if (cartContent) cartContent.style.display = "grid";
    if (emptyCart) emptyCart.style.display = "none";
  }
}
