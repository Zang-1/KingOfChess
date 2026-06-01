/* ============================================
   KING OF CHESS — Settings Manager
   ============================================ */

const Settings = {
  defaults: {
    theme: 'dark',
    boardColor: 'classic',
    soundEnabled: true,
    language: 'vi'
  },

  current: {},

  init() {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('chess-settings');
    if (saved) {
      try {
        this.current = { ...this.defaults, ...JSON.parse(saved) };
      } catch {
        this.current = { ...this.defaults };
      }
    } else {
      this.current = { ...this.defaults };
    }
    this.apply();
  },

  save() {
    localStorage.setItem('chess-settings', JSON.stringify(this.current));
  },

  apply() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', this.current.theme);

    // Apply board color
    document.documentElement.setAttribute('data-board', this.current.boardColor);

    // Apply language
    if (window.I18N) {
      I18N.setLanguage(this.current.language);
    }

    // Update settings UI elements if they exist
    this.updateSettingsUI();

    this.save();
  },

  setBoardColor(color) {
    this.current.boardColor = color;
    document.documentElement.setAttribute('data-board', color);
    this.updateSettingsUI();
    this.save();
  },

  setSound(enabled) {
    this.current.soundEnabled = enabled;
    this.updateSettingsUI();
    this.save();
  },

  setLanguage(lang) {
    this.current.language = lang;
    if (window.I18N) {
      I18N.setLanguage(lang);
    }
    this.updateSettingsUI();
    this.save();
  },

  updateSettingsUI() {
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.checked = this.current.soundEnabled;
    }

    // Board color options
    document.querySelectorAll('.color-option').forEach(el => {
      el.classList.toggle('active', el.dataset.board === this.current.boardColor);
    });

    // Language buttons
    document.querySelectorAll('.lang-option').forEach(el => {
      el.classList.toggle('active', el.dataset.lang === this.current.language);
    });
  },

  // Sound playback
  sounds: {},
  
  loadSounds() {
    const soundFiles = {
      move: 'sounds/move.mp3',
      capture: 'sounds/capture.mp3',
      check: 'sounds/check.mp3',
      checkmate: 'sounds/checkmate.mp3'
    };
    
    for (const [name, path] of Object.entries(soundFiles)) {
      this.sounds[name] = new Audio(path);
      this.sounds[name].preload = 'auto';
      this.sounds[name].volume = 0.5;
    }
  },

  playSound(name) {
    if (!this.current.soundEnabled) return;
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  },

  // Settings Modal
  openModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.add('active');
    }
  },

  closeModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  // Build settings modal HTML
  buildSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 data-i18n="settings.title">⚙️ ${I18N.t('settings.title')}</h2>
          <button class="modal-close" id="settings-close-btn">&times;</button>
        </div>
        <div class="settings-body">
          <!-- Board Colors -->
          <div class="setting-item">
            <div class="setting-label">
              <span data-i18n="settings.board">${I18N.t('settings.board')}</span>
              <span data-i18n="settings.board.desc">${I18N.t('settings.board.desc')}</span>
            </div>
            <div class="color-options">
              <div class="color-option ${this.current.boardColor === 'classic' ? 'active' : ''}" data-board="classic" title="Classic"></div>
              <div class="color-option ${this.current.boardColor === 'emerald' ? 'active' : ''}" data-board="emerald" title="Emerald"></div>
              <div class="color-option ${this.current.boardColor === 'ocean' ? 'active' : ''}" data-board="ocean" title="Ocean"></div>
              <div class="color-option ${this.current.boardColor === 'royal' ? 'active' : ''}" data-board="royal" title="Royal"></div>
              <div class="color-option ${this.current.boardColor === 'midnight' ? 'active' : ''}" data-board="midnight" title="Midnight"></div>
            </div>
          </div>

          <!-- Sound -->
          <div class="setting-item">
            <div class="setting-label">
              <span data-i18n="settings.sound">${I18N.t('settings.sound')}</span>
              <span data-i18n="settings.sound.desc">${I18N.t('settings.sound.desc')}</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="sound-toggle" ${this.current.soundEnabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Language -->
          <div class="setting-item">
            <div class="setting-label">
              <span data-i18n="settings.language">${I18N.t('settings.language')}</span>
              <span data-i18n="settings.language.desc">${I18N.t('settings.language.desc')}</span>
            </div>
            <div class="lang-selector">
              <button class="lang-option ${this.current.language === 'vi' ? 'active' : ''}" data-lang="vi">🇻🇳 VI</button>
              <button class="lang-option ${this.current.language === 'en' ? 'active' : ''}" data-lang="en">🇬🇧 EN</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('#settings-close-btn').addEventListener('click', () => this.closeModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Board color options
    modal.querySelectorAll('.color-option').forEach(opt => {
      opt.addEventListener('click', () => {
        this.setBoardColor(opt.dataset.board);
      });
    });

    // Sound toggle
    modal.querySelector('#sound-toggle').addEventListener('change', (e) => {
      this.setSound(e.target.checked);
    });

    // Language buttons
    modal.querySelectorAll('.lang-option[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLanguage(btn.dataset.lang);
      });
    });
  }
};

window.Settings = Settings;

// Add global floating pieces background
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('floating-pieces');
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  const piecesStr = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];
  const count = 90; // Mật độ cờ dày hơn
  const particles = [];
  
  let mouseX = -1000;
  let mouseY = -1000;
  
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'floating-piece-js';
    el.textContent = piecesStr[Math.floor(Math.random() * piecesStr.length)];
    el.style.fontSize = `${1.2 + Math.random() * 2}rem`;
    container.appendChild(el);
    
    particles.push(spawnParticle(el, true));
  }
  
  function spawnParticle(el, initial = false) {
    const p = {
      el: el,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0,
      driftX: (Math.random() - 0.5) * 0.8,
      driftY: (Math.random() - 0.5) * 0.8,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 1.5,
      maxLife: 5000 + Math.random() * 2000, // 5s to 7s
      age: initial ? Math.random() * 5000 : 0,
      opacity: 0,
      targetOpacity: 0.04 + Math.random() * 0.06,
      state: initial ? 'alive' : 'fading_in'
    };
    if (initial) p.opacity = p.targetOpacity;
    return p;
  }
  
  // Track mouse
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }, { passive: true });
  
  // Shockwave effect
  function createShockwave(x, y) {
    particles.forEach(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 350 && dist > 0) {
        // Push outward (shockwave force)
        const force = (350 - dist) / 350;
        p.vx += (dx / dist) * force * 40; // Push strength
        p.vy += (dy / dist) * force * 40;
      }
    });
  }
  
  document.addEventListener('mousedown', (e) => createShockwave(e.clientX, e.clientY));
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      createShockwave(mouseX, mouseY);
    }
  }, { passive: true });
  
  let lastTime = performance.now();
  
  function update() {
    const now = performance.now();
    const dt = now - lastTime;
    lastTime = now;
    
    // Safety check for massive delta times (e.g., tab switched)
    const timeScale = Math.min(dt / 16.66, 3);
    
    particles.forEach((p, i) => {
      p.age += dt;
      
      // Lifecycle
      if (p.state === 'fading_in') {
        p.opacity += dt * 0.0005; // Fade in speed
        if (p.opacity >= p.targetOpacity) {
          p.opacity = p.targetOpacity;
          p.state = 'alive';
        }
      } else if (p.state === 'alive') {
        if (p.age > p.maxLife) {
          p.state = 'fading_out';
        }
      } else if (p.state === 'fading_out') {
        p.opacity -= dt * 0.0005;
        if (p.opacity <= 0) {
          particles[i] = spawnParticle(p.el, false);
          return;
        }
      }
      
      // Fluid repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 180 && dist > 0) {
        const force = (180 - dist) / 180;
        p.vx += (dx / dist) * force * 1.5 * timeScale;
        p.vy += (dy / dist) * force * 1.5 * timeScale;
      }
      
      // Friction (Water-like damping)
      p.vx *= Math.pow(0.9, timeScale);
      p.vy *= Math.pow(0.9, timeScale);
      
      // Update position
      p.x += (p.driftX + p.vx) * timeScale;
      p.y += (p.driftY + p.vy) * timeScale;
      p.rot += p.rotV * timeScale;
      
      // Screen wrapping
      if (p.x < -100) p.x = window.innerWidth + 100;
      if (p.x > window.innerWidth + 100) p.x = -100;
      if (p.y < -100) p.y = window.innerHeight + 100;
      if (p.y > window.innerHeight + 100) p.y = -100;
      
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
      p.el.style.opacity = p.opacity;
    });
    
    requestAnimationFrame(update);
  }
  
  requestAnimationFrame(update);
});
