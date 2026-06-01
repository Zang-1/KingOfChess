/* ============================================
   KING OF CHESS — Guide Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize systems
  I18N.init();
  Settings.init();

  // --- Navigation Tabs ---
  const navBtns = document.querySelectorAll('.guide-nav-btn');
  const sections = document.querySelectorAll('.guide-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      document.getElementById('section-' + target).classList.add('active');
    });
  });

  // --- Mini Board Helper ---
  function createMiniBoard(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // config: { pieces: [{row, col, char}], highlights: [{row, col}], dots: [{row, col}] }
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = document.createElement('div');
        const isLight = (row + col) % 2 === 0;
        sq.className = `mini-sq ${isLight ? 'light' : 'dark'}`;

        // Check highlights
        if (config.highlights) {
          const isHighlighted = config.highlights.some(h => h.row === row && h.col === col);
          if (isHighlighted) sq.classList.add('highlight');
        }

        // Check dots (valid move indicators)
        if (config.dots) {
          const hasDot = config.dots.some(d => d.row === row && d.col === col);
          if (hasDot) sq.classList.add('move-dot');
        }

        // Place pieces
        if (config.pieces) {
          const piece = config.pieces.find(p => p.row === row && p.col === col);
          if (piece) {
            sq.textContent = piece.char;
          }
        }

        container.appendChild(sq);
      }
    }
  }

  // --- Build all mini boards ---

  // Overview board: starting position
  createMiniBoard('overview-board', {
    pieces: [
      // Black pieces
      { row: 0, col: 0, char: '♜' }, { row: 0, col: 1, char: '♞' },
      { row: 0, col: 2, char: '♝' }, { row: 0, col: 3, char: '♛' },
      { row: 0, col: 4, char: '♚' }, { row: 0, col: 5, char: '♝' },
      { row: 0, col: 6, char: '♞' }, { row: 0, col: 7, char: '♜' },
      { row: 1, col: 0, char: '♟' }, { row: 1, col: 1, char: '♟' },
      { row: 1, col: 2, char: '♟' }, { row: 1, col: 3, char: '♟' },
      { row: 1, col: 4, char: '♟' }, { row: 1, col: 5, char: '♟' },
      { row: 1, col: 6, char: '♟' }, { row: 1, col: 7, char: '♟' },
      // White pieces
      { row: 7, col: 0, char: '♖' }, { row: 7, col: 1, char: '♘' },
      { row: 7, col: 2, char: '♗' }, { row: 7, col: 3, char: '♕' },
      { row: 7, col: 4, char: '♔' }, { row: 7, col: 5, char: '♗' },
      { row: 7, col: 6, char: '♘' }, { row: 7, col: 7, char: '♖' },
      { row: 6, col: 0, char: '♙' }, { row: 6, col: 1, char: '♙' },
      { row: 6, col: 2, char: '♙' }, { row: 6, col: 3, char: '♙' },
      { row: 6, col: 4, char: '♙' }, { row: 6, col: 5, char: '♙' },
      { row: 6, col: 6, char: '♙' }, { row: 6, col: 7, char: '♙' },
    ]
  });

  // King: center of board, shows all 8 directions
  createMiniBoard('board-king', {
    pieces: [{ row: 4, col: 4, char: '♔' }],
    highlights: [{ row: 4, col: 4 }],
    dots: [
      { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
      { row: 4, col: 3 },                       { row: 4, col: 5 },
      { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }
    ]
  });

  // Queen: center, shows all directions (rays)
  createMiniBoard('board-queen', {
    pieces: [{ row: 4, col: 3, char: '♕' }],
    highlights: [{ row: 4, col: 3 }],
    dots: [
      // Horizontal
      { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 },
      { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 },
      // Vertical
      { row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 },
      { row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 },
      // Diagonals
      { row: 3, col: 2 }, { row: 2, col: 1 }, { row: 1, col: 0 },
      { row: 3, col: 4 }, { row: 2, col: 5 }, { row: 1, col: 6 }, { row: 0, col: 7 },
      { row: 5, col: 2 }, { row: 6, col: 1 }, { row: 7, col: 0 },
      { row: 5, col: 4 }, { row: 6, col: 5 }, { row: 7, col: 7 }
    ]
  });

  // Rook: shows horizontal and vertical
  createMiniBoard('board-rook', {
    pieces: [{ row: 4, col: 3, char: '♖' }],
    highlights: [{ row: 4, col: 3 }],
    dots: [
      // Horizontal
      { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 },
      { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 },
      // Vertical
      { row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 },
      { row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 }
    ]
  });

  // Bishop: shows diagonals
  createMiniBoard('board-bishop', {
    pieces: [{ row: 4, col: 4, char: '♗' }],
    highlights: [{ row: 4, col: 4 }],
    dots: [
      { row: 3, col: 3 }, { row: 2, col: 2 }, { row: 1, col: 1 }, { row: 0, col: 0 },
      { row: 3, col: 5 }, { row: 2, col: 6 }, { row: 1, col: 7 },
      { row: 5, col: 3 }, { row: 6, col: 2 }, { row: 7, col: 1 },
      { row: 5, col: 5 }, { row: 6, col: 6 }, { row: 7, col: 7 }
    ]
  });

  // Knight: shows L-shape moves
  createMiniBoard('board-knight', {
    pieces: [{ row: 4, col: 4, char: '♘' }],
    highlights: [{ row: 4, col: 4 }],
    dots: [
      { row: 2, col: 3 }, { row: 2, col: 5 },
      { row: 3, col: 2 }, { row: 3, col: 6 },
      { row: 5, col: 2 }, { row: 5, col: 6 },
      { row: 6, col: 3 }, { row: 6, col: 5 }
    ]
  });

  // Pawn: shows forward movement and capture diagonals
  createMiniBoard('board-pawn', {
    pieces: [
      { row: 4, col: 3, char: '♙' },
      { row: 3, col: 2, char: '♟' },
      { row: 3, col: 4, char: '♟' }
    ],
    highlights: [{ row: 4, col: 3 }],
    dots: [
      { row: 3, col: 3 }, // forward
      { row: 3, col: 2 }, // capture left
      { row: 3, col: 4 }  // capture right
    ]
  });

  // Castling: show king and rook positions
  createMiniBoard('board-castling', {
    pieces: [
      { row: 7, col: 4, char: '♔' }, // King
      { row: 7, col: 0, char: '♖' }, // Queen-side Rook
      { row: 7, col: 7, char: '♖' }, // King-side Rook
    ],
    highlights: [
      { row: 7, col: 4 }, // King position
      { row: 7, col: 6 }, // King-side castle destination
      { row: 7, col: 2 }  // Queen-side castle destination
    ],
    dots: [
      { row: 7, col: 5 }, // Rook king-side lands
      { row: 7, col: 3 }  // Rook queen-side lands
    ]
  });

  // En Passant: show the scenario
  createMiniBoard('board-enpassant', {
    pieces: [
      { row: 3, col: 4, char: '♙' }, // White pawn
      { row: 3, col: 5, char: '♟' }, // Black pawn that just moved 2 squares
    ],
    highlights: [
      { row: 3, col: 4 },
      { row: 2, col: 5 }  // Where white captures
    ],
    dots: [
      { row: 2, col: 5 } // En passant target
    ]
  });

  // Promotion: pawn about to reach last rank
  createMiniBoard('board-promotion', {
    pieces: [
      { row: 1, col: 3, char: '♙' }, // White pawn about to promote
    ],
    highlights: [
      { row: 1, col: 3 },
      { row: 0, col: 3 }  // Promotion square
    ],
    dots: [
      { row: 0, col: 3 }
    ]
  });
});
