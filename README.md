# Tech E-Commerce

E-commerce moderno de tecnologia desenvolvido com HTML, CSS e JavaScript puro.

## 📁 Estrutura do Projeto

```
Tech-E-Commerce/
├── index.html          # Arquivo principal (limpo e organizado)
├── styles.css          # Todos os estilos do projeto
├── script.js           # Lógica JavaScript principal
├── pages/              # Templates HTML das páginas
│   ├── home.html       # Página inicial com catálogo
│   ├── promo.html      # Página de promoções com filtros
│   ├── login.html      # Tela de login
│   ├── register.html   # Tela de cadastro
│   └── account.html    # Painel da conta do usuário
├── images/             # Todas as imagens
│   └── promo/          # Imagens específicas de promoções
│       ├── box.svg
│       └── macbook.png
└── README.md           # Este arquivo
```

## 🚀 Funcionalidades

### 🏠 Página Inicial
- Banner rotativo com promoções
- Catálogo de produtos
- Sistema de favoritos

### 🎯 Página de Promoções
- Grid de produtos com detalhes
- **Sistema de Filtros Completo:**
  - Busca por texto
  - Filtro por Portão (Apple, Acer, Microsoft, MSI, Lenovo)
  - Filtro por Marca
  - Filtro por Tamanho (11"-17")
  - Filtro por RAM (2GB-16GB)
  - Filtro por Processador (Intel/AMD)
  - Botão "Limpar" para resetar filtros
- Contador dinâmico de produtos
- Controle de quantidade (+/-)
- Botão de compra

### 🔐 Sistema de Autenticação
- **Login:** Autenticação com email e senha
- **Cadastro:** Criação de nova conta
- **Validações:**
  - Senha mínima de 6 caracteres
  - Confirmação de senha
  - Email único
  - Aceite de termos

### 👤 Painel do Usuário
- **Perfil:** Editar nome, email, telefone e CPF
- **Meus Pedidos:** Histórico de compras
- **Favoritos:** Produtos salvos
- **Endereços:** Gerenciar endereços de entrega
- **Segurança:** Alterar senha
- **Logout:** Sair da conta

## 💻 Como Funciona

### Sistema de Navegação
O projeto usa **carregamento dinâmico de páginas** sem recarregar o navegador:

1. O `index.html` contém apenas o header e um container `<main id="main-content">`
2. O JavaScript carrega os templates da pasta `pages/` via `fetch()`
3. As páginas são inseridas dinamicamente no container principal
4. Event listeners são reinicializados a cada carregamento

### Armazenamento de Dados
- **localStorage** para persistência de dados
- Armazena usuários cadastrados
- Mantém sessão do usuário logado
- Sem necessidade de backend

## 🎨 Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna e responsiva
- **JavaScript (ES6+)** - Lógica e interatividade
  - Async/Await para carregamento de páginas
  - Fetch API para carregar templates
  - LocalStorage API para persistência

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints para:
- Desktop (> 1200px)
- Tablet (968px - 1200px)
- Mobile (< 968px)

## 🔧 Como Executar

1. Clone o repositório
2. Abra o `index.html` em um navegador **OU**
3. Use um servidor local (recomendado):
   ```bash
   # Usando Python 3
   python -m http.server 8000
   
   # Ou usando Node.js (com http-server)
   npx http-server -p 8000
   ```
4. Acesse `http://localhost:8000`

> **Nota:** É recomendado usar um servidor local devido ao uso de `fetch()` para carregar os templates HTML.

## 📝 Características do Código

### Vantagens da Nova Estrutura
- ✅ **Código organizado** - Cada página em seu próprio arquivo
- ✅ **Fácil manutenção** - Alterações isoladas por página
- ✅ **Reutilizável** - Templates podem ser usados em diferentes contextos
- ✅ **SPA Experience** - Navegação sem recarregar a página
- ✅ **Sem dependências** - Apenas HTML, CSS e JS puro

### Padrões Utilizados
- **SPA (Single Page Application)** - Carregamento dinâmico
- **Modular** - Funções separadas por responsabilidade
- **Event Delegation** - Listeners reinicializados dinamicamente
- **Mobile-First** - Design responsivo

## 🎯 Próximas Melhorias

- [ ] Implementar carrinho de compras funcional
- [ ] Adicionar sistema de pagamento (simulado)
- [ ] Criar página de detalhes do produto
- [ ] Implementar sistema de reviews
- [ ] Adicionar paginação nos produtos
- [ ] Implementar recuperação de senha
- [ ] Adicionar animações de transição entre páginas

## 📄 Licença

Este projeto é livre para uso educacional e pessoal.

---

Desenvolvido com ❤️ usando apenas HTML, CSS e JavaScript puro
