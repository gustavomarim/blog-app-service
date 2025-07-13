# Exemplo de Uso do JWT - Blog App Service

## Configuração Implementada

### 1. Função Extratora Customizada (seguindo a documentação)

```typescript
// Em src/services/JwtAuthService.ts
const cookieExtractor = function(req: any) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

// Extrator que verifica múltiplas fontes
const multiExtractor = function(req: any) {
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req) || 
         cookieExtractor(req);
};
```

### 2. Configuração da Estratégia JWT

```typescript
const options: StrategyOptionsWithSecret = {
  jwtFromRequest: multiExtractor,
  secretOrKey: process.env.JWT_SECRET || "secret",
  issuer: process.env.JWT_ISSUER || "blog-app",
  audience: process.env.JWT_AUDIENCE || "blog-app-users",
};
```

## Rotas Disponíveis

### 1. Gerar Token JWT (Login)
```
POST /users/jwt-login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "message": "Login bem-sucedido",
  "user": {
    "id": "user_id",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "isAdmin": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Verificar Token JWT
```
GET /users/jwt-verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ou com Cookie:**
```
GET /users/jwt-verify
Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Rotas Protegidas com JWT

#### Perfil do Usuário (seguindo a documentação)
```
GET /users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Perfil do Admin
```
GET /users/admin-profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Categorias (Admin)
```
GET /admin/categories
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Dashboard (Admin)
```
GET /admin/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Exemplo de Uso com JavaScript (Frontend)

### 1. Login e Obtenção do Token
```javascript
const login = async (email, password) => {
  const response = await fetch('/users/jwt-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // Para cookies
  });
  
  const data = await response.json();
  
  if (data.token) {
    // Salvar token no localStorage ou usar o cookie
    localStorage.setItem('token', data.token);
  }
  
  return data;
};
```

### 2. Usar Token em Requisições
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include' // Para cookies
  });
  
  return response.json();
};
```

### 3. Usando com Cookies (Automático)
```javascript
// O cookie é definido automaticamente após o login
// Não precisa incluir Authorization header
const getProfileWithCookie = async () => {
  const response = await fetch('/users/profile', {
    credentials: 'include' // Inclui cookies automaticamente
  });
  
  return response.json();
};
```

## Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
JWT_SECRET=seu-secret-super-seguro
JWT_ISSUER=blog-app
JWT_AUDIENCE=blog-app-users
FRONT_END_BASE_URL=http://localhost:5173
```

## Testando com curl

### Login:
```bash
curl -X POST http://localhost:3001/users/jwt-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exemplo.com", "password": "senha123"}' \
  -c cookies.txt
```

### Usar token:
```bash
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:3001/users/profile
```

### Usar cookie:
```bash
curl -b cookies.txt http://localhost:3001/users/profile
```

## Implementação Seguindo a Documentação

O código implementa exatamente os passos da documentação do passport-jwt:

1. ✅ **Função extratora customizada** para cookies
2. ✅ **Configuração da estratégia** com `passport.use(new JwtStrategy(opts, verify))`
3. ✅ **Autenticação de requisições** com `passport.authenticate('jwt', { session: false })`
4. ✅ **Inclusão do JWT** via Bearer token ou cookies
5. ✅ **Verificação de payload** com função de callback personalizada 