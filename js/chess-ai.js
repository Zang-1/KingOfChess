/**
 * Chess AI Engine
 * 
 * Implements Minimax with Alpha-Beta pruning, piece-square tables,
 * move ordering (MVV-LVA), quiescence search, and 3 difficulty levels.
 * 
 * Depends on window.ChessEngine (ChessEngine class).
 */

(function () {
  'use strict';

  // =========================================================================
  // Material Values
  // =========================================================================
  const PIECE_VALUES = {
    pawn:   100,
    knight: 320,
    bishop: 330,
    rook:   500,
    queen:  900,
    king:   20000
  };

  // =========================================================================
  // Piece-Square Tables  (from White's perspective, row 0 = rank 8)
  // For Black the table is read in reverse row order.
  // =========================================================================

  // Pawns: encourage center control and advancement
  const PST_PAWN = [
    [  0,   0,   0,   0,   0,   0,   0,   0],
    [ 50,  50,  50,  50,  50,  50,  50,  50],
    [ 10,  10,  20,  30,  30,  20,  10,  10],
    [  5,   5,  10,  25,  25,  10,   5,   5],
    [  0,   0,   0,  20,  20,   0,   0,   0],
    [  5,  -5, -10,   0,   0, -10,  -5,   5],
    [  5,  10,  10, -20, -20,  10,  10,   5],
    [  0,   0,   0,   0,   0,   0,   0,   0]
  ];

  // Knights: prefer center, penalize edges/corners
  const PST_KNIGHT = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20,   0,   0,   0,   0, -20, -40],
    [-30,   0,  10,  15,  15,  10,   0, -30],
    [-30,   5,  15,  20,  20,  15,   5, -30],
    [-30,   0,  15,  20,  20,  15,   0, -30],
    [-30,   5,  10,  15,  15,  10,   5, -30],
    [-40, -20,   0,   5,   5,   0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ];

  // Bishops: prefer diagonals and center
  const PST_BISHOP = [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10,   0,   0,   0,   0,   0,   0, -10],
    [-10,   0,  10,  10,  10,  10,   0, -10],
    [-10,   5,   5,  10,  10,   5,   5, -10],
    [-10,   0,  10,  10,  10,  10,   0, -10],
    [-10,  10,  10,  10,  10,  10,  10, -10],
    [-10,   5,   0,   0,   0,   0,   5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ];

  // Rooks: prefer 7th rank and open files
  const PST_ROOK = [
    [  0,   0,   0,   0,   0,   0,   0,   0],
    [  5,  10,  10,  10,  10,  10,  10,   5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [  0,   0,   0,   5,   5,   0,   0,   0]
  ];

  // Queen: slight center preference, avoid early development
  const PST_QUEEN = [
    [-20, -10, -10,  -5,  -5, -10, -10, -20],
    [-10,   0,   0,   0,   0,   0,   0, -10],
    [-10,   0,   5,   5,   5,   5,   0, -10],
    [ -5,   0,   5,   5,   5,   5,   0,  -5],
    [  0,   0,   5,   5,   5,   5,   0,  -5],
    [-10,   5,   5,   5,   5,   5,   0, -10],
    [-10,   0,   5,   0,   0,   0,   0, -10],
    [-20, -10, -10,  -5,  -5, -10, -10, -20]
  ];

  // King middlegame: stay castled, penalize center
  const PST_KING_MG = [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [ 20,  20,   0,   0,   0,   0,  20,  20],
    [ 20,  30,  10,   0,   0,  10,  30,  20]
  ];

  // King endgame: move to center
  const PST_KING_EG = [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10,   0,   0, -10, -20, -30],
    [-30, -10,  20,  30,  30,  20, -10, -30],
    [-30, -10,  30,  40,  40,  30, -10, -30],
    [-30, -10,  30,  40,  40,  30, -10, -30],
    [-30, -10,  20,  30,  30,  20, -10, -30],
    [-30, -30,   0,   0,   0,   0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50]
  ];

  // Map piece types to their PST (king handled separately)
  const PST_MAP = {
    pawn:   PST_PAWN,
    knight: PST_KNIGHT,
    bishop: PST_BISHOP,
    rook:   PST_ROOK,
    queen:  PST_QUEEN
  };

  // =========================================================================
  // Helper: read PST value for a given piece, color, and position
  // =========================================================================
  function getPstValue(pieceType, color, row, col, isEndgame) {
    if (pieceType === 'king') {
      const table = isEndgame ? PST_KING_EG : PST_KING_MG;
      return color === 'white' ? table[row][col] : table[7 - row][col];
    }
    const table = PST_MAP[pieceType];
    if (!table) return 0;
    return color === 'white' ? table[row][col] : table[7 - row][col];
  }

  // =========================================================================
  // Determine if position is an endgame
  // =========================================================================
  function isEndgame(board) {
    let queens = 0;
    let minorMajor = 0; // non-pawn, non-king, non-queen pieces
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        if (piece.type === 'queen') queens++;
        if (piece.type === 'rook' || piece.type === 'bishop' || piece.type === 'knight') minorMajor++;
      }
    }
    // Endgame if no queens, or every side with a queen has at most 1 other minor/major piece
    return queens === 0 || (queens <= 2 && minorMajor <= 2);
  }

  // =========================================================================
  // Evaluation Function
  // =========================================================================
  function evaluate(engine, aiColor) {
    const board = engine.board;
    const endgame = isEndgame(board);
    const opponent = aiColor === 'white' ? 'black' : 'white';

    let score = 0;

    // --- Material + PST ---
    const pawnsOnFile = { white: new Array(8).fill(0), black: new Array(8).fill(0) };
    let whiteBishops = 0;
    let blackBishops = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const sign = piece.color === aiColor ? 1 : -1;
        // Material
        score += sign * PIECE_VALUES[piece.type];
        // PST
        score += sign * getPstValue(piece.type, piece.color, r, c, endgame);

        // Track pawns per file for structure evaluation
        if (piece.type === 'pawn') {
          pawnsOnFile[piece.color][c]++;
        }
        if (piece.type === 'bishop') {
          if (piece.color === 'white') whiteBishops++;
          else blackBishops++;
        }
      }
    }

    // --- Pawn Structure ---
    for (const color of ['white', 'black']) {
      const sign = color === aiColor ? 1 : -1;
      const pf = pawnsOnFile[color];

      for (let c = 0; c < 8; c++) {
        if (pf[c] === 0) continue;

        // Doubled pawns: more than 1 pawn on same file
        if (pf[c] > 1) {
          score += sign * (-10 * (pf[c] - 1));
        }

        // Isolated pawns: no friendly pawns on adjacent files
        const hasLeft = c > 0 && pf[c - 1] > 0;
        const hasRight = c < 7 && pf[c + 1] > 0;
        if (!hasLeft && !hasRight) {
          score += sign * (-10 * pf[c]);
        }

        // Passed pawns: no opponent pawns on same or adjacent files ahead
        const oppPf = pawnsOnFile[color === 'white' ? 'black' : 'white'];
        let passed = true;
        for (let adjC = Math.max(0, c - 1); adjC <= Math.min(7, c + 1); adjC++) {
          if (oppPf[adjC] > 0) {
            // Check if any opponent pawn is actually ahead
            // For white, "ahead" means lower row index; for black, higher row index
            for (let r = 0; r < 8; r++) {
              const p = board[r][adjC];
              if (p && p.type === 'pawn' && p.color !== color) {
                if (color === 'white' && r < getFirstPawnRow(board, color, c)) {
                  passed = false;
                  break;
                }
                if (color === 'black' && r > getLastPawnRow(board, color, c)) {
                  passed = false;
                  break;
                }
              }
            }
            if (!passed) break;
          }
        }
        if (passed) {
          score += sign * (20 * pf[c]);
        }
      }
    }

    // --- Bishop Pair ---
    if (whiteBishops >= 2) score += (aiColor === 'white' ? 30 : -30);
    if (blackBishops >= 2) score += (aiColor === 'black' ? 30 : -30);

    // --- Rook on Open File ---
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece || piece.type !== 'rook') continue;
        const sign = piece.color === aiColor ? 1 : -1;
        // Open file: no pawns of either color
        if (pawnsOnFile.white[c] === 0 && pawnsOnFile.black[c] === 0) {
          score += sign * 15;
        }
      }
    }

    // --- King Safety (pawn shield, middlegame only) ---
    if (!endgame) {
      for (const color of ['white', 'black']) {
        const sign = color === aiColor ? 1 : -1;
        // Find king position
        let kingRow = -1, kingCol = -1;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'king' && p.color === color) {
              kingRow = r;
              kingCol = c;
            }
          }
        }
        if (kingRow < 0) continue;

        // Pawn shield: check pawns in front of king
        const dir = color === 'white' ? -1 : 1;
        let shieldCount = 0;
        for (let dc = -1; dc <= 1; dc++) {
          const sc = kingCol + dc;
          const sr = kingRow + dir;
          if (sr >= 0 && sr < 8 && sc >= 0 && sc < 8) {
            const p = board[sr][sc];
            if (p && p.type === 'pawn' && p.color === color) {
              shieldCount++;
            }
          }
        }
        score += sign * (shieldCount * 10);
      }
    }

    // --- Mobility ---
    // Count legal moves for each side
    const aiMoves = engine.getAllValidMoves(aiColor);
    const oppMoves = engine.getAllValidMoves(opponent);
    score += (aiMoves.length - oppMoves.length) * 2;

    return score;
  }

  /** Helper: find the first (lowest row index) pawn of a color on a given file */
  function getFirstPawnRow(board, color, col) {
    for (let r = 0; r < 8; r++) {
      const p = board[r][col];
      if (p && p.type === 'pawn' && p.color === color) return r;
    }
    return -1;
  }

  /** Helper: find the last (highest row index) pawn of a color on a given file */
  function getLastPawnRow(board, color, col) {
    for (let r = 7; r >= 0; r--) {
      const p = board[r][col];
      if (p && p.type === 'pawn' && p.color === color) return r;
    }
    return -1;
  }

  // =========================================================================
  // Move Ordering
  // =========================================================================

  /**
   * Score a move for ordering purposes. Higher = searched first.
   */
  function scoreMoveForOrdering(move, board, engine) {
    let score = 0;
    const target = board[move.toRow][move.toCol];
    const attacker = board[move.fromRow][move.fromCol];

    // 1. Captures: MVV-LVA  (Most Valuable Victim - Least Valuable Attacker)
    if (target) {
      score += 10000 + PIECE_VALUES[target.type] * 10 - PIECE_VALUES[attacker.type];
    }

    // 2. Promotions
    if (move.special === 'promotion' || (attacker.type === 'pawn' &&
        ((attacker.color === 'white' && move.toRow === 0) ||
         (attacker.color === 'black' && move.toRow === 7)))) {
      score += 9000;
    }

    // 3. Checks (lightweight test: make move, check if opponent is in check, undo)
    // Skipped here for performance; we rely on captures and promotions for ordering.

    // 4. Center moves bonus for non-captures
    if (!target) {
      const centerDist = Math.abs(move.toRow - 3.5) + Math.abs(move.toCol - 3.5);
      score += Math.round((7 - centerDist) * 5);
    }

    return score;
  }

  function orderMoves(moves, board, engine) {
    const scored = moves.map(m => ({
      move: m,
      score: scoreMoveForOrdering(m, board, engine)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.move);
  }

  // =========================================================================
  // Quiescence Search (captures only, hard mode)
  // =========================================================================
  function quiescence(engine, aiColor, alpha, beta, depthLeft) {
    // Stand-pat score
    const standPat = evaluate(engine, aiColor);
    const currentTurn = engine.currentTurn;
    const isMaximizing = currentTurn === aiColor;

    if (depthLeft <= 0) return standPat;

    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (standPat > alpha) alpha = standPat;
    } else {
      if (standPat <= alpha) return alpha;
      if (standPat < beta) beta = standPat;
    }

    // Get all valid moves, filter to captures only
    const allMoves = engine.getAllValidMoves(currentTurn);
    const captureMoves = allMoves.filter(m => {
      const target = engine.board[m.toRow][m.toCol];
      return target !== null && target !== undefined;
    });

    if (captureMoves.length === 0) return standPat;

    // Order captures by MVV-LVA
    const ordered = orderMoves(captureMoves, engine.board, engine);

    if (isMaximizing) {
      let best = standPat;
      for (const move of ordered) {
        const promo = needsPromotion(move, engine.board) ? 'queen' : undefined;
        engine.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol, promo);
        const val = quiescence(engine, aiColor, alpha, beta, depthLeft - 1);
        engine.undoMove();
        if (val > best) best = val;
        if (best > alpha) alpha = best;
        if (alpha >= beta) break;
      }
      return best;
    } else {
      let best = standPat;
      for (const move of ordered) {
        const promo = needsPromotion(move, engine.board) ? 'queen' : undefined;
        engine.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol, promo);
        const val = quiescence(engine, aiColor, alpha, beta, depthLeft - 1);
        engine.undoMove();
        if (val < best) best = val;
        if (best < beta) beta = best;
        if (alpha >= beta) break;
      }
      return best;
    }
  }

  // =========================================================================
  // Check if a pawn move is a promotion
  // =========================================================================
  function needsPromotion(move, board) {
    const piece = board[move.fromRow][move.fromCol];
    if (!piece || piece.type !== 'pawn') return false;
    if (piece.color === 'white' && move.toRow === 0) return true;
    if (piece.color === 'black' && move.toRow === 7) return true;
    return false;
  }

  // =========================================================================
  // Minimax with Alpha-Beta Pruning
  // =========================================================================
  function minimax(engine, aiColor, depth, alpha, beta, useQuiescence) {
    const currentTurn = engine.currentTurn;

    // Terminal conditions
    if (engine.gameStatus === 'checkmate') {
      // The side whose turn it is has been checkmated
      return currentTurn === aiColor ? -100000 + (100 - depth) : 100000 - (100 - depth);
    }
    if (engine.gameStatus === 'stalemate' || engine.gameStatus === 'draw') {
      return 0;
    }

    if (depth <= 0) {
      if (useQuiescence) {
        return quiescence(engine, aiColor, alpha, beta, 4); // 4 extra plies
      }
      return evaluate(engine, aiColor);
    }

    const moves = engine.getAllValidMoves(currentTurn);

    if (moves.length === 0) {
      // No moves — check or stalemate
      if (engine.isInCheck(currentTurn)) {
        return currentTurn === aiColor ? -100000 + (100 - depth) : 100000 - (100 - depth);
      }
      return 0; // stalemate
    }

    // Order moves for better pruning
    const orderedMoves = orderMoves(moves, engine.board, engine);
    const isMaximizing = currentTurn === aiColor;

    if (isMaximizing) {
      let best = -Infinity;
      for (const move of orderedMoves) {
        const promo = needsPromotion(move, engine.board) ? 'queen' : undefined;
        engine.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol, promo);
        const val = minimax(engine, aiColor, depth - 1, alpha, beta, useQuiescence);
        engine.undoMove();
        if (val > best) best = val;
        if (best > alpha) alpha = best;
        if (alpha >= beta) break; // Beta cutoff
      }
      return best;
    } else {
      let best = Infinity;
      for (const move of orderedMoves) {
        const promo = needsPromotion(move, engine.board) ? 'queen' : undefined;
        engine.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol, promo);
        const val = minimax(engine, aiColor, depth - 1, alpha, beta, useQuiescence);
        engine.undoMove();
        if (val < best) best = val;
        if (best < beta) beta = best;
        if (alpha >= beta) break; // Alpha cutoff
      }
      return best;
    }
  }

  // =========================================================================
  // ChessAI Class
  // =========================================================================
  class ChessAI {
    /**
     * @param {ChessEngine} engine - ChessEngine instance
     * @param {'easy'|'medium'|'hard'} difficulty - Difficulty level
     */
    constructor(engine, difficulty) {
      this.engine = engine;
      this.setDifficulty(difficulty || 'medium');
    }

    /**
     * Change the difficulty level.
     * @param {'easy'|'medium'|'hard'} difficulty
     */
    setDifficulty(difficulty) {
      this.difficulty = difficulty;
      switch (difficulty) {
        case 'easy':
          this.searchDepth = 1;
          this.useQuiescence = false;
          break;
        case 'medium':
          this.searchDepth = 3;
          this.useQuiescence = false;
          break;
        case 'hard':
          this.searchDepth = 4;
          this.useQuiescence = true;
          break;
        default:
          this.searchDepth = 3;
          this.useQuiescence = false;
      }
    }

    /**
     * Get the best move for the current player.
     * @returns {{fromRow: number, fromCol: number, toRow: number, toCol: number, promotionPiece?: string} | null}
     */
    getBestMove() {
      const aiColor = this.engine.currentTurn;

      // Edge case: game already over
      if (this.engine.gameStatus !== 'playing') return null;

      const moves = this.engine.getAllValidMoves(aiColor);
      if (moves.length === 0) return null;
      if (moves.length === 1) {
        // Only one legal move — just play it
        const m = moves[0];
        const promo = needsPromotion(m, this.engine.board) ? 'queen' : undefined;
        return {
          fromRow: m.fromRow,
          fromCol: m.fromCol,
          toRow: m.toRow,
          toCol: m.toCol,
          promotionPiece: promo
        };
      }

      if (this.difficulty === 'easy') {
        return this._getEasyMove(moves, aiColor);
      }

      return this._getSearchedMove(moves, aiColor);
    }

    /**
     * Easy mode: 30% chance of completely random move,
     * otherwise pick randomly from the top 5 moves by basic eval.
     */
    _getEasyMove(moves, aiColor) {
      // 30% chance of a random move
      if (Math.random() < 0.3) {
        const m = moves[Math.floor(Math.random() * moves.length)];
        const promo = needsPromotion(m, this.engine.board) ? 'queen' : undefined;
        return {
          fromRow: m.fromRow,
          fromCol: m.fromCol,
          toRow: m.toRow,
          toCol: m.toCol,
          promotionPiece: promo
        };
      }

      // Score each move with depth-1 search (just evaluate resulting position)
      const scored = [];
      for (const move of moves) {
        const promo = needsPromotion(move, this.engine.board) ? 'queen' : undefined;
        this.engine.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol, promo);
        const val = evaluate(this.engine, aiColor);
        this.engine.undoMove();
        scored.push({ move, val, promo });
      }

      // Sort descending by score
      scored.sort((a, b) => b.val - a.val);

      // Pick randomly from top 5
      const topN = Math.min(5, scored.length);
      const pick = scored[Math.floor(Math.random() * topN)];
      return {
        fromRow: pick.move.fromRow,
        fromCol: pick.move.fromCol,
        toRow: pick.move.toRow,
        toCol: pick.move.toCol,
        promotionPiece: pick.promo
      };
    }

    /**
     * Medium/Hard mode: full minimax search with alpha-beta pruning.
     */
    _getSearchedMove(moves, aiColor) {
      const orderedMoves = orderMoves(moves, this.engine.board, this.engine);

      let bestScore = -Infinity;
      let bestMove = null;
      let bestPromo = undefined;
      let alpha = -Infinity;
      const beta = Infinity;

      for (const move of orderedMoves) {
        const promo = needsPromotion(move, this.engine.board) ? 'queen' : undefined;
        this.engine.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol, promo);
        const val = minimax(
          this.engine,
          aiColor,
          this.searchDepth - 1,
          alpha,
          beta,
          this.useQuiescence
        );
        this.engine.undoMove();

        if (val > bestScore) {
          bestScore = val;
          bestMove = move;
          bestPromo = promo;
        }
        if (val > alpha) alpha = val;
      }

      if (!bestMove) {
        // Fallback: just pick the first move (should not happen)
        bestMove = orderedMoves[0];
        bestPromo = needsPromotion(bestMove, this.engine.board) ? 'queen' : undefined;
      }

      return {
        fromRow: bestMove.fromRow,
        fromCol: bestMove.fromCol,
        toRow: bestMove.toRow,
        toCol: bestMove.toCol,
        promotionPiece: bestPromo
      };
    }
  }

  // Export to global scope
  window.ChessAI = ChessAI;

})();
