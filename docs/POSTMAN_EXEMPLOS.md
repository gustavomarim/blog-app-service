# Exemplos de Requisições no Postman - JWT Blog App

## 🚀 Setup Inicial

### 1. **Configurar Environment no Postman**

Crie um novo Environment com as seguintes variáveis:
- `base_url`: `http://localhost:3001`
- `jwt_token`: (deixe vazio, será preenchido automaticamente)

## 📝 Exemplos de Requisições

### 1. **Registro de Usuário**

```
POST {{base_url}}/users/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",
  "confirmPassword": "senha123"
}
```

**Resposta esperada:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "isAdmin": 0,
  "_id": "user_id_here",
  "__v": 0
}
```

### 2. **Login JWT (Obter Token)**

```
POST {{base_url}}/users/jwt-login
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Resposta esperada:**
```json
{
  "message": "Login bem-sucedido",
  "user": {
    "id": "user_id_here",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "isAdmin": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚡ Script para salvar token automaticamente:**
Na aba "Tests" da requisição, adicione:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("jwt_token", response.token);
    console.log("Token salvo:", response.token);
}
```

### 3. **Verificar Token JWT**

```
GET {{base_url}}/users/jwt-verify
Authorization: Bearer {{jwt_token}}
```

**Resposta esperada:**
```json
{
  "message": "Autenticação JWT bem-sucedida",
  "user": {
    "id": "user_id_here",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "isAdmin": 0
  }
}
```

### 4. **Perfil do Usuário (Rota Protegida)**

```
GET {{base_url}}/users/profile
Authorization: Bearer {{jwt_token}}
```

**Resposta esperada:**
```json
{
  "message": "Perfil do usuário autenticado via JWT",
  "user": {
    "id": "user_id_here",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "isAdmin": 0
  }
}
```

### 5. **Perfil Admin (Somente Admins)**

```
GET {{base_url}}/users/admin-profile
Authorization: Bearer {{jwt_token}}
```

**Resposta para usuário comum:**
```json
{
  "error": "Acesso negado: você precisa ser um administrador"
}
```

**Resposta para admin:**
```json
{
  "message": "Perfil do administrador autenticado via JWT",
  "user": {
    "id": "admin_id_here",
    "name": "Admin User",
    "email": "admin@exemplo.com",
    "isAdmin": 1
  }
}
```

### 6. **Categorias (Admin)**

```
GET {{base_url}}/admin/categories
Authorization: Bearer {{jwt_token}}
```

### 7. **Dashboard Admin**

```
GET {{base_url}}/admin/dashboard
Authorization: Bearer {{jwt_token}}
```

**Resposta esperada:**
```json
{
  "message": "Dashboard do administrador",
  "admin": {
    "id": "admin_id_here",
    "name": "Admin User",
    "email": "admin@exemplo.com"
  },
  "stats": {
    "message": "Dashboard carregado com sucesso"
  }
}
```

## 🍪 Testando com Cookies

### 1. **Login com Cookies**

```
POST {{base_url}}/users/jwt-login
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Configuração no Postman:**
- Vá em Settings → General → Cookies
- Ative "Capture cookies"
- Ative "Send cookies"

### 2. **Usar Rotas com Cookies**

Depois do login com cookies ativados, você pode acessar:
```
GET {{base_url}}/users/profile
(Sem Authorization header - usa cookie automaticamente)
```

## 🔧 Configurações Avançadas do Postman

### 1. **Headers Automáticos**

Para todas as requisições JWT, configure:
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

### 2. **Pre-request Script Global**

```javascript
// Verificar se o token existe antes de fazer requisições protegidas
if (pm.request.url.toString().includes('/profile') || 
    pm.request.url.toString().includes('/admin')) {
    
    const token = pm.environment.get("jwt_token");
    if (!token) {
        throw new Error("Token JWT não encontrado. Faça login primeiro.");
    }
}
```

### 3. **Test Script para Verificar Autenticação**

```javascript
pm.test("Status code é 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Resposta contém dados do usuário", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user');
    pm.expect(jsonData.user).to.have.property('id');
    pm.expect(jsonData.user).to.have.property('email');
});

pm.test("Token é válido", function () {
    pm.response.to.not.have.status(401);
});
```

## 🚨 Testando Cenários de Erro

### 1. **Requisição sem Token**

```
GET {{base_url}}/users/profile
(Sem Authorization header)
```

**Resposta esperada:**
```
Status: 401 Unauthorized
Body: Unauthorized
```

### 2. **Token Inválido**

```
GET {{base_url}}/users/profile
Authorization: Bearer token_invalido_aqui
```

**Resposta esperada:**
```
Status: 401 Unauthorized
Body: Unauthorized
```

### 3. **Acesso Negado para Admin**

```
GET {{base_url}}/users/admin-profile
Authorization: Bearer {{jwt_token_usuario_comum}}
```

**Resposta esperada:**
```json
{
  "error": "Acesso negado: você precisa ser um administrador"
}
```

## 📱 Collection do Postman

### Estrutura da Collection:

```
📁 Blog App JWT
├── 📁 Authentication
│   ├── POST Register User
│   ├── POST JWT Login
│   ├── GET JWT Verify
│   └── POST Regular Login
├── 📁 User Routes
│   ├── GET User Profile
│   └── GET Admin Profile
├── 📁 Admin Routes
│   ├── GET Categories
│   └── GET Dashboard
└── 📁 Error Testing
    ├── GET Profile (No Token)
    ├── GET Profile (Invalid Token)
    └── GET Admin (Regular User)
```

## 🎯 Dicas Importantes

1. **Sempre faça login primeiro** para obter o token
2. **Use o script automático** para salvar o token
3. **Configure cookies** se quiser testar sem headers
4. **Teste cenários de erro** para garantir segurança
5. **Verifique expiração** do token (1 hora por padrão)

## 🔄 Workflow Completo

1. **Registrar usuário** → `POST /users/register`
2. **Fazer login** → `POST /users/jwt-login` 
3. **Salvar token** → Script automático
4. **Testar rotas protegidas** → `GET /users/profile`
5. **Testar rotas admin** → `GET /admin/dashboard`

## 🌐 Exemplo com curl (Alternativa)

```bash
# 1. Login
curl -X POST http://localhost:3001/users/jwt-login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@exemplo.com", "password": "senha123"}' \
  -c cookies.txt

# 2. Usar token (substitua SEU_TOKEN)
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3001/users/profile

# 3. Usar cookies
curl -b cookies.txt http://localhost:3001/users/profile
```

---

**💡 Lembre-se:** O servidor precisa estar rodando com `npm run dev` para os testes funcionarem! 