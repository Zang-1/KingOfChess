/**
 * ChessEngine - A complete chess engine in pure JavaScript.
 *
 * Board layout:
 *   board[row][col]  –  row 0 = rank 8 (black home), row 7 = rank 1 (white home)
 *                       col 0 = file a, col 7 = file h
 *
 * Piece object: { type: 'king'|'queen'|'rook'|'bishop'|'knight'|'pawn', color: 'white'|'black' }
 */
class ChessEngine {
  constructor() {
    this.board = [];
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.gameStatus = 'playing';
    this.winner = null;
    this.capturedPieces = { white: [], black: [] }; // pieces captured BY that color

    // Castling rights
    this.castlingRights = {
      whiteKing: true,
      whiteQueen: true,
      blackKing: true,
      blackQueen: true
    };

    // En-passant target square (set after a pawn double-push)
    this.enPassantTarget = null; // { row, col }

    // Half-move clock for 50-move rule (reset on capture or pawn move)
    this.halfMoveClock = 0;

    // Full-move number (incremented after black's move)
    this.fullMoveNumber = 1;

    this._initBoard();
  }

  // ──────────────────────────── Initialisation ────────────────────────────

  _initBoard() {
    const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    // Create empty 8×8
    for (let r = 0; r < 8; r++) {
      this.board[r] = new Array(8).fill(null);
    }

    // Black pieces – row 0 (rank 8)
    for (let c = 0; c < 8; c++) {
      this.board[0][c] = { type: backRank[c], color: 'black' };
    }
    // Black pawns – row 1 (rank 7)
    for (let c = 0; c < 8; c++) {
      this.board[1][c] = { type: 'pawn', color: 'black' };
    }
    // White pawns – row 6 (rank 2)
    for (let c = 0; c < 8; c++) {
      this.board[6][c] = { type: 'pawn', color: 'white' };
    }
    // White pieces – row 7 (rank 1)
    for (let c = 0; c < 8; c++) {
      this.board[7][c] = { type: backRank[c], color: 'white' };
    }
  }

  // ──────────────────────────── Helper Methods ────────────────────────────

  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  getPieceAt(row, col) {
    if (!this.isValidPosition(row, col)) return null;
    return this.board[row][col];
  }

  getAllPieces(color) {
    const pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.color === color) {
          pieces.push({ piece: p, row: r, col: c });
        }
      }
    }
    return pieces;
  }

  cloneBoard() {
    const clone = new ChessEngine();
    // Deep-copy board
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        clone.board[r][c] = this.board[r][c] ? { ...this.board[r][c] } : null;
      }
    }
    clone.currentTurn = this.currentTurn;
    clone.castlingRights = { ...this.castlingRights };
    clone.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
    clone.halfMoveClock = this.halfMoveClock;
    clone.fullMoveNumber = this.fullMoveNumber;
    clone.gameStatus = this.gameStatus;
    clone.winner = this.winner;
    clone.capturedPieces = {
      white: this.capturedPieces.white.map(p => ({ ...p })),
      black: this.capturedPieces.black.map(p => ({ ...p }))
    };
    // We intentionally do NOT deep-clone moveHistory for performance –
    // the clone is meant for AI search, not for undo.
    clone.moveHistory = [];
    return clone;
  }

  getCapturedPieces() {
    return {
      white: this.capturedPieces.white.slice(),
      black: this.capturedPieces.black.slice()
    };
  }

  getLastMove() {
    return this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
  }

  // ──────────────────────── Square-attack helpers ─────────────────────────

  /**
   * Returns true if the given square is attacked by any piece of `attackerColor`.
   */
  _isSquareAttacked(row, col, attackerColor) {
    // 1) Knight attacks
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightOffsets) {
      const r = row + dr, c = col + dc;
      if (this.isValidPosition(r, c)) {
        const p = this.board[r][c];
        if (p && p.color === attackerColor && p.type === 'knight') return true;
      }
    }

    // 2) King attacks (adjacent squares)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr, c = col + dc;
        if (this.isValidPosition(r, c)) {
          const p = this.board[r][c];
          if (p && p.color === attackerColor && p.type === 'king') return true;
        }
      }
    }

    // 3) Pawn attacks
    const pawnDir = attackerColor === 'white' ? 1 : -1; // white pawns are at higher rows, attack upward (lower row numbers)
    // A pawn at (row+pawnDir, col±1) attacks (row, col)
    for (const dc of [-1, 1]) {
      const r = row + pawnDir, c = col + dc;
      if (this.isValidPosition(r, c)) {
        const p = this.board[r][c];
        if (p && p.color === attackerColor && p.type === 'pawn') return true;
      }
    }

    // 4) Sliding pieces – rook / queen (straight lines)
    const straightDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of straightDirs) {
      let r = row + dr, c = col + dc;
      while (this.isValidPosition(r, c)) {
        const p = this.board[r][c];
        if (p) {
          if (p.color === attackerColor && (p.type === 'rook' || p.type === 'queen')) return true;
          break; // blocked
        }
        r += dr;
        c += dc;
      }
    }

    // 5) Sliding pieces – bishop / queen (diagonals)
    const diagDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of diagDirs) {
      let r = row + dr, c = col + dc;
      while (this.isValidPosition(r, c)) {
        const p = this.board[r][c];
        if (p) {
          if (p.color === attackerColor && (p.type === 'bishop' || p.type === 'queen')) return true;
          break;
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  // ──────────────────────── Check / Checkmate / Draw ──────────────────────

  /**
   * Find the king of `color` on the board.
   */
  _findKing(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.type === 'king' && p.color === color) return { row: r, col: c };
      }
    }
    return null; // should never happen in a legal game
  }

  isInCheck(color) {
    const king = this._findKing(color);
    if (!king) return false;
    const opponent = color === 'white' ? 'black' : 'white';
    return this._isSquareAttacked(king.row, king.col, opponent);
  }

  isCheckmate(color) {
    if (!this.isInCheck(color)) return false;
    return this.getAllValidMoves(color).length === 0;
  }

  isStalemate(color) {
    if (this.isInCheck(color)) return false;
    return this.getAllValidMoves(color).length === 0;
  }

  isDraw() {
    // 50-move rule
    if (this.halfMoveClock >= 100) return true; // 100 half-moves = 50 full moves

    // Insufficient material
    if (this._isInsufficientMaterial()) return true;

    // Stalemate for current player
    if (this.isStalemate(this.currentTurn)) return true;

    return false;
  }

  _isInsufficientMaterial() {
    const pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) pieces.push(p);
      }
    }

    // K vs K
    if (pieces.length === 2) return true;

    // K+B vs K or K+N vs K
    if (pieces.length === 3) {
      const nonKing = pieces.find(p => p.type !== 'king');
      if (nonKing && (nonKing.type === 'bishop' || nonKing.type === 'knight')) return true;
    }

    // K+B vs K+B (bishops on same color squares)
    if (pieces.length === 4) {
      const bishops = [];
      const others = [];
      for (const p of pieces) {
        if (p.type === 'bishop') bishops.push(p);
        else if (p.type !== 'king') others.push(p);
      }
      if (bishops.length === 2 && others.length === 0) {
        // Check if same square color
        let bishopSquares = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = this.board[r][c];
            if (p && p.type === 'bishop') {
              bishopSquares.push((r + c) % 2);
            }
          }
        }
        if (bishopSquares.length === 2 && bishopSquares[0] === bishopSquares[1]) {
          // Only insufficient if bishops are on different sides
          if (bishops[0].color !== bishops[1].color) return true;
        }
      }
    }

    return false;
  }

  // ─────────────────────── Pseudo-legal move gen ──────────────────────────

  /**
   * Get pseudo-legal moves for a piece (does NOT check if king is left in check).
   */
  _getPseudoLegalMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];

    switch (piece.type) {
      case 'pawn': return this._getPawnMoves(row, col, piece);
      case 'knight': return this._getKnightMoves(row, col, piece);
      case 'bishop': return this._getSlidingMoves(row, col, piece, [[1,1],[1,-1],[-1,1],[-1,-1]]);
      case 'rook': return this._getSlidingMoves(row, col, piece, [[0,1],[0,-1],[1,0],[-1,0]]);
      case 'queen': return this._getSlidingMoves(row, col, piece, [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
      case 'king': return this._getKingMoves(row, col, piece);
      default: return [];
    }
  }

  _getPawnMoves(row, col, piece) {
    const moves = [];
    const dir = piece.color === 'white' ? -1 : 1; // white moves up (decreasing row)
    const startRow = piece.color === 'white' ? 6 : 1;
    const promotionRow = piece.color === 'white' ? 0 : 7;

    // Forward one square
    const r1 = row + dir;
    if (this.isValidPosition(r1, col) && !this.board[r1][col]) {
      if (r1 === promotionRow) {
        for (const promo of ['queen', 'rook', 'bishop', 'knight']) {
          moves.push({ row: r1, col, special: 'promotion', promotionPiece: promo });
        }
      } else {
        moves.push({ row: r1, col });
      }

      // Forward two squares from start
      if (row === startRow) {
        const r2 = row + 2 * dir;
        if (this.isValidPosition(r2, col) && !this.board[r2][col]) {
          moves.push({ row: r2, col, special: 'doublePush' });
        }
      }
    }

    // Captures (diagonal)
    for (const dc of [-1, 1]) {
      const cr = row + dir, cc = col + dc;
      if (!this.isValidPosition(cr, cc)) continue;

      const target = this.board[cr][cc];
      if (target && target.color !== piece.color) {
        if (cr === promotionRow) {
          for (const promo of ['queen', 'rook', 'bishop', 'knight']) {
            moves.push({ row: cr, col: cc, special: 'promotion', promotionPiece: promo });
          }
        } else {
          moves.push({ row: cr, col: cc });
        }
      }

      // En passant
      if (this.enPassantTarget && this.enPassantTarget.row === cr && this.enPassantTarget.col === cc) {
        moves.push({ row: cr, col: cc, special: 'enPassant' });
      }
    }

    return moves;
  }

  _getKnightMoves(row, col, piece) {
    const moves = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of offsets) {
      const r = row + dr, c = col + dc;
      if (this.isValidPosition(r, c)) {
        const target = this.board[r][c];
        if (!target || target.color !== piece.color) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  _getSlidingMoves(row, col, piece, directions) {
    const moves = [];
    for (const [dr, dc] of directions) {
      let r = row + dr, c = col + dc;
      while (this.isValidPosition(r, c)) {
        const target = this.board[r][c];
        if (!target) {
          moves.push({ row: r, col: c });
        } else {
          if (target.color !== piece.color) {
            moves.push({ row: r, col: c });
          }
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return moves;
  }

  _getKingMoves(row, col, piece) {
    const moves = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr, c = col + dc;
        if (this.isValidPosition(r, c)) {
          const target = this.board[r][c];
          if (!target || target.color !== piece.color) {
            moves.push({ row: r, col: c });
          }
        }
      }
    }

    // Castling
    const opponent = piece.color === 'white' ? 'black' : 'white';
    if (!this._isSquareAttacked(row, col, opponent)) {
      // King-side castling
      const kingSideRight = piece.color === 'white' ? this.castlingRights.whiteKing : this.castlingRights.blackKing;
      if (kingSideRight) {
        if (!this.board[row][col + 1] && !this.board[row][col + 2]) {
          const rook = this.board[row][7];
          if (rook && rook.type === 'rook' && rook.color === piece.color) {
            if (!this._isSquareAttacked(row, col + 1, opponent) &&
                !this._isSquareAttacked(row, col + 2, opponent)) {
              moves.push({ row, col: col + 2, special: 'castleKing' });
            }
          }
        }
      }

      // Queen-side castling
      const queenSideRight = piece.color === 'white' ? this.castlingRights.whiteQueen : this.castlingRights.blackQueen;
      if (queenSideRight) {
        if (!this.board[row][col - 1] && !this.board[row][col - 2] && !this.board[row][col - 3]) {
          const rook = this.board[row][0];
          if (rook && rook.type === 'rook' && rook.color === piece.color) {
            if (!this._isSquareAttacked(row, col - 1, opponent) &&
                !this._isSquareAttacked(row, col - 2, opponent)) {
              moves.push({ row, col: col - 2, special: 'castleQueen' });
            }
          }
        }
      }
    }

    return moves;
  }

  // ──────────────────────── Legal move generation ─────────────────────────

  /**
   * Returns only legal moves for the piece at (row, col).
   * A move is legal if it doesn't leave the player's own king in check.
   */
  getValidMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];
    if (piece.color !== this.currentTurn) return [];
    if (this.gameStatus !== 'playing') return [];

    const pseudoMoves = this._getPseudoLegalMoves(row, col);
    const legalMoves = [];

    for (const move of pseudoMoves) {
      if (this._isMoveLegal(row, col, move, piece)) {
        legalMoves.push(move);
      }
    }

    return legalMoves;
  }

  /**
   * Check legality by making the move on a temporary board and seeing if
   * the king of `piece.color` is still in check.
   */
  _isMoveLegal(fromRow, fromCol, move, piece) {
    // Save state
    const savedBoard = this.board.map(r => r.slice());
    const savedEP = this.enPassantTarget;

    // Apply move on real board temporarily
    this.board[fromRow][fromCol] = null;

    // Handle en passant capture
    if (move.special === 'enPassant') {
      // The captured pawn is on the same row as the moving pawn, same col as destination
      const capturedPawnRow = fromRow; // same row as moving pawn
      this.board[capturedPawnRow][move.col] = null;
    }

    // Handle castling – move the rook too
    if (move.special === 'castleKing') {
      this.board[move.row][move.col - 1] = this.board[move.row][7]; // rook
      this.board[move.row][7] = null;
    } else if (move.special === 'castleQueen') {
      this.board[move.row][move.col + 1] = this.board[move.row][0];
      this.board[move.row][0] = null;
    }

    // Place piece (handle promotion)
    if (move.special === 'promotion') {
      this.board[move.row][move.col] = { type: move.promotionPiece, color: piece.color };
    } else {
      this.board[move.row][move.col] = piece;
    }

    const inCheck = this.isInCheck(piece.color);

    // Restore state
    this.board = savedBoard;
    this.enPassantTarget = savedEP;

    return !inCheck;
  }

  getAllValidMoves(color) {
    const allMoves = [];
    const savedTurn = this.currentTurn;
    this.currentTurn = color; // temporarily set turn so getValidMoves works

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.color === color) {
          const moves = this.getValidMoves(r, c);
          for (const m of moves) {
            allMoves.push({
              fromRow: r,
              fromCol: c,
              toRow: m.row,
              toCol: m.col,
              special: m.special || null,
              promotionPiece: m.promotionPiece || null
            });
          }
        }
      }
    }

    this.currentTurn = savedTurn;
    return allMoves;
  }

  // ──────────────────────────── Make Move ─────────────────────────────────

  makeMove(fromRow, fromCol, toRow, toCol, promotionPiece) {
    if (this.gameStatus !== 'playing') return null;

    const piece = this.board[fromRow][fromCol];
    if (!piece) return null;
    if (piece.color !== this.currentTurn) return null;

    // Find matching valid move
    const validMoves = this.getValidMoves(fromRow, fromCol);
    let matchedMove = null;

    for (const m of validMoves) {
      if (m.row === toRow && m.col === toCol) {
        if (m.special === 'promotion') {
          const promoPiece = promotionPiece || 'queen';
          if (m.promotionPiece === promoPiece) {
            matchedMove = m;
            break;
          }
        } else {
          matchedMove = m;
          break;
        }
      }
    }

    if (!matchedMove) return null;

    // ─── Build the move record (before modifying the board) ───
    const moveRecord = {
      fromRow,
      fromCol,
      toRow,
      toCol,
      piece: { ...piece },
      captured: null,
      special: matchedMove.special || null,
      promotionPiece: matchedMove.promotionPiece || null,
      notation: '',
      isCheck: false,
      isCheckmate: false,
      // snapshot for undo
      _prevCastlingRights: { ...this.castlingRights },
      _prevEnPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null,
      _prevHalfMoveClock: this.halfMoveClock,
      _prevFullMoveNumber: this.fullMoveNumber,
      _prevGameStatus: this.gameStatus,
      _prevWinner: this.winner
    };

    // ─── Captured piece ───
    const captured = this.board[toRow][toCol];
    if (captured) {
      moveRecord.captured = { ...captured };
    }

    // Handle en passant capture
    if (matchedMove.special === 'enPassant') {
      const capturedPawnRow = fromRow;
      moveRecord.captured = { ...this.board[capturedPawnRow][toCol] };
      moveRecord._enPassantCapturedRow = capturedPawnRow;
      moveRecord._enPassantCapturedCol = toCol;
      this.board[capturedPawnRow][toCol] = null;
    }

    // Add captured piece to captured list
    if (moveRecord.captured) {
      this.capturedPieces[piece.color].push({ ...moveRecord.captured });
    }

    // ─── Move the piece ───
    this.board[fromRow][fromCol] = null;
    if (matchedMove.special === 'promotion') {
      this.board[toRow][toCol] = { type: matchedMove.promotionPiece, color: piece.color };
    } else {
      this.board[toRow][toCol] = piece;
    }

    // ─── Castling – move the rook ───
    if (matchedMove.special === 'castleKing') {
      const rook = this.board[toRow][7];
      this.board[toRow][7] = null;
      this.board[toRow][toCol - 1] = rook;
    } else if (matchedMove.special === 'castleQueen') {
      const rook = this.board[toRow][0];
      this.board[toRow][0] = null;
      this.board[toRow][toCol + 1] = rook;
    }

    // ─── Update castling rights ───
    // If king moved
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        this.castlingRights.whiteKing = false;
        this.castlingRights.whiteQueen = false;
      } else {
        this.castlingRights.blackKing = false;
        this.castlingRights.blackQueen = false;
      }
    }
    // If rook moved or was captured
    if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (fromRow === 7 && fromCol === 0) this.castlingRights.whiteQueen = false;
        if (fromRow === 7 && fromCol === 7) this.castlingRights.whiteKing = false;
      } else {
        if (fromRow === 0 && fromCol === 0) this.castlingRights.blackQueen = false;
        if (fromRow === 0 && fromCol === 7) this.castlingRights.blackKing = false;
      }
    }
    // If a rook is captured (on its starting square)
    if (moveRecord.captured && moveRecord.captured.type === 'rook') {
      if (toRow === 7 && toCol === 0) this.castlingRights.whiteQueen = false;
      if (toRow === 7 && toCol === 7) this.castlingRights.whiteKing = false;
      if (toRow === 0 && toCol === 0) this.castlingRights.blackQueen = false;
      if (toRow === 0 && toCol === 7) this.castlingRights.blackKing = false;
    }

    // ─── En passant target ───
    if (matchedMove.special === 'doublePush') {
      this.enPassantTarget = {
        row: (fromRow + toRow) / 2, // the square the pawn passed over
        col: fromCol
      };
    } else {
      this.enPassantTarget = null;
    }

    // ─── Half-move clock ───
    if (piece.type === 'pawn' || moveRecord.captured) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

    // ─── Full-move number ───
    if (piece.color === 'black') {
      this.fullMoveNumber++;
    }

    // ─── Switch turn ───
    const opponent = piece.color === 'white' ? 'black' : 'white';
    this.currentTurn = opponent;

    // ─── Check / checkmate / stalemate / draw ───
    const opponentInCheck = this.isInCheck(opponent);
    moveRecord.isCheck = opponentInCheck;

    if (this.isCheckmate(opponent)) {
      moveRecord.isCheckmate = true;
      this.gameStatus = 'checkmate';
      this.winner = piece.color;
    } else if (this.isStalemate(opponent)) {
      this.gameStatus = 'stalemate';
    } else if (this.isDraw()) {
      this.gameStatus = 'draw';
    }

    // ─── Notation ───
    moveRecord.notation = this._buildNotation(moveRecord);

    // ─── Remove internal doublePush from public special field ───
    if (moveRecord.special === 'doublePush') {
      moveRecord.special = null;
    }

    this.moveHistory.push(moveRecord);
    return moveRecord;
  }

  // ──────────────────────────── Undo Move ─────────────────────────────────

  undoMove() {
    if (this.moveHistory.length === 0) return null;

    const move = this.moveHistory.pop();

    // Restore piece to origin
    this.board[move.fromRow][move.fromCol] = { ...move.piece };

    // Remove piece from destination
    if (move.special === 'promotion') {
      this.board[move.toRow][move.toCol] = null;
    } else {
      this.board[move.toRow][move.toCol] = null;
    }

    // Restore captured piece
    if (move.special === 'enPassant') {
      // The captured pawn was not on the destination square
      this.board[move.toRow][move.toCol] = null;
      this.board[move._enPassantCapturedRow][move._enPassantCapturedCol] = { ...move.captured };
    } else if (move.captured) {
      this.board[move.toRow][move.toCol] = { ...move.captured };
    }

    // Undo castling rook move
    if (move.special === 'castleKing') {
      // Rook moved from col 7 to toCol-1
      const rook = this.board[move.toRow][move.toCol - 1];
      this.board[move.toRow][move.toCol - 1] = null;
      this.board[move.toRow][7] = rook;
    } else if (move.special === 'castleQueen') {
      // Rook moved from col 0 to toCol+1
      const rook = this.board[move.toRow][move.toCol + 1];
      this.board[move.toRow][move.toCol + 1] = null;
      this.board[move.toRow][0] = rook;
    }

    // Remove from captured pieces list
    if (move.captured) {
      const list = this.capturedPieces[move.piece.color];
      // Remove last occurrence matching the captured piece
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].type === move.captured.type && list[i].color === move.captured.color) {
          list.splice(i, 1);
          break;
        }
      }
    }

    // Restore state snapshots
    this.castlingRights = { ...move._prevCastlingRights };
    this.enPassantTarget = move._prevEnPassantTarget ? { ...move._prevEnPassantTarget } : null;
    this.halfMoveClock = move._prevHalfMoveClock;
    this.fullMoveNumber = move._prevFullMoveNumber;
    this.gameStatus = move._prevGameStatus;
    this.winner = move._prevWinner;

    // Switch turn back
    this.currentTurn = move.piece.color;

    return move;
  }

  // ─────────────────────── Algebraic Notation ─────────────────────────────

  _colToFile(col) {
    return String.fromCharCode(97 + col); // 0→'a', 7→'h'
  }

  _rowToRank(row) {
    return String(8 - row); // 0→'8', 7→'1'
  }

  _squareName(row, col) {
    return this._colToFile(col) + this._rowToRank(row);
  }

  _pieceSymbol(type) {
    switch (type) {
      case 'king': return 'K';
      case 'queen': return 'Q';
      case 'rook': return 'R';
      case 'bishop': return 'B';
      case 'knight': return 'N';
      default: return '';
    }
  }

  _buildNotation(move) {
    // Castling
    if (move.special === 'castleKing') {
      let n = 'O-O';
      if (move.isCheckmate) n += '#';
      else if (move.isCheck) n += '+';
      return n;
    }
    if (move.special === 'castleQueen') {
      let n = 'O-O-O';
      if (move.isCheckmate) n += '#';
      else if (move.isCheck) n += '+';
      return n;
    }

    let notation = '';
    const piece = move.piece;

    if (piece.type === 'pawn') {
      if (move.captured) {
        notation += this._colToFile(move.fromCol) + 'x';
      }
      notation += this._squareName(move.toRow, move.toCol);
      if (move.special === 'promotion') {
        notation += '=' + this._pieceSymbol(move.promotionPiece);
      }
    } else {
      notation += this._pieceSymbol(piece.type);

      // Disambiguation: check if another piece of same type and color can reach the same square
      const disambig = this._getDisambiguation(move);
      notation += disambig;

      if (move.captured) notation += 'x';
      notation += this._squareName(move.toRow, move.toCol);
    }

    if (move.isCheckmate) notation += '#';
    else if (move.isCheck) notation += '+';

    return notation;
  }

  _getDisambiguation(move) {
    const piece = move.piece;
    // Find all other pieces of the same type and color that can also move to the destination
    // We need to check on the board BEFORE the move was made, but since we already made it,
    // we use the current board state minus the moved piece plus considering the from-square.
    // Actually, since this is called after the move, we'll look at the move history context.
    // Simpler: we look at the board as it is now and check which other same-type pieces
    // could reach the target. But the moved piece is already on the target square, so we
    // need to be careful.

    // We find all pieces of same type/color on the board CURRENTLY (after the move).
    // The moved piece is now at (toRow, toCol).
    // We check if any other piece of same type at a different square could also move to (toRow, toCol).
    // This approximation works for non-pawn, non-king pieces.

    if (piece.type === 'pawn' || piece.type === 'king') return '';

    const others = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === move.toRow && c === move.toCol) continue; // skip the moved piece itself
        const p = this.board[r][c];
        if (p && p.type === piece.type && p.color === piece.color) {
          // Check if this piece can reach (toRow, toCol)
          // We need to temporarily put the source piece back and check
          // But since we already moved, let's just check pseudo-legal moves
          const pseudoMoves = this._getPseudoLegalMoves(r, c);
          for (const m of pseudoMoves) {
            if (m.row === move.toRow && m.col === move.toCol) {
              others.push({ row: r, col: c });
              break;
            }
          }
        }
      }
    }

    if (others.length === 0) return '';

    // Need disambiguation
    const sameFile = others.some(o => o.col === move.fromCol);
    const sameRank = others.some(o => o.row === move.fromRow);

    if (!sameFile) {
      return this._colToFile(move.fromCol);
    } else if (!sameRank) {
      return this._rowToRank(move.fromRow);
    } else {
      return this._colToFile(move.fromCol) + this._rowToRank(move.fromRow);
    }
  }

  getMoveNotation(move) {
    if (!move) return '';
    return move.notation || '';
  }

  // ──────────────────────────── FEN ───────────────────────────────────────

  getFEN() {
    let fen = '';

    // 1) Piece placement
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) { fen += empty; empty = 0; }
          let ch;
          switch (p.type) {
            case 'king': ch = 'k'; break;
            case 'queen': ch = 'q'; break;
            case 'rook': ch = 'r'; break;
            case 'bishop': ch = 'b'; break;
            case 'knight': ch = 'n'; break;
            case 'pawn': ch = 'p'; break;
            default: ch = '?';
          }
          fen += p.color === 'white' ? ch.toUpperCase() : ch;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    // 2) Active color
    fen += ' ' + (this.currentTurn === 'white' ? 'w' : 'b');

    // 3) Castling availability
    let castling = '';
    if (this.castlingRights.whiteKing) castling += 'K';
    if (this.castlingRights.whiteQueen) castling += 'Q';
    if (this.castlingRights.blackKing) castling += 'k';
    if (this.castlingRights.blackQueen) castling += 'q';
    fen += ' ' + (castling || '-');

    // 4) En passant target
    if (this.enPassantTarget) {
      fen += ' ' + this._squareName(this.enPassantTarget.row, this.enPassantTarget.col);
    } else {
      fen += ' -';
    }

    // 5) Half-move clock
    fen += ' ' + this.halfMoveClock;

    // 6) Full-move number
    fen += ' ' + this.fullMoveNumber;

    return fen;
  }
}

// Export as global
if (typeof window !== 'undefined') {
  window.ChessEngine = ChessEngine;
}
