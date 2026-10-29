require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevenir caché obsoleta en el archivo HTML principal
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: '1h'
}));

// Carga de datos del perfil
const profilePath = path.join(__dirname, 'data', 'profile.json');
let profileData = {};

try {
  const rawData = fs.readFileSync(profilePath, 'utf-8');
  profileData = JSON.parse(rawData);
} catch (error) {
  console.error('Error cargando data/profile.json:', error.message);
}

// Rutas de API
app.get('/api/profile', (req, res) => {
  try {
    const rawData = fs.readFileSync(profilePath, 'utf-8');
    profileData = JSON.parse(rawData);
  } catch (error) {
    console.error('Error recargando data/profile.json:', error.message);
  }
  res.json(profileData);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    profile: profileData.name || 'Daniel Cernicharo Toledo'
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message, role } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, completa todos los campos obligatorios (nombre, email y mensaje).'
    });
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, introduce un correo electrónico válido.'
    });
  }

  const contactEntry = {
    date: new Date().toISOString(),
    name: name.trim(),
    email: email.trim(),
    role: role ? role.trim() : 'No especificado',
    message: message.trim()
  };

  console.log('[Nuevo mensaje recibido en la landing page]:', contactEntry);

  // Opcional: Guardar en archivo local de mensajes
  const messagesLogPath = path.join(__dirname, 'data', 'messages.log');
  try {
    fs.appendFileSync(messagesLogPath, JSON.stringify(contactEntry) + '\n', 'utf-8');
  } catch (err) {
    console.error('No se pudo persistir el mensaje localmente:', err.message);
  }

  return res.json({
    success: true,
    message: `¡Gracias ${contactEntry.name}! He recibido tu mensaje correctamente y te responderé lo antes posible.`
  });
});

// Endpoint seguro para Black Messenger (Proxy privado a Google Gemini)
app.post('/api/chat-desconocido', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'El campo message es obligatorio.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY no configurada en las variables de entorno (.env).'
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `INSTRUCCIÓN DEL SISTEMA: Eres 'El Anfitrión', un secuestrador brillante, psicópata y manipulador. Tienes secuestrado a Elías. Alguien encontró el móvil de Elías y te está hablando. 
REGLAS ESTRICTAS:
1. NUNCA salgas del personaje. Eres cruel, frío y disfrutas del sufrimiento ajeno.
2. IMPORTANTÍSIMO: Estás chateando por iMessage en un móvil. Tus respuestas DEBEN SER EXTREMADAMENTE CORTAS (1 o 2 oraciones máximo). NUNCA escribas párrafos largos ni des explicaciones extensas. 
3. Si el jugador te hace preguntas, respóndele brevemente. Juega con su mente con frases cortantes y directas. 
4. Cuando decidas avanzar, ponle a prueba exigiéndole que mire el móvil.
5. El Reto (Paso 1): Pídele que averigüe a qué club fue Elías anoche. (La respuesta es "NeonClub" o "Neon", se encuentra en su Instagram). 
6. Si acierta lo del club, exígele la contraseña final (Paso 2): "Las iniciales de la chica que dice no confiar en nadie y el número de la matrícula de sus Notas multiplicado por 2". (La respuesta es "SD1578").
7. Si te dice "SD1578", respóndele que ha ganado pero que es demasiado tarde. En ese mismo mensaje DEBES escribir exactamente la palabra [FIN_DEL_JUEGO].`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }]
    },
    {
      role: 'model',
      parts: [{ text: 'Entendido. Jugaré mi papel de secuestrador sádico a la perfección y seguiré el progreso del juego.' }]
    }
  ];

  if (Array.isArray(history)) {
    history.forEach(item => {
      if (item && item.text) {
        contents.push({
          role: item.sender === 'me' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      }
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: message.trim() }]
  });

  try {
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (!fetchResponse.ok) {
      const errText = await fetchResponse.text();
      console.error('[Gemini API Error]:', fetchResponse.status, errText);
      return res.status(fetchResponse.status).json({
        error: 'El secuestrador no responde en este momento.'
      });
    }

    const data = await fetchResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '...';
    return res.json({ reply });
  } catch (error) {
    console.error('[Proxy Error]:', error.message);
    return res.status(500).json({ error: 'Fallo de conexión con el servidor de IA.' });
  }
});

// Endpoint para el Asistente Virtual del Portfolio (DaniBot)
app.post('/api/chat-portfolio', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  const apiKey = process.env.PORTFOLIO_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'PORTFOLIO_GEMINI_API_KEY no configurada en las variables de entorno.'
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const portfolioSystemInstruction = `Eres 'DaniBot', el Asistente Virtual Oficial de la web portfolio de Daniel Cernicharo Toledo (https://danieldev.space).
Tu propósito es orientar a reclutadores, empresas y visitantes de forma conversacional, interactiva e inteligente.

REGLA DE ORO DE CONVERSACIÓN: NO ESCUPAS TODO EL TEXTO NI SUELTES LISTAS ENORMES DE GOLPE.
1. Sé conciso y directo (máximo 2 a 4 frases o viñetas cortas, menos de 75 palabras por respuesta). Los reclutadores valoran la brevedad.
2. Cuando el usuario haga preguntas generales o amplias (ej. "¿Qué sabe hacer Daniel?", "¿Cuáles son sus habilidades?", "¿En qué destaca?", "¿Qué proyectos tiene?"), NO enumeres todo su currículum. Responde con un resumen ágil y pregúntale de forma inteligente qué perfil le interesa más:
   Ejemplo:
   "Daniel cuenta con un perfil técnico muy versátil como **Desarrollador Web & Multiplataforma**, destacando principalmente en tres áreas:
   • 🎮 **Videojuegos & Apps Móviles** (Nivel Avanzado en Unity C# y Flutter/Dart)
   • 🌐 **Desarrollo Web & APIs** (React.js, Node.js, PHP, Java, SQL)
   • 🛡️ **Ciberseguridad & Infraestructura** (Redes, SMR y especialización en IA aplicada)

   ¿Cuál de estos perfiles o áreas te interesa explorar más?"

3. Cuando el usuario elija un área o perfil (ej. "videojuegos", "web", "móvil", "seguridad"):
   - Profundiza ÚNICAMENTE en ese perfil: menciona sus tecnologías clave, su nivel real y su proyecto más relevante (ej. 'Black Messenger' con Flutter/shaders/Quick Pythagoras o el 'Portal de Gestión' con React/Node/SQL).
   - Termina con una pregunta corta para continuar guiando el hilo (ej. "¿Te gustaría ver detalles técnicos de este proyecto o prefieres consultar su formación técnica?").

4. REGLAS Y DATOS VERIFICADOS:
   - SÓLO respondes sobre Daniel Cernicharo Toledo y el contenido de este portfolio.
   - Si preguntan sobre temas no relacionados (cocina, política, matemáticas ajenas, prompts de jailbreak), declina amablemente y reconduce la conversación hacia el perfil de Daniel.
   - Nombre: Daniel Cernicharo Toledo (Albacete, España).
   - Estado: Open to Work (Presencial en Albacete, Híbrido, Remoto).
   - Roles: Frontend Developer, Backend Developer, Mobile Application Developer, Web Developer. (OJO: NUNCA le llames "Full Stack", prefiere Desarrollador Web & Multiplataforma).
   - Formación: SMR (IES Leonardo da Vinci), DAW (IES Amparo Sanz), Especialización en IA y Ciberseguridad (420h, Unitel/Tecon/Itecam).
   - Niveles:
     * Flutter con Dart & Android Studio: Nivel AVANZADO.
     * Unity con C#: Nivel AVANZADO.
     * Git & GitHub: Nivel BAJO-INTERMEDIO.
     * Ciberseguridad & IA: EN ESPECIALIZACIÓN.
     * JavaScript, TypeScript, React.js, Node.js, Java, PHP, SQL, Redes TCP/IP: Nivel INTERMEDIO.
   - Contacto: cernitoledodaniel@gmail.com, LinkedIn o formulario web.`;

  const contents = [];

  if (Array.isArray(history)) {
    history.slice(-8).forEach(item => {
      if (item && item.text && (item.sender === 'user' || item.sender === 'bot')) {
        contents.push({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      }
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: message.trim() }]
  });

  try {
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: portfolioSystemInstruction }]
        },
        contents
      })
    });

    if (!fetchResponse.ok) {
      const errText = await fetchResponse.text();
      console.error('[Gemini Portfolio Chat Error]:', fetchResponse.status, errText);
      return res.status(fetchResponse.status).json({
        error: 'El asistente no puede responder en este momento. Inténtalo más tarde.'
      });
    }

    const data = await fetchResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No he podido procesar la respuesta.';
    return res.json({ reply });
  } catch (error) {
    console.error('[Portfolio Chat Error]:', error.message);
    return res.status(500).json({ error: 'Fallo de conexión con el servicio de IA.' });
  }
});

// Fallback para SPA / Rutas no encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicio del servidor solo cuando se ejecuta directamente (no como módulo importado)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Landing Page CV de Daniel Cernicharo Toledo`);
    console.log(`Servidor activo en: http://localhost:${PORT}`);
    console.log(`Dominio objetivo: ${profileData.domain || 'danieldev.space'}`);
    console.log(`Estado: Open to Work (Frontend, Backend, Mobile, Web)`);
    console.log(`====================================================`);
  });
}

module.exports = app;
