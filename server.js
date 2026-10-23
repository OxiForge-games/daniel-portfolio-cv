require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

// Fallback para SPA / Rutas no encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicio del servidor
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
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
