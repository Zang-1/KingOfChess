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

  setTheme(theme) {
    this.current.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
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
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.checked = this.current.theme === 'light';
    }
    // Theme labels
    document.querySelectorAll('.theme-label').forEach(el => {
      const isDark = el.dataset.theme === 'dark';
      el.classList.toggle('active', isDark ? this.current.theme === 'dark' : this.current.theme === 'light');
    });

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
          <!-- Theme -->
          <div class="setting-item">
            <div class="setting-label">
              <span data-i18n="settings.theme">${I18N.t('settings.theme')}</span>
              <span data-i18n="settings.theme.desc">${I18N.t('settings.theme.desc')}</span>
            </div>
            <div class="lang-selector">
              <button class="lang-option theme-label ${this.current.theme === 'dark' ? 'active' : ''}" data-theme="dark" data-i18n="settings.theme.dark">${I18N.t('settings.theme.dark')}</button>
              <button class="lang-option theme-label ${this.current.theme === 'light' ? 'active' : ''}" data-theme="light" data-i18n="settings.theme.light">${I18N.t('settings.theme.light')}</button>
            </div>
          </div>

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

    // Theme buttons
    modal.querySelectorAll('.theme-label').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
      });
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
