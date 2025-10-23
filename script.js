// ====== SISTEMA DE CARREGAMENTO DE PÁGINAS ======

// Função para carregar uma página
async function loadPage(pageName) {
  const mainContent = document.getElementById('main-content');
  
  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error('Página não encontrada');
    
    const html = await response.text();
    mainContent.innerHTML = html;
    
    // Reinicializa event listeners após carregar a página
    initPageEventListeners();
    
    // Callbacks específicos por página
    if (pageName === 'promo') {
      initializeFilters();
      const initialCount = document.querySelectorAll('.promo-card').length;
      updateProductCount(initialCount);
    }
    
    if (pageName === 'account') {
      loadUserProfile();
    }
    
    if (pageName === 'product') {
      initProductPage();
    }
    
  } catch (error) {
    console.error('Erro ao carregar página:', error);
    mainContent.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
  }
}

// Inicializa event listeners que precisam ser recriados a cada carregamento
function initPageEventListeners() {
  // Favoritos no catálogo
  document.querySelectorAll('.catalog-fav').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Previne que o clique abra a página do produto
      const img = btn.querySelector('img');
      const isFilled = img.getAttribute('data-filled') === 'true';
      if (isFilled) {
        img.src = 'images/coracao-header.svg';
        img.setAttribute('data-filled', 'false');
      } else {
        img.src = 'images/coracao1.svg';
        img.setAttribute('data-filled', 'true');
      }
    });
  });

  // Clique nos cards do catálogo para abrir página de produto
  document.querySelectorAll('.catalog-card').forEach(card => {
    card.addEventListener('click', function() {
      loadPage('product');
    });
  });

  // Quantidade nos produtos da promoção
  document.querySelectorAll('.promo-quantity').forEach(qtyControl => {
    const minusBtn = qtyControl.querySelector('.qty-btn:first-child');
    const plusBtn = qtyControl.querySelector('.qty-btn:last-child');
    const qtyDisplay = qtyControl.querySelector('span');
    
    if (minusBtn && plusBtn && qtyDisplay) {
      minusBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Impede que o clique abra a página do produto
        let currentQty = parseInt(qtyDisplay.textContent);
        if (currentQty > 1) {
          qtyDisplay.textContent = currentQty - 1;
        }
      });
      
      plusBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Impede que o clique abra a página do produto
        let currentQty = parseInt(qtyDisplay.textContent);
        qtyDisplay.textContent = currentQty + 1;
      });
    }
  });

  // Botão "Comprar" nos produtos da promoção
  document.querySelectorAll('.promo-buy-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Impede que o clique abra a página do produto
      // Aqui você pode adicionar a lógica de adicionar ao carrinho
      alert('Produto adicionado ao carrinho!');
    });
  });

  // Clique nos cards da página de promoções para abrir página de produto
  document.querySelectorAll('.promo-card').forEach(card => {
    card.addEventListener('click', function() {
      loadPage('product');
    });
  });

  // Navegação Login <-> Cadastro
  const goToRegisterBtn = document.getElementById('go-to-register');
  const goToLoginBtn = document.getElementById('go-to-login');

  if (goToRegisterBtn) {
    goToRegisterBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadPage('register');
    });
  }

  if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadPage('login');
    });
  }

  // Formulário de Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Formulário de Cadastro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Formulário de Perfil
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }

  // Formulário de Senha
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordChange);
  }

  // Navegação entre seções da conta
  document.querySelectorAll('.account-nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const sectionName = this.getAttribute('data-section');
      
      // Remove active de todos
      document.querySelectorAll('.account-nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.account-section').forEach(s => s.classList.remove('active'));
      
      // Adiciona active no clicado
      this.classList.add('active');
      document.getElementById(sectionName + '-section').classList.add('active');
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('currentUser');
        loadPage('home');
        alert('Logout realizado com sucesso!');
      }
    });
  }

  // Limpar filtros
  const clearBtn = document.querySelector('.filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      document.querySelectorAll('.filter-section select').forEach(select => {
        select.selectedIndex = 0;
      });
      
      const searchInput = document.querySelector('.promo-search input');
      if (searchInput) {
        searchInput.value = '';
      }
      
      filterProducts();
    });
  }

  // Busca por texto
  const searchInput = document.querySelector('.promo-search input');
  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }
  
  // Checkboxes de filtro
  document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', filterProducts);
  });
  
  // Select de processador
  const processorSelect = document.querySelector('.filter-section select');
  if (processorSelect) {
    processorSelect.addEventListener('change', filterProducts);
  }
}

// Navegação do Header
const logoHome = document.getElementById('logo-home');
if (logoHome) {
  logoHome.addEventListener('click', () => loadPage('home'));
}

const promoLink = document.getElementById('promo-link');
if (promoLink) {
  promoLink.addEventListener('click', function(e) {
    e.preventDefault();
    loadPage('promo');
  });
}

// Ícone de usuário
const userIcon = document.getElementById('user-icon');
if (userIcon) {
  userIcon.addEventListener('click', function() {
    if (isLoggedIn()) {
      loadPage('account');
    } else {
      loadPage('login');
    }
  });
}

// Carrega a página inicial ao abrir o site
document.addEventListener('DOMContentLoaded', function() {
  loadPage('home');
});

// ====== FUNÇÕES DE AUTENTICAÇÃO ======

function isLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
}

function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm').value;
  const acceptTerms = document.getElementById('accept-terms').checked;
  
  if (password.length < 6) {
    alert('A senha deve ter no mínimo 6 caracteres!');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('As senhas não coincidem!');
    return;
  }
  
  if (!acceptTerms) {
    alert('Você precisa aceitar os termos de uso!');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    alert('Este e-mail já está cadastrado!');
    return;
  }
  
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    phone: '',
    cpf: '',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
  
  alert('Cadastro realizado com sucesso!');
  loadPage('account');
}

function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    alert('Login realizado com sucesso!');
    loadPage('account');
  } else {
    alert('E-mail ou senha incorretos!');
  }
}

function loadUserProfile() {
  const user = getCurrentUser();
  if (!user) return;
  
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profilePhone = document.getElementById('profile-phone');
  const profileCpf = document.getElementById('profile-cpf');
  
  if (profileName) profileName.value = user.name || '';
  if (profileEmail) profileEmail.value = user.email || '';
  if (profilePhone) profilePhone.value = user.phone || '';
  if (profileCpf) profileCpf.value = user.cpf || '';
}

function handleProfileUpdate(e) {
  e.preventDefault();
  
  const user = getCurrentUser();
  if (!user) return;
  
  user.name = document.getElementById('profile-name').value;
  user.email = document.getElementById('profile-email').value;
  user.phone = document.getElementById('profile-phone').value;
  user.cpf = document.getElementById('profile-cpf').value;
  
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...user };
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  alert('Perfil atualizado com sucesso!');
}

function handlePasswordChange(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmNewPassword = document.getElementById('confirm-new-password').value;
  
  if (newPassword.length < 6) {
    alert('A nova senha deve ter no mínimo 6 caracteres!');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    alert('As senhas não coincidem!');
    return;
  }
  
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const fullUser = users.find(u => u.id === user.id);
  
  if (fullUser && fullUser.password === currentPassword) {
    fullUser.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    
    document.getElementById('password-form').reset();
    alert('Senha alterada com sucesso!');
  } else {
    alert('Senha atual incorreta!');
  }
}

// ====== SISTEMA DE FILTROS ======

// Função principal de filtro
function filterProducts() {
  const searchValue = document.querySelector('.promo-search input').value.toLowerCase();
  const products = document.querySelectorAll('.promo-card');
  
  // Pega todos os filtros ativos
  const activeFilters = {
    portao: getCheckedValues('portao'),
    marca: getCheckedValues('marca'),
    tamanho: getCheckedValues('tamanho'),
    ram: getCheckedValues('ram'),
    processador: document.querySelector('.filter-section select')?.value || ''
  };
  
  let visibleCount = 0;
  
  products.forEach(product => {
    let shouldShow = true;
    
    // Filtro de busca por texto
    if (searchValue) {
      const productText = product.textContent.toLowerCase();
      if (!productText.includes(searchValue)) {
        shouldShow = false;
      }
    }
    
    // Filtro de Portão
    if (activeFilters.portao.length > 0) {
      const productPortao = product.dataset.portao;
      if (!activeFilters.portao.includes(productPortao)) {
        shouldShow = false;
      }
    }
    
    // Filtro de Marca
    if (activeFilters.marca.length > 0) {
      const productMarca = product.dataset.marca;
      if (!activeFilters.marca.includes(productMarca)) {
        shouldShow = false;
      }
    }
    
    // Filtro de Tamanho
    if (activeFilters.tamanho.length > 0) {
      const productTamanho = product.dataset.tamanho;
      if (!activeFilters.tamanho.includes(productTamanho)) {
        shouldShow = false;
      }
    }
    
    // Filtro de RAM
    if (activeFilters.ram.length > 0) {
      const productRam = product.dataset.ram;
      if (!activeFilters.ram.includes(productRam)) {
        shouldShow = false;
      }
    }
    
    // Filtro de Processador
    if (activeFilters.processador && activeFilters.processador !== '') {
      const productProcessador = product.dataset.processador;
      if (productProcessador !== activeFilters.processador) {
        shouldShow = false;
      }
    }
    
    // Mostra ou esconde o produto
    if (shouldShow) {
      product.style.display = 'flex';
      visibleCount++;
    } else {
      product.style.display = 'none';
    }
  });
  
  // Atualiza o contador de produtos
  updateProductCount(visibleCount);
  
  // Mostra/esconde mensagem de "nenhum resultado"
  const noResults = document.querySelector('.no-results');
  if (noResults) {
    if (visibleCount === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
    }
  }
}

// Função para pegar valores dos checkboxes marcados
function getCheckedValues(filterName) {
  const checkboxes = document.querySelectorAll(`.filter-section input[type="checkbox"][data-filter="${filterName}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

// Atualiza o contador de produtos exibidos
function updateProductCount(count) {
  const titleElement = document.querySelector('.promo-title');
  if (titleElement) {
    titleElement.textContent = `Promoções (${count})`;
  }
}

// Adiciona data-filter aos checkboxes (depois que a página carrega)
function initializeFilters() {
  // Encontra todas as seções de filtro
  const filterSections = document.querySelectorAll('.filter-section');
  
  filterSections.forEach(section => {
    const heading = section.querySelector('h3')?.textContent.toLowerCase();
    const checkboxes = section.querySelectorAll('input[type="checkbox"]');
    
    let filterType = '';
    if (heading === 'portão') filterType = 'portao';
    else if (heading === 'marca') filterType = 'marca';
    else if (heading === 'tamanho') filterType = 'tamanho';
    else if (heading === 'ram') filterType = 'ram';
    
    if (filterType) {
      checkboxes.forEach(checkbox => {
        checkbox.setAttribute('data-filter', filterType);
        // Pega o valor do label
        const label = checkbox.parentElement;
        const labelText = label.textContent.trim().toLowerCase();
        
        // Define o valor baseado no texto
        if (labelText.includes('apple')) checkbox.value = 'apple';
        else if (labelText.includes('acer')) checkbox.value = 'acer';
        else if (labelText.includes('microsoft')) checkbox.value = 'microsoft';
        else if (labelText.includes('msi')) checkbox.value = 'msi';
        else if (labelText.includes('lenovo')) checkbox.value = 'lenovo';
        else if (labelText.includes('menor que 11')) checkbox.value = 'menor-11';
        else if (labelText.includes('11-13')) checkbox.value = '11-13';
        else if (labelText.includes('13-14')) checkbox.value = '13-14';
        else if (labelText.includes('15-16')) checkbox.value = '15-16';
        else if (labelText.includes('16-17')) checkbox.value = '16-17';
        else if (labelText.includes('2gb')) checkbox.value = '2gb';
        else if (labelText.includes('4gb')) checkbox.value = '4gb';
        else if (labelText.includes('8gb')) checkbox.value = '8gb';
        else if (labelText.includes('16gb')) checkbox.value = '16gb';
        else if (labelText.includes('14.0 gb') || labelText.includes('14gb')) checkbox.value = '14gb';
      });
    }
  });
}

// ====== FUNÇÕES DA PÁGINA DE PRODUTO ======

// Inicializa a página de produto
function initProductPage() {
  // Event listeners para thumbnails
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.addEventListener('click', function() {
      const imgSrc = this.querySelector('img').src;
      changeMainImage(imgSrc);
    });
  });
  
  // Event listeners para botões de quantidade
  const decreaseBtn = document.querySelector('.qty-btn[onclick="decreaseQuantity()"]');
  const increaseBtn = document.querySelector('.qty-btn[onclick="increaseQuantity()"]');
  
  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', decreaseQuantity);
  }
  
  if (increaseBtn) {
    increaseBtn.addEventListener('click', increaseQuantity);
  }
  
  // Event listeners para abas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
      showTab(tabName);
    });
  });
}

// Muda a imagem principal
function changeMainImage(imageSrc) {
  const mainImg = document.getElementById('main-product-img');
  if (mainImg) {
    mainImg.src = imageSrc;
  }
}

// Diminui a quantidade
function decreaseQuantity() {
  const quantitySpan = document.getElementById('quantity');
  if (quantitySpan) {
    let currentQty = parseInt(quantitySpan.textContent);
    if (currentQty > 1) {
      quantitySpan.textContent = currentQty - 1;
    }
  }
}

// Aumenta a quantidade
function increaseQuantity() {
  const quantitySpan = document.getElementById('quantity');
  if (quantitySpan) {
    let currentQty = parseInt(quantitySpan.textContent);
    quantitySpan.textContent = currentQty + 1;
  }
}

// Mostra a aba selecionada
function showTab(tabName) {
  // Remove classe active de todas as abas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Adiciona classe active na aba selecionada
  const activeBtn = document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`);
  const activeContent = document.getElementById(tabName);
  
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  if (activeContent) {
    activeContent.classList.add('active');
  }
}
