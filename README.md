# MantiAC - Backend

API RESTful para el sistema de mantenimiento de aires acondicionados. Este backend está construido con **Node.js + Express + TypeScript**, utiliza **MongoDB** como base de datos y ofrece autenticación con **JWT**.

## 🧰 Tecnologías Principales

- 🟢 Node.js + Express 5
- 🔒 JWT (JSON Web Tokens)
- 🧪 TypeScript
- 📡 Axios
- 📋 Express Validator
- 🗄️ MongoDB + Mongoose
- 🧂 dotenv
- 🌐 CORS
- 📋 Morgan
- 🔐 Bcrypt para hashing
- 🧹 Nodemon + ts-node (dev)
- 🎨 Colors para logs

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz con:

```env
DATABASE_URL=mongodb://localhost:27017/mantiac
JWT_SECRET=tu_clave_secreta
BREVO_API_KEY=tu_clave_api_de_brevo
FRONTEND_URL=http://localhost:5173
```

## 📦 Instalación

```bash
git clone https://github.com/Diego3pz/MantiAC-Backend.git
cd MantiAC-Backend
npm install
```

## 🧪 Comandos Útiles

```bash
npm run dev        # Ejecuta el servidor en desarrollo con nodemon
npm run dev:api    # Ejecuta el servidor con parámetro adicional (--api)
npm run build      # Compila el código TypeScript
npm run start      # Ejecuta el código compilado (producción)
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── index.ts
├── .env
├── tsconfig.json
└── package.json
```

## ⚙️ Frontend

Encuentra el frontend en la siguiente liga:

```
https://github.com/Diego3pz/MantiAC-Frontend/
```

## 📄 Licencia

Diego Espinoza
