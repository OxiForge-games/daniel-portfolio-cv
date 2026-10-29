/**
 * Daniel Cernicharo Toledo - CV & Portfolio Web
 * Animaciones avanzadas, interacción reactiva y conexión API
 * 100% libre de emoticonos (iconografía SVG profesional)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initCursorSpotlight();
  initHeroCanvas();
  initTypewriter();
  initScrollReveal();
  initCounters();
  init3DTilt();
  initMagneticButtons();
  loadProfileData();
  initContactForm();
  initEmailCopy();
  initScrollSpy();
  initGameModal();
  initDanibot();
});

/* ========================================================
   1. GESTIÓN DEL TEMA (DARK / LIGHT)
======================================================== */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = root.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
}

/* ========================================================
   2. MENÚ MÓVIL
======================================================== */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (!mobileBtn || !navLinks) return;

  mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

/* ========================================================
   3. CURSOR SPOTLIGHT REACTIVO (DESKTOP)
======================================================== */
function initCursorSpotlight() {
  const spotlight = document.getElementById('cursorSpotlight');
  if (!spotlight || window.innerWidth < 768) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function render() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    spotlight.style.left = `${currentX}px`;
    spotlight.style.top = `${currentY}px`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ========================================================
   4. CANVAS INTERACTIVO DE PARTÍCULAS EN HERO
======================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particleCount = Math.min(width > 768 ? 45 : 22, 60);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 1.6 + 0.8;
      this.baseAlpha = Math.random() * 0.4 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Interacción con mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Líneas de conexión
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ========================================================
   5. TYPEWRITER EFFECT (ROLES TÉCNICOS)
======================================================== */
function initTypewriter() {
  const el = document.getElementById('typewriterText');
  if (!el) return;

  const roles = [
    'Desarrollador Web & Multiplataforma',
    'Técnico en DAW & SMR (FP Oficial)',
    'Frontend con React.js & TypeScript',
    'Backend en Node.js, Java, PHP & SQL',
    'Apps Móviles en Flutter & Entornos Unity',
    'Especialización en IA & Ciberseguridad'
  ];

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let isDeleting = true;
  let typingSpeed = 70;

  function type() {
    const current = roles[roleIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 75;
    }

    if (!isDeleting && charIndex === current.length) {
      typingSpeed = 2200; // Pausa al completar
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // Pausa antes de empezar el siguiente
    }

    setTimeout(type, typingSpeed);
  }

  setTimeout(type, 1500);
}

/* ========================================================
   6. SCROLL REVEAL (ENTRADA CINEMATOGRÁFICA)
======================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.reveal-up, .reveal-scale, .reveal-left, .reveal-right, .reveal-stagger'
  );

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ========================================================
   7. CONTADORES NUMÉRICOS ANIMADOS
======================================================== */
function initCounters() {
  const counterElements = document.querySelectorAll('.quick-number');
  if (!counterElements.length) return;

  let started = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        counterElements.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10) || 0;
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1800;
          const start = 0;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // Función de suavizado easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const value = Math.floor(easeProgress * (target - start) + start);

            el.textContent = `${value}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = `${target}${suffix}`;
            }
          }

          requestAnimationFrame(updateCounter);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const parent = document.querySelector('.quick-highlights');
  if (parent) observer.observe(parent);
}

/* ========================================================
   8. 3D TILT EFFECT INTERACTIVO EN TARJETAS
======================================================== */
function init3DTilt() {
  if (window.innerWidth < 768) return;

  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* ========================================================
   9. EFECTO MAGNÉTICO EN BOTONES
======================================================== */
function initMagneticButtons() {
  if (window.innerWidth < 768) return;

  const buttons = document.querySelectorAll('.magnetic-btn');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

/* ========================================================
   10. ICONOS SVG PROFESIONALES (0% EMOTICONOS)
======================================================== */
function getSVGForProject(iconName) {
  const svgMap = {
    'globe': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    `,
    'smartphone': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
      </svg>
    `,
    'gamepad': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="6" y1="12" x2="10" y2="12"></line>
        <line x1="8" y1="10" x2="8" y2="14"></line>
        <line x1="15" y1="13" x2="15.01" y2="13"></line>
        <line x1="18" y1="11" x2="18.01" y2="11"></line>
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      </svg>
    `,
    'shield': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    `
  };

  return svgMap[iconName] || svgMap['globe'];
}

/* ========================================================
   11. CARGA DE DATOS DE PERFIL DESDE LA API
======================================================== */
const fallbackProfile = {
  skills: [
    { name: "JavaScript (ES6+)", category: "web", level: "Intermedio", badge: "Lenguaje Web" },
    { name: "TypeScript", category: "web", level: "Intermedio", badge: "Tipado Estático" },
    { name: "React.js", category: "web", level: "Intermedio", badge: "Frontend SPA" },
    { name: "HTML5 & CSS3", category: "web", level: "Intermedio", badge: "Maquetación & Flex/Grid" },
    { name: "Node.js & Express", category: "backend", level: "Intermedio", badge: "Backend & APIs" },
    { name: "Java", category: "backend", level: "Intermedio", badge: "POO & Servicios" },
    { name: "PHP", category: "backend", level: "Intermedio", badge: "Backend Web" },
    { name: "SQL (MySQL / MariaDB)", category: "backend", level: "Intermedio", badge: "Bases de Datos" },
    { name: "Flutter & Dart", category: "mobile", level: "Avanzado", badge: "Multiplataforma Móvil" },
    { name: "Android Studio", category: "mobile", level: "Intermedio", badge: "Entorno Móvil" },
    { name: "Unity & C#", category: "mobile", level: "Avanzado", badge: "Interactivos & 3D/2D" },
    { name: "Ciberseguridad Práctica", category: "security", level: "En Especialización", badge: "Defensa & Hardening" },
    { name: "Inteligencia Artificial Aplicada", category: "security", level: "En Especialización", badge: "IA & Automatización" },
    { name: "Redes & Infraestructura (SMR)", category: "security", level: "Intermedio", badge: "TCP/IP, Routers, Servidores" },
    { name: "Git & GitHub", category: "tools", level: "Bajo-Intermedio", badge: "Control de Versiones" }
  ],
  projects: [
    {
      title: "Black Messenger - Juego & Simulador OS",
      category: "mobile",
      description: "Videojuego interactivo de suspense y terror psicológico desarrollado en Flutter y Dart. Emula un smartphone completo (mensajería, notas, galería, llamadas, mapas e IA conversacional). Incluye compilación web ejecutable directamente desde el navegador.",
      tags: ["Flutter", "Dart", "Android Studio", "Simulador OS", "Game Design", "Demo Web"],
      icon: "gamepad",
      demoUrl: "/games/black-messenger/",
      featured: true
    },
    {
      title: "Portal de Gestión Web React & Node",
      category: "web",
      description: "Aplicación web orientada a la gestión de datos empresariales con autenticación JWT, frontend modular con React.js y API REST en Node.js conectada a base de datos relacional SQL.",
      tags: ["React.js", "Node.js", "Express", "SQL", "REST API"],
      icon: "globe"
    },
    {
      title: "App Multiplataforma con Flutter",
      category: "mobile",
      description: "Aplicación para dispositivos móviles diseñada en Flutter y Android Studio con arquitectura limpia, gestión reactiva de estado y consumo de servicios asíncronos.",
      tags: ["Flutter", "Dart", "Android Studio", "Mobile UI"],
      icon: "smartphone"
    },
    {
      title: "Experiencia Interactiva en Unity",
      category: "mobile",
      description: "Prototipo interactivo desarrollado sobre Unity utilizando scripting en C#, físicas en tiempo real, interfaz responsiva y optimización de recursos gráficos.",
      tags: ["Unity", "C#", "Interactive", "Game Engine"],
      icon: "gamepad"
    },
    {
      title: "Laboratorio de Infraestructura y Redes Seguras",
      category: "security",
      description: "Despliegue y configuración de red local virtualizada con segmentación de VLANs, cortafuegos perimetral, políticas de acceso y auditoría de servicios según la base técnica de SMR y Ciberseguridad.",
      tags: ["SMR", "Redes TCP/IP", "Ciberseguridad", "Linux/Windows Server"],
      icon: "shield"
    },
    {
      title: "Simulador Gamificado de Ciberdefensa & IA",
      category: "security",
      description: "Entorno práctico para análisis de vectores de ataque y detección de anomalías en redes corporativas, combinando modelos de asistencia por IA y endurecimiento de sistemas.",
      tags: ["IA Aplicada", "Ciberseguridad", "Hardening", "Automatización", "Entornos Gamificados"],
      icon: "shield"
    }
  ]
};

async function loadProfileData() {
  try {
    const response = await fetch('/api/profile');
    if (!response.ok) throw new Error('Error en /api/profile');
    const data = await response.json();
    renderSkills(data.skills || fallbackProfile.skills);
    renderProjects(data.projects || fallbackProfile.projects);
  } catch (err) {
    console.warn('Usando datos locales de respaldo:', err.message);
    renderSkills(fallbackProfile.skills);
    renderProjects(fallbackProfile.projects);
  }

  initSkillFilters();
  init3DTilt(); // Re-vincular tilt con nuevos elementos
}

/* ========================================================
   12. RENDERIZADO Y FILTRADO DE HABILIDADES
======================================================== */
function renderSkills(skills) {
  const container = document.getElementById('skillsContainer');
  if (!container) return;

  container.innerHTML = skills.map((skill, index) => `
    <div class="skill-card tilt-card" data-category="${skill.category}" style="--stagger-delay: ${index * 40}ms">
      <div class="skill-header">
        <h4 class="skill-name">${skill.name}</h4>
        <span class="skill-badge">${skill.badge}</span>
      </div>
      <div class="skill-meta">
        <span>Nivel:</span>
        <strong>${skill.level}</strong>
      </div>
    </div>
  `).join('');
}

function initSkillFilters() {
  const filterBtns = document.querySelectorAll('#skillFilters .filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const match = (filterValue === 'all' || category === filterValue || (filterValue === 'web' && category === 'tools'));

        if (match) {
          card.style.display = 'flex';
          card.style.animation = 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ========================================================
   13. RENDERIZADO DE PROYECTOS
======================================================== */
function renderProjects(projects) {
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  container.innerHTML = projects.map(proj => `
    <div class="project-card tilt-card ${proj.featured ? 'project-featured' : ''}">
      ${proj.featured ? '<div class="card-border-beam"></div>' : ''}
      <div class="project-card-body">
        <div class="project-header-top">
          <div class="project-icon">
            ${getSVGForProject(proj.icon)}
          </div>
          ${proj.featured 
            ? '<span class="badge badge-opentowork">Juego Destacado</span>' 
            : `<span class="project-type-pill">${proj.category === 'web' ? 'Web App' : proj.category === 'mobile' ? 'Móvil / 3D' : 'Sistemas'}</span>`
          }
        </div>
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.description}</p>
      </div>

      <div class="project-card-footer">
        <div class="project-tags">
          ${proj.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
        </div>
        <div class="project-demo-actions">
          ${proj.demoUrl ? `
            <button class="btn btn-primary btn-sm play-demo-btn magnetic-btn" data-demo="${proj.demoUrl}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Jugar Demo</span>
            </button>
            <a href="${proj.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm magnetic-btn" title="Pantalla Completa">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>Completa</span>
            </a>
          ` : `
            <span class="project-code-tag">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              <span>Arquitectura & Código</span>
            </span>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

/* ========================================================
   13.1. MODAL DE DEMOSTRACIÓN JUGABLE DE BLACK MESSENGER
======================================================== */
function initGameModal() {
  const modal = document.getElementById('gameModal');
  const closeBtn = document.getElementById('closeGameModal');
  const iframe = document.getElementById('gameIframe');

  if (!modal || !closeBtn || !iframe) return;

  document.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.play-demo-btn');
    if (playBtn) {
      const demoUrl = playBtn.getAttribute('data-demo') || '/games/black-messenger/';
      iframe.src = demoUrl;
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  });

  function closeModal() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    iframe.src = ''; // Detener juego y audio en segundo plano
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });
}

/* ========================================================
   14. COPIAR CORREO (CON FEEDBACK SVG)
======================================================== */
function initEmailCopy() {
  const copyBtn = document.getElementById('copyEmailBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.getAttribute('data-email') || 'contacto@danieldev.space';
    const badge = copyBtn.querySelector('.copy-badge');

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      if (badge) {
        const originalText = badge.textContent;
        badge.textContent = 'Copiado';
        badge.style.color = '#10b981';
        badge.style.borderColor = '#10b981';

        setTimeout(() => {
          badge.textContent = originalText;
          badge.style.color = '';
          badge.style.borderColor = '';
        }, 2200);
      }
    } catch (err) {
      console.error('Error al copiar correo:', err);
    }
  });
}

/* ========================================================
   15. FORMULARIO DE CONTACTO
======================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const feedback = document.getElementById('formFeedback');

  if (!form || !submitBtn || !feedback) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      role: document.getElementById('role').value,
      message: document.getElementById('message').value
    };

    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50" width="18" height="18" style="animation: spin 0.8s linear infinite;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="31.4 31.4"></circle>
      </svg>
      <span>Enviando...</span>
    `;

    feedback.className = 'form-feedback';
    feedback.textContent = '';
    feedback.style.display = 'none';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        feedback.className = 'form-feedback success';
        feedback.textContent = result.message || 'Mensaje enviado correctamente.';
        form.reset();
      } else {
        feedback.className = 'form-feedback error';
        feedback.textContent = result.message || 'Hubo un error al procesar tu solicitud.';
      }
    } catch (err) {
      feedback.className = 'form-feedback error';
      feedback.textContent = 'No se pudo conectar con el servidor. Por favor, escribe directamente a contacto@danieldev.space.';
      console.error('Error de red:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
      feedback.style.display = 'block';

      if (feedback.classList.contains('success')) {
        setTimeout(() => {
          feedback.style.display = 'none';
        }, 8000);
      }
    }
  });
}

/* ========================================================
   16. SCROLL SPY DE NAVEGACIÓN
======================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ========================================================
   17. ASISTENTE VIRTUAL IA DEL PORTFOLIO (DANIBOT)
======================================================== */
function initDanibot() {
  const widget = document.getElementById('danibotWidget');
  const toggleBtn = document.getElementById('danibotToggleBtn');
  const windowEl = document.getElementById('danibotWindow');
  const closeBtn = document.getElementById('danibotCloseBtn');
  const resetBtn = document.getElementById('danibotResetBtn');
  const form = document.getElementById('danibotForm');
  const input = document.getElementById('danibotInput');
  const sendBtn = document.getElementById('danibotSendBtn');
  const messagesEl = document.getElementById('danibotMessages');
  const suggestionsEl = document.getElementById('danibotSuggestions');
  const tooltipEl = document.getElementById('danibotTooltip');
  const closeTooltipBtn = document.getElementById('closeDanibotTooltip');

  if (!widget || !toggleBtn || !form || !input || !messagesEl) return;

  let chatHistory = [];
  let isWaiting = false;

  // Tooltip dismiss
  if (closeTooltipBtn && tooltipEl) {
    if (sessionStorage.getItem('danibot_tooltip_closed') === 'true') {
      tooltipEl.style.display = 'none';
    }
    closeTooltipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      tooltipEl.style.display = 'none';
      sessionStorage.setItem('danibot_tooltip_closed', 'true');
    });
  }

  // Toggle apertura / cierre
  function toggleChat(forceOpen) {
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !widget.classList.contains('is-open');
    if (shouldOpen) {
      widget.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      windowEl.setAttribute('aria-hidden', 'false');
      if (tooltipEl) tooltipEl.style.display = 'none';
      if (window.innerWidth > 640) {
        setTimeout(() => input.focus(), 150);
      }
      scrollToBottom();
    } else {
      widget.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      windowEl.setAttribute('aria-hidden', 'true');
    }
  }

  toggleBtn.addEventListener('click', () => toggleChat());
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleChat(false));
  }

  // Escuchar tecla Escape para cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widget.classList.contains('is-open')) {
      toggleChat(false);
    }
  });

  // Habilitar / deshabilitar botón enviar según texto
  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim() || isWaiting;
  });

  // Scroll al final
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Formato de hora
  function getTimeString() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Formateador Markdown seguro para las respuestas del bot
  function formatBotMarkdown(text) {
    if (!text) return '';
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    safe = safe.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    const lines = safe.split('\n');
    let inList = false;
    let formatted = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('* ') || line.startsWith('- ')) {
        if (!inList) {
          formatted += '<ul>';
          inList = true;
        }
        formatted += `<li>${line.substring(2)}</li>`;
      } else {
        if (inList) {
          formatted += '</ul>';
          inList = false;
        }
        if (line) {
          formatted += `<p>${line}</p>`;
        }
      }
    }
    if (inList) formatted += '</ul>';

    return formatted || safe;
  }

  // Añadir mensaje a la interfaz
  function appendMessage(sender, text, isHtml = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `danibot-msg danibot-msg-${sender}`;

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'danibot-msg-bubble';

    if (isHtml) {
      bubbleDiv.innerHTML = text;
    } else {
      bubbleDiv.textContent = text;
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = 'danibot-msg-time';
    timeSpan.textContent = getTimeString();

    msgDiv.appendChild(bubbleDiv);
    msgDiv.appendChild(timeSpan);
    messagesEl.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
  }

  // Indicador de escritura
  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'danibot-msg danibot-msg-bot danibot-typing-msg';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'danibot-msg-bubble danibot-typing-bubble';
    bubbleDiv.innerHTML = '<span class="danibot-dot"></span><span class="danibot-dot"></span><span class="danibot-dot"></span>';

    typingDiv.appendChild(bubbleDiv);
    messagesEl.appendChild(typingDiv);
    scrollToBottom();

    return {
      remove: () => {
        if (typingDiv && typingDiv.parentNode) {
          typingDiv.parentNode.removeChild(typingDiv);
        }
      }
    };
  }

  // Enviar mensaje al backend
  async function sendMessage(text) {
    if (!text || isWaiting) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    isWaiting = true;
    input.value = '';
    sendBtn.disabled = true;

    // 1. Mostrar mensaje del usuario
    appendMessage('user', trimmed);
    chatHistory.push({ sender: 'user', text: trimmed });

    // 2. Mostrar indicador de escritura
    const typing = showTyping();

    try {
      const response = await fetch('/api/chat-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: chatHistory
        })
      });

      typing.remove();

      if (!response.ok) {
        throw new Error(`Error en el servidor (${response.status})`);
      }

      const data = await response.json();
      const botReply = data.reply || 'Disculpa, no he podido procesar tu solicitud.';

      chatHistory.push({ sender: 'bot', text: botReply });
      appendMessage('bot', formatBotMarkdown(botReply), true);
    } catch (err) {
      typing.remove();
      console.error('Error enviando mensaje a DaniBot:', err);
      appendMessage(
        'bot',
        'No he podido conectar con el asistente en este momento. Por favor, escribe directamente a <a href="mailto:cernitoledodaniel@gmail.com">cernitoledodaniel@gmail.com</a>.',
        true
      );
    } finally {
      isWaiting = false;
      sendBtn.disabled = !input.value.trim();
      input.focus();
    }
  }

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });

  // Chips sugeridos
  if (suggestionsEl) {
    suggestionsEl.addEventListener('click', (e) => {
      const chip = e.target.closest('.danibot-chip');
      if (!chip) return;
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        toggleChat(true);
        sendMessage(prompt);
      }
    });
  }

  // Reiniciar conversación
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      chatHistory = [];
      messagesEl.innerHTML = `
        <div class="danibot-msg danibot-msg-bot">
          <div class="danibot-msg-bubble">
            ¡Conversación reiniciada! Soy <strong>DaniBot</strong>. ¿En qué te puedo ayudar respecto a los proyectos, habilidades o trayectoria de Daniel?
          </div>
          <span class="danibot-msg-time">${getTimeString()}</span>
        </div>
      `;
      input.value = '';
      sendBtn.disabled = true;
      input.focus();
    });
  }
}
