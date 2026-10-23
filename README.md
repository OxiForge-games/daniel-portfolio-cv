# 🌐 Portfolio & CV Web - Daniel Cernicharo Toledo

> **Desarrollador Web & Multiplataforma | DAW & SMR**  
> Albacete, España · Dominio objetivo: [`danieldev.space`](https://danieldev.space)

Landing page y currículum interactivo desarrollado con **Node.js**, **Express** y JavaScript moderno (ES6+), diseñado para presentar las titulaciones oficiales de **DAW**, **SMR** y la **Especialización en IA y Ciberseguridad**, junto con el stack tecnológico de desarrollo y proyectos prácticos.

---

## 🚀 Características Principales

1. **Arquitectura Ligera & Rápida:** Servidor Express que sirve una SPA moderna optimizada, con endpoints REST para el perfil y gestión de contactos.
2. **Stack Oficial Integrado:**
   - **Frontend & Web:** React.js, TypeScript, JavaScript (ES6+), HTML5, CSS3.
   - **Backend & Bases de Datos:** Node.js, Express, Java, PHP, SQL (MySQL/MariaDB).
   - **Multiplataforma & Móvil:** Flutter con Android Studio, Unity con C#.
   - **Infraestructura & Seguridad:** Redes TCP/IP, servidores Linux/Windows, hardening y ciberseguridad aplicada.
3. **Formación Académica Completa:**
   - ⚡ *Actualmente cursando:* **Inteligencia Artificial y Ciberseguridad aplicada mediante entornos gamificados** (420h) – Unitel Formación en colaboración con Grupo Tecon e Itecam.
   - 🎓 *Graduado Oficial:* **Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW)** – IES Amparo Sanz.
   - 🎓 *Graduado Oficial:* **Ciclo Formativo de Grado Medio en Sistemas Microinformáticos y Redes (SMR)** – IES Leonardo da Vinci.
4. **Filtros Dinámicos de Competencias:** Clasificación por categorías (*Web*, *Backend*, *Móvil*, *Sistemas & Ciberseguridad*).
5. **Modo Oscuro / Claro Persistente:** Selector de tema integrado con persistencia en `localStorage` y soporte para tema preferido del sistema operativo.
6. **Impresión Directa a PDF / CV ATS:** Botón de impresión con hoja de estilos `@media print` optimizada para exportar un currículum limpio, profesional y legible por sistemas ATS.
7. **Formulario de Contacto Funcional:** Conectado a la API `POST /api/contact` con validación y registro automático de mensajes en `data/messages.log`.
8. **Enlace Directo a LinkedIn:** Acceso directo a tu perfil profesional optimizado con el distintivo `#OpenToWork`.

---

## 📂 Estructura del Proyecto

```text
daniel-portfolio-cv/
├── data/
│   ├── profile.json       # Datos centralizados del perfil, educación, stack y proyectos
│   └── messages.log       # Registro automático de mensajes recibidos por el formulario
├── public/
│   ├── css/
│   │   └── style.css      # Estilos responsivos, temas dark/light y soporte para impresión ATS
│   ├── js/
│   │   └── main.js        # Lógica interactiva, fetch a la API, filtros, copiado y tema
│   └── index.html         # Estructura semántica de la landing page
├── .gitignore
├── package.json           # Configuración de dependencias y scripts
├── README.md              # Documentación y guía de despliegue
└── server.js              # Servidor Express y endpoints de la API REST
```

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### Pasos

1. Abre un terminal en la carpeta del proyecto:
   ```bash
   cd daniel-portfolio-cv
   ```

2. Instala las dependencias (si no lo has hecho aún):
   ```bash
   npm install
   ```

3. Inicia el servidor:
   ```bash
   npm start
   ```
   *(O para modo desarrollo con reinicio automático si tienes nodemon instalado: `npm run dev`)*

4. Abre tu navegador en:
   ```text
   http://localhost:3000
   ```

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servidor y tiempo de actividad (`uptime`) |
| `GET` | `/api/profile` | Retorna los datos estructurados en formato JSON |
| `POST` | `/api/contact` | Procesa y registra mensajes del formulario de contacto |

---

## 🌐 Guía de Despliegue en `danieldev.space`

### Opción 1: Servidor VPS / IONOS (Recomendado con PM2 y Nginx)

1. **Subir el código:** Clona el repositorio en tu servidor o sube los archivos mediante SCP/Git:
   ```bash
   git clone <tu-repositorio>
   cd daniel-portfolio-cv
   npm install --production
   ```

2. **Ejecutar con PM2 (Gestor de Procesos en Segundo Plano):**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "daniel-portfolio"
   pm2 startup
   pm2 save
   ```

3. **Configurar Nginx como Reverse Proxy:**
   En `/etc/nginx/sites-available/danieldev.space`:
   ```nginx
   server {
       server_name danieldev.space www.danieldev.space;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Certificado SSL Gratuito (HTTPS):**
   ```bash
   sudo certbot --nginx -d danieldev.space -d www.danieldev.space
   ```

---

## 📄 Exportar CV en PDF
Para obtener tu currículum físico o PDF:
1. Abre la web en el navegador.
2. Haz clic en el botón superior **"Imprimir CV"** (o presiona `Ctrl + P`).
3. Selecciona **"Guardar como PDF"**. El diseño se adaptará de forma automática en una plantilla limpia en blanco y negro sin barras ni elementos innecesarios.

---

© 2026 Daniel Cernicharo Toledo · Albacete, España.
