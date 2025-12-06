// ============================================================================
// NAVEGAÇÃO E CARREGAMENTO DE PÁGINAS
// ============================================================================

/**
 * Carrega dinamicamente uma página HTML no conteúdo principal da aplicação
 * @param {string} pageName - Nome da página a ser carregada (sem extensão .html)
 * @description Busca o arquivo HTML correspondente na pasta pages/, atualiza o conteúdo
 * principal, salva a página atual no localStorage e inicializa os event listeners
 * específicos da página carregada
 */
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

    if (pageName === "admin") {
      initAdminPage();
    }
  } catch (error) {
    console.error("Erro ao carregar página:", error);
    mainContent.innerHTML = "<p>Erro ao carregar o conteúdo.</p>";
  }
}

/**
 * Inicializa todos os event listeners para elementos comuns nas páginas
 * @description Configura listeners para favoritos, cards de produtos, botões de compra,
 * formulários de login/registro, navegação da conta, filtros e busca. Esta função é
 * chamada sempre que uma nova página é carregada para garantir que os eventos estejam
 * configurados corretamente
 */
function initPageEventListeners() {
  // Event listeners para botões de favorito nos cards do catálogo
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

  // Event listeners para cards do catálogo - redireciona para página de produto
  document.querySelectorAll(".catalog-card").forEach((card) => {
    card.addEventListener("click", function () {
      loadPage("product");
    });
  });

  // Event listeners para controles de quantidade na página de promoções
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

  // Event listeners para botões de compra na página de promoções
  document.querySelectorAll(".promo-buy-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const productCard = this.closest(".promo-card");
      const productData = getProductDataFromCatalog(productCard);
      addToCart(productData);
    });
  });

  // Event listeners para cards de promoção - redireciona para página de produto
  document.querySelectorAll(".promo-card").forEach((card) => {
    card.addEventListener("click", function () {
      loadPage("product");
    });
  });

  // Event listeners para navegação entre login e registro
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

  // Event listeners para formulários
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

  // Event listeners para navegação entre seções da conta
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

  // Event listener para botão de logout
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

  // Event listener para botão de limpar filtros
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

  // Event listeners para busca e filtros
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

// ============================================================================
// EVENT LISTENERS DO HEADER (Navegação Principal)
// ============================================================================

// Event listener para logo - redireciona para home
const logoHome = document.getElementById("logo-home");
if (logoHome) {
  logoHome.addEventListener("click", () => loadPage("home"));
}

// Event listener para link de promoções
const promoLink = document.getElementById("promo-link");
if (promoLink) {
  promoLink.addEventListener("click", function (e) {
    e.preventDefault();
    loadPage("promo");
  });
}

// Event listener para link de administração
const adminLink = document.getElementById("admin-link");
if (adminLink) {
  adminLink.addEventListener("click", function (e) {
    e.preventDefault();
    loadPage("admin");
  });
}

// Event listener para ícone de usuário - verifica se está logado
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

// Event listener para ícone do carrinho
const cartIcon = document.querySelector(
  '.header-icons img[alt="Shopping cart icon"]'
);
if (cartIcon) {
  cartIcon.addEventListener("click", function () {
    loadPage("cart");
  });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = localStorage.getItem("currentPage") || "home";
  loadPage(currentPage);
  updateCartIcon();
});

// ============================================================================
// AUTENTICAÇÃO E GERENCIAMENTO DE USUÁRIOS
// ============================================================================

/**
 * Verifica se existe um usuário logado no sistema
 * @returns {boolean} Retorna true se houver um usuário logado, false caso contrário
 */
function isLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

/**
 * Obtém os dados do usuário atualmente logado
 * @returns {Object|null} Retorna o objeto com os dados do usuário ou null se não houver usuário logado
 */
function getCurrentUser() {
  const userData = localStorage.getItem("currentUser");
  return userData ? JSON.parse(userData) : null;
}

/**
 * Processa o formulário de registro de novo usuário
 * @param {Event} e - Evento de submit do formulário
 * @description Valida os dados do formulário (senha mínima, confirmação de senha,
 * aceite de termos), verifica se o e-mail já está cadastrado, cria o novo usuário
 * e salva no localStorage. Após o registro, o usuário é automaticamente logado
 */
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

/**
 * Processa o formulário de login do usuário
 * @param {Event} e - Evento de submit do formulário
 * @description Valida as credenciais (e-mail e senha) contra os usuários armazenados
 * no localStorage. Se válido, salva o usuário na sessão atual e redireciona para a conta
 */
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

/**
 * Carrega os dados do perfil do usuário logado nos campos do formulário
 * @description Busca os dados do usuário atual e preenche os campos do formulário
 * de perfil (nome, e-mail, telefone, CPF) na página de conta
 */
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

/**
 * Processa a atualização dos dados do perfil do usuário
 * @param {Event} e - Evento de submit do formulário
 * @description Atualiza os dados do usuário (nome, e-mail, telefone, CPF) tanto
 * na sessão atual quanto na lista de usuários no localStorage
 */
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

/**
 * Processa a alteração de senha do usuário
 * @param {Event} e - Evento de submit do formulário
 * @description Valida a senha atual, verifica se a nova senha atende aos requisitos
 * (mínimo 6 caracteres) e se as senhas coincidem. Atualiza a senha no localStorage
 */
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

// ============================================================================
// FILTROS E BUSCA DE PRODUTOS
// ============================================================================

/**
 * Filtra os produtos exibidos na página de promoções baseado nos filtros ativos
 * @description Aplica filtros de busca por texto, portão, marca, tamanho, RAM e processador.
 * Mostra/oculta produtos conforme os critérios selecionados e atualiza o contador de produtos
 * visíveis. Exibe mensagem quando não há resultados
 */
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

    // Filtro por busca de texto
    if (searchValue) {
      const productText = product.textContent.toLowerCase();
      if (!productText.includes(searchValue)) {
        shouldShow = false;
      }
    }

    // Filtro por portão
    if (activeFilters.portao.length > 0) {
      const productPortao = product.dataset.portao;
      if (!activeFilters.portao.includes(productPortao)) {
        shouldShow = false;
      }
    }

    // Filtro por marca
    if (activeFilters.marca.length > 0) {
      const productMarca = product.dataset.marca;
      if (!activeFilters.marca.includes(productMarca)) {
        shouldShow = false;
      }
    }

    // Filtro por tamanho
    if (activeFilters.tamanho.length > 0) {
      const productTamanho = product.dataset.tamanho;
      if (!activeFilters.tamanho.includes(productTamanho)) {
        shouldShow = false;
      }
    }

    // Filtro por RAM
    if (activeFilters.ram.length > 0) {
      const productRam = product.dataset.ram;
      if (!activeFilters.ram.includes(productRam)) {
        shouldShow = false;
      }
    }

    // Filtro por processador
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

  // Mostra/oculta mensagem de "sem resultados"
  const noResults = document.querySelector(".no-results");
  if (noResults) {
    if (visibleCount === 0) {
      noResults.style.display = "block";
    } else {
      noResults.style.display = "none";
    }
  }
}

/**
 * Obtém os valores dos checkboxes marcados de um filtro específico
 * @param {string} filterName - Nome do filtro (portao, marca, tamanho, ram)
 * @returns {Array<string>} Array com os valores dos checkboxes marcados
 */
function getCheckedValues(filterName) {
  const checkboxes = document.querySelectorAll(
    `.filter-section input[type="checkbox"][data-filter="${filterName}"]:checked`
  );
  return Array.from(checkboxes).map((cb) => cb.value);
}

/**
 * Atualiza o contador de produtos visíveis no título da página de promoções
 * @param {number} count - Número de produtos visíveis após aplicar os filtros
 */
function updateProductCount(count) {
  const titleElement = document.querySelector(".promo-title");
  if (titleElement) {
    titleElement.textContent = `Promoções (${count})`;
  }
}

/**
 * Inicializa os filtros da página de promoções
 * @description Configura os atributos data-filter e valores dos checkboxes baseado
 * no texto dos labels. Mapeia marcas, tamanhos e capacidades de RAM para valores
 * padronizados usados nos filtros
 */
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

        // Mapeamento de valores para marcas
        if (labelText.includes("apple")) checkbox.value = "apple";
        else if (labelText.includes("acer")) checkbox.value = "acer";
        else if (labelText.includes("microsoft")) checkbox.value = "microsoft";
        else if (labelText.includes("msi")) checkbox.value = "msi";
        else if (labelText.includes("lenovo")) checkbox.value = "lenovo";
        // Mapeamento de valores para tamanhos
        else if (labelText.includes("menor que 11"))
          checkbox.value = "menor-11";
        else if (labelText.includes("11-13")) checkbox.value = "11-13";
        else if (labelText.includes("13-14")) checkbox.value = "13-14";
        else if (labelText.includes("15-16")) checkbox.value = "15-16";
        else if (labelText.includes("16-17")) checkbox.value = "16-17";
        // Mapeamento de valores para RAM
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

// ============================================================================
// PÁGINA DE PRODUTO
// ============================================================================

/**
 * Inicializa todos os event listeners da página de produto
 * @description Configura listeners para miniaturas de imagens, controles de quantidade,
 * abas de informações e botão de compra. Esta função é chamada quando a página de produto é carregada
 */
function initProductPage() {
  // Event listeners para miniaturas - troca a imagem principal
  document.querySelectorAll(".thumbnail").forEach((thumb) => {
    thumb.addEventListener("click", function () {
      const imgSrc = this.querySelector("img").src;
      changeMainImage(imgSrc);
    });
  });

  // Event listeners para controles de quantidade
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

  // Event listeners para abas de informações do produto
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabName = this.getAttribute("onclick").match(/'([^']+)'/)[1];
      showTab(tabName);
    });
  });

  // Event listener para botão de compra
  const buyBtn = document.querySelector(".purchase-buy-btn");
  if (buyBtn) {
    buyBtn.addEventListener("click", function () {
      const productData = getProductDataFromProductPage();
      addToCart(productData);
    });
  }
}

/**
 * Altera a imagem principal do produto exibida na galeria
 * @param {string} imageSrc - URL da nova imagem a ser exibida
 */
function changeMainImage(imageSrc) {
  const mainImg = document.getElementById("main-product-img");
  if (mainImg) {
    mainImg.src = imageSrc;
  }
}

/**
 * Diminui a quantidade do produto em 1 (mínimo 1)
 * @description Decrementa o valor da quantidade exibida, mas não permite valores menores que 1
 */
function decreaseQuantity() {
  const quantitySpan = document.getElementById("quantity");
  if (quantitySpan) {
    let currentQty = parseInt(quantitySpan.textContent);
    if (currentQty > 1) {
      quantitySpan.textContent = currentQty - 1;
    }
  }
}

/**
 * Aumenta a quantidade do produto em 1
 * @description Incrementa o valor da quantidade exibida
 */
function increaseQuantity() {
  const quantitySpan = document.getElementById("quantity");
  if (quantitySpan) {
    let currentQty = parseInt(quantitySpan.textContent);
    quantitySpan.textContent = currentQty + 1;
  }
}

/**
 * Mostra o conteúdo de uma aba específica e oculta as demais
 * @param {string} tabName - Nome da aba a ser exibida (id do elemento)
 * @description Remove a classe 'active' de todas as abas e botões, depois adiciona
 * a classe 'active' na aba e botão selecionados
 */
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

// ============================================================================
// GERENCIAMENTO DO CARRINHO DE COMPRAS
// ============================================================================

/**
 * Obtém o carrinho de compras do localStorage
 * @returns {Array} Array com os itens do carrinho ou array vazio se não houver carrinho
 */
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

/**
 * Salva o carrinho de compras no localStorage
 * @param {Array} cart - Array com os itens do carrinho a serem salvos
 */
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/**
 * Adiciona um produto ao carrinho de compras
 * @param {Object} productData - Objeto com os dados do produto (id, name, price, quantity, etc.)
 * @description Se o produto já existe no carrinho, incrementa a quantidade.
 * Caso contrário, adiciona um novo item. Atualiza o ícone do carrinho e exibe notificação
 */
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

/**
 * Remove um produto do carrinho de compras
 * @param {string} productId - ID do produto a ser removido
 * @description Remove o item do carrinho e atualiza o ícone do carrinho
 */
function removeFromCart(productId) {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== productId);
  saveCart(updatedCart);
  updateCartIcon();
}

/**
 * Atualiza a quantidade de um produto no carrinho
 * @param {string} productId - ID do produto
 * @param {number} quantity - Nova quantidade (se <= 0, remove o item)
 * @description Atualiza a quantidade do item. Se a quantidade for 0 ou menor, remove o item.
 * Atualiza o ícone do carrinho após a alteração
 */
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

/**
 * Limpa completamente o carrinho de compras
 * @description Remove todos os itens do carrinho do localStorage e atualiza o ícone
 */
function clearCart() {
  localStorage.removeItem("cart");
  updateCartIcon();
}

// ============================================================================
// EXTRAÇÃO DE DADOS DE PRODUTOS
// ============================================================================

/**
 * Extrai os dados do produto da página de detalhes do produto
 * @returns {Object} Objeto com os dados do produto (id, name, brand, specs, price, image, quantity)
 * @description Busca os dados do produto nos elementos HTML da página de produto
 * e retorna um objeto padronizado para adicionar ao carrinho
 */
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

/**
 * Extrai os dados do produto de um card do catálogo/promoções
 * @param {HTMLElement} cardElement - Elemento HTML do card do produto
 * @returns {Object} Objeto com os dados do produto (id, name, brand, specs, price, image, quantity)
 * @description Busca os dados do produto nos elementos HTML do card e retorna
 * um objeto padronizado para adicionar ao carrinho
 */
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

// ============================================================================
// NOTIFICAÇÕES E INTERFACE DO CARRINHO
// ============================================================================

/**
 * Exibe uma notificação visual quando um produto é adicionado ao carrinho
 * @description Cria um elemento de notificação que aparece no canto superior direito
 * da tela, desliza para dentro, permanece visível por 3 segundos e depois desliza para fora
 */
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

  // Anima a entrada da notificação
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Anima a saída da notificação após 3 segundos
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

/**
 * Atualiza o badge do ícone do carrinho no header
 * @description Calcula o total de itens no carrinho e atualiza o badge numérico.
 * Se não existir badge, cria um. Se não houver itens, oculta o badge
 */
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
// ============================================================================
// PÁGINA DO CARRINHO
// ============================================================================

/**
 * Inicializa todos os event listeners da página do carrinho
 * @description Carrega os itens do carrinho e configura listeners para controles
 * de quantidade, remoção de itens, botões de checkout e continuar comprando
 */
function initCartPage() {
  loadCartItems();

  // Event listeners para botões de aumentar/diminuir quantidade
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

  // Event listeners para input de quantidade (edição manual)
  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", function () {
      if (this.value < 1) this.value = 1;
      const productId = this.closest(".cart-item").dataset.productId;
      updateCartQuantity(productId, parseInt(this.value));
      updateItemTotal(this.closest(".cart-item"));
    });
  });

  // Event listeners para botões de remover item
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

  // Event listener para botão de checkout
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      alert("Redirecionando para o checkout...");
    });
  }

  // Event listener para botão de continuar comprando
  const continueBtn = document.querySelector(".continue-shopping-btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      loadPage("home");
    });
  }

  updateCartSummary();
}

/**
 * Carrega e renderiza os itens do carrinho na página
 * @description Busca os itens do localStorage, cria elementos HTML para cada item
 * e os adiciona ao container. Se o carrinho estiver vazio, exibe a mensagem apropriada
 */
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

/**
 * Atualiza o total de um item individual no carrinho
 * @param {HTMLElement} cartItem - Elemento HTML do item do carrinho
 * @description Calcula o total (preço × quantidade) do item e atualiza o elemento
 * de exibição. Também atualiza o resumo geral do carrinho
 */
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

/**
 * Atualiza o resumo do carrinho (subtotal, desconto e total)
 * @description Calcula o subtotal somando todos os itens, aplica desconto fixo
 * de R$ 1000 e atualiza os elementos de exibição com os valores formatados
 */
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

/**
 * Verifica se o carrinho está vazio e mostra/oculta elementos apropriados
 * @description Se o carrinho estiver vazio, oculta o conteúdo do carrinho e mostra
 * a mensagem de carrinho vazio. Caso contrário, mostra o conteúdo e oculta a mensagem
 */
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

// ============================================================================
// PÁGINA DE ADMINISTRAÇÃO
// ============================================================================

/**
 * Inicializa todos os event listeners da página de administração
 * @description Carrega a lista de usuários e configura listeners para o formulário
 * de cadastro, botões de limpar e excluir, e campo de busca
 */
function initAdminPage() {
  renderAdminList();

  const form = document.getElementById("admin-form");
  if (form) {
    form.addEventListener("submit", handleAdminRegister);
  }

  const clearBtn = document.getElementById("admin-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearAdminForm);
  }

  const deleteAllBtn = document.getElementById("admin-delete-all-btn");
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener("click", deleteAllAdminItems);
  }

  const searchInput = document.getElementById("admin-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => searchAdminItems(e.target.value));
  }
}

/**
 * Processa o cadastro de um novo usuário na página de administração
 * @param {Event} e - Evento de submit do formulário
 * @description Valida os campos, cria um novo usuário com data de cadastro,
 * salva no localStorage e atualiza a lista exibida
 */
function handleAdminRegister(e) {
  e.preventDefault();

  const nameInput = document.getElementById("admin-name");
  const emailInput = document.getElementById("admin-email");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  const newUser = {
    id: Date.now(),
    date: new Date().toLocaleString("pt-BR"),
    name: name,
    email: email,
  };

  const adminUsers = getAdminUsers();
  adminUsers.push(newUser);
  saveAdminUsers(adminUsers);

  renderAdminList();
  clearAdminForm();
  alert("Usuário cadastrado com sucesso!");
}

/**
 * Obtém a lista de usuários cadastrados no sistema de administração
 * @returns {Array} Array com os usuários cadastrados ou array vazio se não houver usuários
 */
function getAdminUsers() {
  const users = localStorage.getItem("adminUsers");
  return users ? JSON.parse(users) : [];
}

/**
 * Salva a lista de usuários no localStorage
 * @param {Array} users - Array com os usuários a serem salvos
 */
function saveAdminUsers(users) {
  localStorage.setItem("adminUsers", JSON.stringify(users));
}

/**
 * Renderiza a lista de usuários na página de administração
 * @param {Array|null} usersToRender - Array opcional de usuários a serem renderizados (para busca filtrada)
 * @description Cria elementos HTML para cada usuário e os adiciona à lista.
 * Se não houver usuários, exibe mensagem apropriada
 */
function renderAdminList(usersToRender = null) {
  const tbody = document.getElementById("admin-list-body");
  const noResults = document.getElementById("admin-no-results");
  
  if (!tbody) return;

  const users = usersToRender || getAdminUsers();
  tbody.innerHTML = "";

  if (users.length === 0) {
    if (noResults) noResults.style.display = "block";
    return;
  }

  if (noResults) noResults.style.display = "none";

  users.forEach((user) => {
    const li = document.createElement("li");
    li.className = "admin-list-item";
    li.innerHTML = `
      <div class="item-info">
        <span class="item-date"><strong>Data:</strong> ${user.date}</span>
        <span class="item-name"><strong>Nome:</strong> ${user.name}</span>
        <span class="item-email"><strong>E-mail:</strong> ${user.email}</span>
      </div>
      <button class="btn-icon" onclick="deleteAdminItem(${user.id})" title="Excluir">
        <img src="images/trash.svg" alt="Excluir" style="width: 20px; height: 20px;">
      </button>
    `;
    tbody.appendChild(li);
  });
}

/**
 * Remove um usuário específico da lista de administração
 * @param {number} id - ID do usuário a ser excluído
 * @description Solicita confirmação e remove o usuário do localStorage, depois atualiza a lista
 */
function deleteAdminItem(id) {
  if (confirm("Tem certeza que deseja excluir este usuário?")) {
    const users = getAdminUsers();
    const updatedUsers = users.filter((user) => user.id !== id);
    saveAdminUsers(updatedUsers);
    renderAdminList();
  }
}

/**
 * Remove todos os usuários cadastrados no sistema de administração
 * @description Solicita confirmação e remove todos os usuários do localStorage,
 * depois atualiza a lista exibida
 */
function deleteAllAdminItems() {
  if (confirm("Tem certeza que deseja excluir TODOS os usuários? Esta ação não pode ser desfeita.")) {
    localStorage.removeItem("adminUsers");
    renderAdminList();
    alert("Todos os usuários foram excluídos.");
  }
}

/**
 * Busca usuários na lista de administração por nome ou e-mail
 * @param {string} query - Texto de busca
 * @description Filtra os usuários cujo nome ou e-mail contenham o texto de busca
 * (case-insensitive) e renderiza apenas os resultados filtrados
 */
function searchAdminItems(query) {
  const users = getAdminUsers();
  const lowerQuery = query.toLowerCase();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
  );

  renderAdminList(filteredUsers);
}

/**
 * Limpa os campos do formulário de cadastro de administração
 * @description Reseta todos os campos do formulário para valores vazios
 */
function clearAdminForm() {
  const form = document.getElementById("admin-form");
  if (form) {
    form.reset();
  }
}
