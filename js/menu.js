/* ============================================
   KING OF CHESS — Menu Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize systems
  I18N.init();
  Settings.init();
  Settings.loadSounds();
  Settings.buildSettingsModal();

  // Create floating chess pieces background
  createFloatingPieces();

  // --- DOM Elements ---
  const btnPvP = document.getElementById('btn-pvp');
  const btnPvC = document.getElementById('btn-pvc');
  const diffPanel = document.getElementById('difficulty-panel');
  const diffBtns = document.querySelectorAll('.difficulty-btn');
  const btnPlayAI = document.getElementById('btn-play-ai');
  const btnGuide = document.getElementById('btn-guide');
  const btnSettings = document.getElementById('btn-settings');

  let selectedDifficulty = 'medium';
  let pvcOpen = false;

  // --- PvP Button ---
  btnPvP.addEventListener('click', () => {
    // Navigate to game in PvP mode
    window.location.href = 'game.html?mode=pvp';
  });

  // --- PvC Button (toggle difficulty panel) ---
  btnPvC.addEventListener('click', () => {
    pvcOpen = !pvcOpen;
    if (pvcOpen) {
      diffPanel.classList.add('open');
      btnPvC.style.borderColor = 'var(--color-accent)';
    } else {
      diffPanel.classList.remove('open');
      btnPvC.style.borderColor = '';
    }
  });

  // --- Difficulty Selection ---
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDifficulty = btn.dataset.difficulty;
    });
  });

  // --- Play AI Button ---
  btnPlayAI.addEventListener('click', () => {
    window.location.href = `game.html?mode=pvc&difficulty=${selectedDifficulty}`;
  });

  // --- Guide Button ---
  btnGuide.addEventListener('click', () => {
    window.location.href = 'guide.html';
  });

  // --- Settings Button ---
  btnSettings.addEventListener('click', () => {
    Settings.openModal();
  });

  // --- Floating Pieces ---
  function createFloatingPieces() {
    const container = document.getElementById('floating-pieces');
    const pieces = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'floating-piece';
      el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.fontSize = `${1.5 + Math.random() * 2.5}rem`;
      el.style.setProperty('--duration', `${5 + Math.random() * 8}s`);
      el.style.setProperty('--delay', `${Math.random() * 5}s`);
      container.appendChild(el);
    }
  }

  // Keyboard shortcut: Enter to start game if difficulty panel is open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && pvcOpen) {
      btnPlayAI.click();
    }
  });
});
