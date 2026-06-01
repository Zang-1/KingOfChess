/* ============================================
   KING OF CHESS — Chess Game UI
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize systems
  I18N.init();
  Settings.init();
  Settings.loadSounds();
  Settings.buildSettingsModal();

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const gameMode = params.get('mode') || 'pvp'; // 'pvp' or 'pvc'
  const aiDifficulty = params.get('difficulty') || 'medium';

  // Initialize Chess Engine
  const engine = new ChessEngine();
  let ai = null;

  if (gameMode === 'pvc') {
    ai = new ChessAI(engine, aiDifficulty);
    // Update player name for AI
    const blackName = document.getElementById('player-black-name');
    blackName.textContent = I18N.t('game.ai') + ` (${I18N.t('menu.' + aiDifficulty)})`;
    blackName.removeAttribute('data-i18n');
  }

  // --- State ---
  let selectedSquare = null; // {row, col}
  let validMoves = [];       // [{row, col, special}]
  let isDragging = false;
  let dragPiece = null;
  let dragFrom = null;
  let promotionPending = null; // {fromRow, fromCol, toRow, toCol}
  let gameOver = false;
  let aiThinking = false;

  // --- DOM Elements ---
  const boardEl = document.getElementById('chess-board');
  const moveListEl = document.getElementById('move-list');
  const statusBar = document.getElementById('status-bar');
  const aiThinkingEl = document.getElementById('ai-thinking');
  const gameOverOverlay = document.getElementById('game-over-overlay');
  const gameOverIcon = document.getElementById('game-over-icon');
  const gameOverTitle = document.getElementById('game-over-title');
  const gameOverSubtitle = document.getElementById('game-over-subtitle');

  // Piece Unicode mapping
  const PIECE_UNICODE = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  };

  const FILE_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // --- Render Board ---
  function renderBoard() {
    boardEl.innerHTML = '';
    const lastMove = engine.getLastMove();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = document.createElement('div');
        const isLight = (row + col) % 2 === 0;
        sq.className = `square ${isLight ? 'light-sq' : 'dark-sq'}`;
        sq.dataset.row = row;
        sq.dataset.col = col;

        // Last move highlight
        if (lastMove) {
          if ((row === lastMove.fromRow && col === lastMove.fromCol) ||
              (row === lastMove.toRow && col === lastMove.toCol)) {
            sq.classList.add('last-move');
          }
        }

        // Selected square highlight
        if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
          sq.classList.add('selected');
        }

        // Valid move indicators
        const validMove = validMoves.find(m => m.row === row && m.col === col);
        if (validMove) {
          const targetPiece = engine.getPieceAt(row, col);
          if (targetPiece || (validMove.special === 'enPassant')) {
            sq.classList.add('valid-capture');
          } else {
            sq.classList.add('valid-move');
          }
        }

        // Check highlight on king
        const piece = engine.getPieceAt(row, col);
        if (piece && piece.type === 'king') {
          if (engine.isInCheck(piece.color) && engine.gameStatus === 'playing') {
            sq.classList.add('in-check');
          }
        }

        // Board coordinates
        if (row === 7) {
          const coordFile = document.createElement('span');
          coordFile.className = 'coord-file';
          coordFile.textContent = FILE_LETTERS[col];
          sq.appendChild(coordFile);
        }
        if (col === 0) {
          const coordRank = document.createElement('span');
          coordRank.className = 'coord-rank';
          coordRank.textContent = 8 - row;
          sq.appendChild(coordRank);
        }

        // Piece
        if (piece) {
          const pieceEl = document.createElement('span');
          pieceEl.className = `piece ${piece.color}-piece`;
          pieceEl.textContent = PIECE_UNICODE[piece.color][piece.type];
          pieceEl.dataset.row = row;
          pieceEl.dataset.col = col;

          // Drag events
          pieceEl.addEventListener('mousedown', onPieceMouseDown);
          pieceEl.addEventListener('touchstart', onPieceTouchStart, { passive: false });

          sq.appendChild(pieceEl);
        }

        // Click event on square
        sq.addEventListener('click', () => onSquareClick(row, col));

        boardEl.appendChild(sq);
      }
    }
  }

  // --- Square Click Handler ---
  function onSquareClick(row, col) {
    if (gameOver || aiThinking) return;
    if (promotionPending) return;

    // If AI's turn in PvC mode, ignore
    if (gameMode === 'pvc' && engine.currentTurn === 'black') return;

    const piece = engine.getPieceAt(row, col);

    // If a piece is selected and clicking a valid move
    if (selectedSquare) {
      const validMove = validMoves.find(m => m.row === row && m.col === col);

      if (validMove) {
        // Check for promotion
        const movingPiece = engine.getPieceAt(selectedSquare.row, selectedSquare.col);
        if (movingPiece && movingPiece.type === 'pawn') {
          const isPromotion = (movingPiece.color === 'white' && row === 0) ||
                              (movingPiece.color === 'black' && row === 7);
          if (isPromotion) {
            showPromotionModal(selectedSquare.row, selectedSquare.col, row, col, movingPiece.color);
            return;
          }
        }

        executeMove(selectedSquare.row, selectedSquare.col, row, col);
        return;
      }

      // Clicking own piece - reselect
      if (piece && piece.color === engine.currentTurn) {
        selectPiece(row, col);
        return;
      }

      // Clicking elsewhere - deselect
      clearSelection();
      renderBoard();
      return;
    }

    // No selection - select own piece
    if (piece && piece.color === engine.currentTurn) {
      selectPiece(row, col);
    }
  }

  // --- Select Piece ---
  function selectPiece(row, col) {
    selectedSquare = { row, col };
    validMoves = engine.getValidMoves(row, col);
    renderBoard();
  }

  // --- Clear Selection ---
  function clearSelection() {
    selectedSquare = null;
    validMoves = [];
  }

  // --- Execute Move ---
  function executeMove(fromRow, fromCol, toRow, toCol, promotionPiece) {
    const move = engine.makeMove(fromRow, fromCol, toRow, toCol, promotionPiece);

    if (!move) return;

    clearSelection();

    // Play sound
    if (move.isCheckmate) {
      Settings.playSound('checkmate');
    } else if (move.isCheck) {
      Settings.playSound('check');
    } else if (move.captured) {
      Settings.playSound('capture');
    } else {
      Settings.playSound('move');
    }

    renderBoard();
    updateMoveHistory();
    updateStatus();
    updatePlayerCards();
    updateCapturedPieces();

    // Check game end
    if (engine.gameStatus !== 'playing') {
      endGame();
      return;
    }

    // AI move
    if (gameMode === 'pvc' && engine.currentTurn === 'black' && !gameOver) {
      scheduleAIMove();
    }
  }

  // --- AI Move ---
  function scheduleAIMove() {
    aiThinking = true;
    aiThinkingEl.classList.add('active');

    // Small delay to allow UI update
    setTimeout(() => {
      const bestMove = ai.getBestMove();

      if (bestMove) {
        // Check promotion
        const movingPiece = engine.getPieceAt(bestMove.fromRow, bestMove.fromCol);
        const promoPiece = bestMove.promotionPiece || null;
        executeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol, promoPiece);
      }

      aiThinking = false;
      aiThinkingEl.classList.remove('active');
    }, 300);
  }

  // --- Promotion Modal ---
  function showPromotionModal(fromRow, fromCol, toRow, toCol, color) {
    promotionPending = { fromRow, fromCol, toRow, toCol };

    const pieces = ['queen', 'rook', 'bishop', 'knight'];
    const modal = document.createElement('div');
    modal.className = 'promotion-modal';
    modal.id = 'promotion-modal';

    // Position the modal near the promotion square
    const boardRect = boardEl.getBoundingClientRect();
    const sqSize = boardRect.width / 8;
    const left = boardRect.left + toCol * sqSize;
    let top;

    if (color === 'white') {
      top = boardRect.top;
    } else {
      top = boardRect.top + 4 * sqSize;
    }

    modal.style.position = 'fixed';
    modal.style.left = left + 'px';
    modal.style.top = top + 'px';
    modal.style.width = sqSize + 'px';

    pieces.forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'promotion-option';
      btn.textContent = PIECE_UNICODE[color][type];
      btn.addEventListener('click', () => {
        const modal = document.getElementById('promotion-modal');
        if (modal) modal.remove();
        executeMove(fromRow, fromCol, toRow, toCol, type);
        promotionPending = null;
      });
      modal.appendChild(btn);
    });

    document.body.appendChild(modal);

    // Close on outside click
    const closeHandler = (e) => {
      if (!modal.contains(e.target)) {
        modal.remove();
        promotionPending = null;
        clearSelection();
        renderBoard();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);
  }

  // --- Drag & Drop ---
  function onPieceMouseDown(e) {
    if (gameOver || aiThinking || promotionPending) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const piece = engine.getPieceAt(row, col);
    if (!piece || piece.color !== engine.currentTurn) return;
    if (gameMode === 'pvc' && engine.currentTurn === 'black') return;

    e.preventDefault();
    startDrag(e.target, row, col, e.clientX, e.clientY);
  }

  function onPieceTouchStart(e) {
    if (gameOver || aiThinking || promotionPending) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const piece = engine.getPieceAt(row, col);
    if (!piece || piece.color !== engine.currentTurn) return;
    if (gameMode === 'pvc' && engine.currentTurn === 'black') return;

    e.preventDefault();
    const touch = e.touches[0];
    startDrag(e.target, row, col, touch.clientX, touch.clientY);
  }

  function startDrag(pieceEl, row, col, x, y) {
    isDragging = true;
    dragFrom = { row, col };
    selectPiece(row, col);

    // Create dragging clone
    dragPiece = pieceEl.cloneNode(true);
    dragPiece.classList.add('dragging');
    const size = pieceEl.offsetWidth;
    dragPiece.style.width = size + 'px';
    dragPiece.style.height = size + 'px';
    dragPiece.style.left = (x - size / 2) + 'px';
    dragPiece.style.top = (y - size / 2) + 'px';
    dragPiece.style.display = 'flex';
    dragPiece.style.alignItems = 'center';
    dragPiece.style.justifyContent = 'center';
    document.body.appendChild(dragPiece);

    // Hide original
    pieceEl.style.opacity = '0.3';
  }

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !dragPiece) return;
    const size = dragPiece.offsetWidth;
    dragPiece.style.left = (e.clientX - size / 2) + 'px';
    dragPiece.style.top = (e.clientY - size / 2) + 'px';
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || !dragPiece) return;
    e.preventDefault();
    const touch = e.touches[0];
    const size = dragPiece.offsetWidth;
    dragPiece.style.left = (touch.clientX - size / 2) + 'px';
    dragPiece.style.top = (touch.clientY - size / 2) + 'px';
  }, { passive: false });

  function endDrag(x, y) {
    if (!isDragging) return;
    isDragging = false;

    if (dragPiece) {
      dragPiece.remove();
      dragPiece = null;
    }

    // Find target square
    const boardRect = boardEl.getBoundingClientRect();
    const sqSize = boardRect.width / 8;
    const col = Math.floor((x - boardRect.left) / sqSize);
    const row = Math.floor((y - boardRect.top) / sqSize);

    if (row >= 0 && row < 8 && col >= 0 && col < 8 && dragFrom) {
      const validMove = validMoves.find(m => m.row === row && m.col === col);
      if (validMove) {
        // Check promotion
        const movingPiece = engine.getPieceAt(dragFrom.row, dragFrom.col);
        if (movingPiece && movingPiece.type === 'pawn') {
          const isPromotion = (movingPiece.color === 'white' && row === 0) ||
                              (movingPiece.color === 'black' && row === 7);
          if (isPromotion) {
            showPromotionModal(dragFrom.row, dragFrom.col, row, col, movingPiece.color);
            dragFrom = null;
            return;
          }
        }
        executeMove(dragFrom.row, dragFrom.col, row, col);
      } else {
        clearSelection();
        renderBoard();
      }
    } else {
      clearSelection();
      renderBoard();
    }
    dragFrom = null;
  }

  document.addEventListener('mouseup', (e) => endDrag(e.clientX, e.clientY));
  document.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const touch = e.changedTouches[0];
    endDrag(touch.clientX, touch.clientY);
  });

  // --- Update Status Bar ---
  function updateStatus() {
    const statusEl = statusBar.querySelector('span') || statusBar;

    if (engine.gameStatus === 'checkmate') {
      statusBar.classList.remove('check');
      statusEl.textContent = I18N.t('game.checkmate');
    } else if (engine.gameStatus === 'stalemate') {
      statusBar.classList.remove('check');
      statusEl.textContent = I18N.t('game.stalemate');
    } else if (engine.gameStatus === 'draw') {
      statusBar.classList.remove('check');
      statusEl.textContent = I18N.t('game.draw');
    } else if (engine.isInCheck(engine.currentTurn)) {
      statusBar.classList.add('check');
      statusEl.textContent = I18N.t('game.check');
    } else {
      statusBar.classList.remove('check');
      const turnKey = engine.currentTurn === 'white' ? 'game.turn.white' : 'game.turn.black';
      statusEl.textContent = I18N.t(turnKey);
    }
  }

  // --- Update Player Cards ---
  function updatePlayerCards() {
    const whiteCard = document.getElementById('player-white-card');
    const blackCard = document.getElementById('player-black-card');
    const turnWhite = document.getElementById('turn-white');
    const turnBlack = document.getElementById('turn-black');

    if (engine.currentTurn === 'white') {
      whiteCard.classList.add('active-player');
      blackCard.classList.remove('active-player');
      turnWhite.style.display = '';
      turnBlack.style.display = 'none';
    } else {
      blackCard.classList.add('active-player');
      whiteCard.classList.remove('active-player');
      turnBlack.style.display = '';
      turnWhite.style.display = 'none';
    }
  }

  // --- Update Captured Pieces ---
  function updateCapturedPieces() {
    const captured = engine.getCapturedPieces();
    const whiteCapturedEl = document.getElementById('captured-by-white');
    const blackCapturedEl = document.getElementById('captured-by-black');

    // White captured (pieces black has lost, displayed under white player)
    whiteCapturedEl.innerHTML = captured.white.map(p =>
      `<span>${PIECE_UNICODE.black[p.type]}</span>`
    ).join('');

    // Black captured
    blackCapturedEl.innerHTML = captured.black.map(p =>
      `<span>${PIECE_UNICODE.white[p.type]}</span>`
    ).join('');
  }

  // --- Update Move History ---
  function updateMoveHistory() {
    const history = engine.moveHistory;
    moveListEl.innerHTML = '';

    for (let i = 0; i < history.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const row = document.createElement('div');
      row.className = 'move-row';

      const numEl = document.createElement('span');
      numEl.className = 'move-number';
      numEl.textContent = moveNum + '.';
      row.appendChild(numEl);

      const whiteMove = document.createElement('span');
      whiteMove.className = 'move-white';
      whiteMove.textContent = history[i].notation || '...';
      if (i === history.length - 1) whiteMove.classList.add('current');
      row.appendChild(whiteMove);

      if (history[i + 1]) {
        const blackMove = document.createElement('span');
        blackMove.className = 'move-black';
        blackMove.textContent = history[i + 1].notation || '...';
        if (i + 1 === history.length - 1) blackMove.classList.add('current');
        row.appendChild(blackMove);
      }

      moveListEl.appendChild(row);
    }

    // Auto-scroll
    moveListEl.scrollTop = moveListEl.scrollHeight;
  }

  // --- End Game ---
  function endGame() {
    gameOver = true;
    let icon, title, subtitle;

    if (engine.gameStatus === 'checkmate') {
      const winner = engine.winner;
      icon = '🏆';
      title = I18N.t(winner === 'white' ? 'game.white.wins' : 'game.black.wins');
      subtitle = I18N.t('game.checkmate.msg');
      createConfetti();
    } else if (engine.gameStatus === 'stalemate') {
      icon = '🤝';
      title = I18N.t('game.draw.result');
      subtitle = I18N.t('game.stalemate.msg');
    } else if (engine.gameStatus === 'draw') {
      icon = '⚖️';
      title = I18N.t('game.draw.result');
      subtitle = engine.isDraw() ? I18N.t('game.draw.material') : I18N.t('game.draw.50');
    }

    gameOverIcon.textContent = icon;
    gameOverTitle.textContent = title;
    gameOverSubtitle.textContent = subtitle;

    setTimeout(() => {
      gameOverOverlay.classList.add('active');
    }, 600);
  }

  // --- Resign ---
  function handleResign() {
    if (gameOver) return;
    if (!confirm(I18N.t('game.confirm.resign'))) return;

    gameOver = true;
    const loser = engine.currentTurn;
    const winner = loser === 'white' ? 'black' : 'white';

    gameOverIcon.textContent = '🏳️';
    gameOverTitle.textContent = I18N.t(winner === 'white' ? 'game.white.wins' : 'game.black.wins');
    gameOverSubtitle.textContent = I18N.t(loser === 'white' ? 'game.player1' : 'game.player2') + ' ' + I18N.t('game.resign.msg');

    gameOverOverlay.classList.add('active');
  }

  // --- Confetti ---
  function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

    for (let i = 0; i < 80; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = (5 + Math.random() * 8) + 'px';
      confetti.style.height = (5 + Math.random() * 8) + 'px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confetti.style.setProperty('--fall-duration', (2 + Math.random() * 3) + 's');
      confetti.style.setProperty('--fall-delay', Math.random() * 2 + 's');
      container.appendChild(confetti);
    }

    // Cleanup after animation
    setTimeout(() => {
      container.innerHTML = '';
    }, 6000);
  }

  // --- New Game ---
  function handleNewGame() {
    if (!gameOver && engine.moveHistory.length > 0) {
      if (!confirm(I18N.t('game.confirm.newgame'))) return;
    }
    window.location.href = window.location.href;
  }

  // --- Undo ---
  function handleUndo() {
    if (gameOver || aiThinking) return;
    if (engine.moveHistory.length === 0) return;

    // In PvC mode, undo two moves (AI + player)
    if (gameMode === 'pvc') {
      if (engine.currentTurn === 'white') {
        // Undo AI's move and player's move
        engine.undoMove();
        engine.undoMove();
      } else {
        // Shouldn't happen, but just undo one
        engine.undoMove();
      }
    } else {
      engine.undoMove();
    }

    clearSelection();
    renderBoard();
    updateMoveHistory();
    updateStatus();
    updatePlayerCards();
    updateCapturedPieces();
  }

  // --- Button Event Listeners ---
  document.getElementById('btn-undo').addEventListener('click', handleUndo);
  document.getElementById('btn-newgame').addEventListener('click', handleNewGame);
  document.getElementById('btn-resign').addEventListener('click', handleResign);
  document.getElementById('btn-back-menu').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  document.getElementById('btn-play-again').addEventListener('click', handleNewGame);
  document.getElementById('btn-back-menu-end').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // --- Initialize ---
  renderBoard();
  updateStatus();
  updatePlayerCards();
});
