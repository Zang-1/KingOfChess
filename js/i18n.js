/* ============================================
   KING OF CHESS — Internationalization (i18n)
   ============================================ */

const I18N = {
  currentLang: 'vi',

  translations: {
    vi: {
      // Menu
      'menu.title': 'King of Chess',
      'menu.subtitle': 'Trò chơi cờ vua',
      'menu.pvp': 'Người vs Người',
      'menu.pvp.desc': 'Chơi với bạn bè trên cùng thiết bị',
      'menu.pvc': 'Người vs Máy',
      'menu.pvc.desc': 'Thử thách trí tuệ nhân tạo',
      'menu.guide': 'Hướng dẫn',
      'menu.settings': 'Cài đặt',
      'menu.difficulty': 'Chọn cấp độ',
      'menu.easy': 'Dễ',
      'menu.easy.desc': 'Dành cho người mới',
      'menu.medium': 'Trung bình',
      'menu.medium.desc': 'Thử thách vừa phải',
      'menu.hard': 'Khó',
      'menu.hard.desc': 'Đối thủ mạnh',
      'menu.play': 'Bắt đầu chơi',
      'menu.footer': 'Được tạo bởi Bao Giang',

      // Game
      'game.white': 'Trắng',
      'game.black': 'Đen',
      'game.player1': 'Người chơi 1',
      'game.player2': 'Người chơi 2',
      'game.ai': 'Máy tính',
      'game.turn.white': 'Lượt của Trắng',
      'game.turn.black': 'Lượt của Đen',
      'game.check': 'Chiếu!',
      'game.checkmate': 'Chiếu hết!',
      'game.stalemate': 'Hòa cờ!',
      'game.draw': 'Hòa!',
      'game.resign': 'Đầu hàng',
      'game.undo': 'Hoàn tác',
      'game.newgame': 'Ván mới',
      'game.back': 'Về Menu',
      'game.moves': 'Lịch sử nước đi',
      'game.thinking': 'Máy đang suy nghĩ',
      'game.promote': 'Chọn quân phong cấp',
      'game.white.wins': 'Trắng thắng!',
      'game.black.wins': 'Đen thắng!',
      'game.draw.result': 'Ván cờ hòa!',
      'game.checkmate.msg': 'Chiếu hết',
      'game.stalemate.msg': 'Không còn nước đi hợp lệ',
      'game.resign.msg': 'đã đầu hàng',
      'game.draw.50': 'Hòa theo quy tắc 50 nước',
      'game.draw.material': 'Hòa do không đủ quân',
      'game.playagain': 'Chơi lại',
      'game.confirm.resign': 'Bạn có chắc muốn đầu hàng?',
      'game.confirm.newgame': 'Bạn có chắc muốn bắt đầu ván mới?',

      // Settings
      'settings.title': 'Cài đặt',
      'settings.theme': 'Giao diện',
      'settings.theme.desc': 'Chọn giao diện sáng hoặc tối',
      'settings.theme.dark': 'Tối',
      'settings.theme.light': 'Sáng',
      'settings.board': 'Màu bàn cờ',
      'settings.board.desc': 'Chọn bộ màu cho bàn cờ',
      'settings.sound': 'Âm thanh',
      'settings.sound.desc': 'Bật hoặc tắt hiệu ứng âm thanh',
      'settings.language': 'Ngôn ngữ',
      'settings.language.desc': 'Chọn ngôn ngữ hiển thị',
      'settings.close': 'Đóng',

      // Guide
      'guide.title': 'Hướng dẫn chơi cờ vua',
      'guide.subtitle': 'Học cách chơi từ cơ bản đến nâng cao',
      'guide.back': 'Quay lại',
      'guide.nav.overview': 'Tổng quan',
      'guide.nav.pieces': 'Quân cờ',
      'guide.nav.special': 'Nước đặc biệt',
      'guide.nav.rules': 'Luật chơi',

      // Guide - Overview
      'guide.overview.title': 'Tổng quan cờ vua',
      'guide.overview.p1': 'Cờ vua là trò chơi chiến thuật dành cho hai người chơi trên bàn cờ 8×8 với 64 ô xen kẽ sáng tối.',
      'guide.overview.p2': 'Mỗi bên bắt đầu với 16 quân: 1 Vua, 1 Hậu, 2 Xe, 2 Tượng, 2 Mã và 8 Tốt.',
      'guide.overview.p3': 'Mục tiêu là chiếu hết (checkmate) vua đối phương — tức là đặt vua vào thế bị tấn công mà không có cách thoát.',
      'guide.overview.p4': 'Trắng luôn đi trước. Hai bên luân phiên đi, mỗi lượt di chuyển một quân.',

      // Guide - Pieces
      'guide.king.name': 'Vua',
      'guide.king.value': 'Giá trị: Vô giá',
      'guide.king.desc': 'Vua có thể di chuyển 1 ô theo mọi hướng (ngang, dọc, chéo). Vua không được di chuyển vào ô bị quân đối phương tấn công. Nếu vua bị chiếu hết, ván cờ kết thúc.',
      'guide.queen.name': 'Hậu',
      'guide.queen.value': 'Giá trị: 9 điểm',
      'guide.queen.desc': 'Hậu là quân mạnh nhất, có thể di chuyển theo mọi hướng (ngang, dọc, chéo) với số ô không giới hạn, miễn không bị chặn.',
      'guide.rook.name': 'Xe',
      'guide.rook.value': 'Giá trị: 5 điểm',
      'guide.rook.desc': 'Xe di chuyển theo hàng ngang hoặc dọc với số ô không giới hạn. Xe rất mạnh khi kiểm soát hàng và cột mở.',
      'guide.bishop.name': 'Tượng',
      'guide.bishop.value': 'Giá trị: 3 điểm',
      'guide.bishop.desc': 'Tượng di chuyển theo đường chéo không giới hạn. Mỗi tượng chỉ có thể đi trên ô cùng màu. Hai tượng phối hợp rất mạnh.',
      'guide.knight.name': 'Mã',
      'guide.knight.value': 'Giá trị: 3 điểm',
      'guide.knight.desc': 'Mã di chuyển theo hình chữ L: 2 ô theo một hướng rồi 1 ô vuông góc. Mã là quân duy nhất có thể nhảy qua quân khác.',
      'guide.pawn.name': 'Tốt',
      'guide.pawn.value': 'Giá trị: 1 điểm',
      'guide.pawn.desc': 'Tốt tiến 1 ô về phía trước (hoặc 2 ô từ vị trí đầu). Tốt bắt quân theo đường chéo. Khi đến hàng cuối, tốt được phong cấp.',

      // Guide - Special Moves
      'guide.castling.title': '🏰 Nhập thành (Castling)',
      'guide.castling.desc': 'Nước đi đặc biệt giữa Vua và Xe. Vua di chuyển 2 ô về phía Xe, Xe nhảy qua Vua sang bên kia.',
      'guide.castling.c1': 'Vua và Xe chưa từng di chuyển',
      'guide.castling.c2': 'Không có quân nào giữa Vua và Xe',
      'guide.castling.c3': 'Vua không đang bị chiếu',
      'guide.castling.c4': 'Vua không đi qua hoặc dừng ở ô bị tấn công',
      'guide.enpassant.title': '⚡ Bắt tốt qua đường (En Passant)',
      'guide.enpassant.desc': 'Khi tốt đối phương tiến 2 ô từ vị trí đầu và đứng cạnh tốt của bạn, bạn có thể bắt nó bằng cách di chuyển chéo đến ô mà tốt đó đi qua.',
      'guide.enpassant.c1': 'Tốt đối phương vừa tiến 2 ô ở nước đi trước',
      'guide.enpassant.c2': 'Tốt của bạn đứng cạnh tốt đối phương',
      'guide.enpassant.c3': 'Phải thực hiện ngay ở nước đi kế tiếp',
      'guide.promotion.title': '👑 Phong cấp (Promotion)',
      'guide.promotion.desc': 'Khi tốt đến được hàng cuối cùng của bàn cờ (hàng 8 với Trắng, hàng 1 với Đen), nó phải được phong cấp thành quân khác.',
      'guide.promotion.c1': 'Có thể chọn: Hậu, Xe, Tượng, hoặc Mã',
      'guide.promotion.c2': 'Thường chọn Hậu vì là quân mạnh nhất',
      'guide.promotion.c3': 'Phong cấp là bắt buộc, không thể giữ nguyên Tốt',

      // Guide - Rules
      'guide.rules.title': 'Luật chơi & Kết thúc ván cờ',
      'guide.rules.check.title': 'Chiếu (Check)',
      'guide.rules.check.desc': 'Khi Vua bị quân đối phương tấn công, gọi là "chiếu". Người chơi phải giải chiếu bằng cách: di chuyển Vua, chặn đường tấn công, hoặc bắt quân đang chiếu.',
      'guide.rules.checkmate.title': 'Chiếu hết (Checkmate)',
      'guide.rules.checkmate.desc': 'Khi Vua bị chiếu mà không có cách giải chiếu, ván cờ kết thúc. Bên bị chiếu hết thua cuộc.',
      'guide.rules.stalemate.title': 'Hòa cờ - Bí (Stalemate)',
      'guide.rules.stalemate.desc': 'Khi đến lượt đi nhưng không có nước đi hợp lệ nào, và Vua KHÔNG bị chiếu. Ván cờ kết thúc hòa.',
      'guide.rules.draw.title': 'Hòa cờ khác',
      'guide.rules.draw.desc': 'Hòa do quy tắc 50 nước (50 nước đi liên tiếp không có bắt quân hay di chuyển tốt), hoặc hòa do không đủ quân chiếu hết (Vua vs Vua, Vua+Tượng vs Vua, Vua+Mã vs Vua).',
    },

    en: {
      // Menu
      'menu.title': 'King of Chess',
      'menu.subtitle': 'Chess Game',
      'menu.pvp': 'Player vs Player',
      'menu.pvp.desc': 'Play with a friend on the same device',
      'menu.pvc': 'Player vs Computer',
      'menu.pvc.desc': 'Challenge the artificial intelligence',
      'menu.guide': 'How to Play',
      'menu.settings': 'Settings',
      'menu.difficulty': 'Select Difficulty',
      'menu.easy': 'Easy',
      'menu.easy.desc': 'For beginners',
      'menu.medium': 'Medium',
      'menu.medium.desc': 'Moderate challenge',
      'menu.hard': 'Hard',
      'menu.hard.desc': 'Strong opponent',
      'menu.play': 'Start Game',
      'menu.footer': 'Made by Bao Giang',

      // Game
      'game.white': 'White',
      'game.black': 'Black',
      'game.player1': 'Player 1',
      'game.player2': 'Player 2',
      'game.ai': 'Computer',
      'game.turn.white': "White's turn",
      'game.turn.black': "Black's turn",
      'game.check': 'Check!',
      'game.checkmate': 'Checkmate!',
      'game.stalemate': 'Stalemate!',
      'game.draw': 'Draw!',
      'game.resign': 'Resign',
      'game.undo': 'Undo',
      'game.newgame': 'New Game',
      'game.back': 'Back to Menu',
      'game.moves': 'Move History',
      'game.thinking': 'Computer is thinking',
      'game.promote': 'Choose promotion piece',
      'game.white.wins': 'White wins!',
      'game.black.wins': 'Black wins!',
      'game.draw.result': 'The game is a draw!',
      'game.checkmate.msg': 'Checkmate',
      'game.stalemate.msg': 'No legal moves available',
      'game.resign.msg': 'resigned',
      'game.draw.50': 'Draw by 50-move rule',
      'game.draw.material': 'Draw by insufficient material',
      'game.playagain': 'Play Again',
      'game.confirm.resign': 'Are you sure you want to resign?',
      'game.confirm.newgame': 'Are you sure you want to start a new game?',

      // Settings
      'settings.title': 'Settings',
      'settings.theme': 'Theme',
      'settings.theme.desc': 'Choose light or dark theme',
      'settings.theme.dark': 'Dark',
      'settings.theme.light': 'Light',
      'settings.board': 'Board Colors',
      'settings.board.desc': 'Choose board color scheme',
      'settings.sound': 'Sound',
      'settings.sound.desc': 'Enable or disable sound effects',
      'settings.language': 'Language',
      'settings.language.desc': 'Choose display language',
      'settings.close': 'Close',

      // Guide
      'guide.title': 'How to Play Chess',
      'guide.subtitle': 'Learn from basics to advanced',
      'guide.back': 'Go Back',
      'guide.nav.overview': 'Overview',
      'guide.nav.pieces': 'Pieces',
      'guide.nav.special': 'Special Moves',
      'guide.nav.rules': 'Rules',

      // Guide - Overview
      'guide.overview.title': 'Chess Overview',
      'guide.overview.p1': 'Chess is a two-player strategy game played on an 8×8 board with 64 alternating light and dark squares.',
      'guide.overview.p2': 'Each side starts with 16 pieces: 1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights and 8 Pawns.',
      'guide.overview.p3': 'The goal is to checkmate the opponent\'s king — putting the king under attack with no way to escape.',
      'guide.overview.p4': 'White always moves first. Players alternate turns, moving one piece per turn.',

      // Guide - Pieces
      'guide.king.name': 'King',
      'guide.king.value': 'Value: Priceless',
      'guide.king.desc': 'The King can move one square in any direction (horizontally, vertically, diagonally). The King cannot move into a square attacked by an opponent\'s piece. If the King is checkmated, the game is over.',
      'guide.queen.name': 'Queen',
      'guide.queen.value': 'Value: 9 points',
      'guide.queen.desc': 'The Queen is the most powerful piece, able to move in any direction (horizontally, vertically, diagonally) for any number of squares, as long as not blocked.',
      'guide.rook.name': 'Rook',
      'guide.rook.value': 'Value: 5 points',
      'guide.rook.desc': 'The Rook moves horizontally or vertically for any number of squares. Rooks are very powerful when controlling open ranks and files.',
      'guide.bishop.name': 'Bishop',
      'guide.bishop.value': 'Value: 3 points',
      'guide.bishop.desc': 'The Bishop moves diagonally for any number of squares. Each bishop can only travel on squares of the same color. Two bishops working together are very strong.',
      'guide.knight.name': 'Knight',
      'guide.knight.value': 'Value: 3 points',
      'guide.knight.desc': 'The Knight moves in an L-shape: 2 squares in one direction then 1 square perpendicular. The Knight is the only piece that can jump over other pieces.',
      'guide.pawn.name': 'Pawn',
      'guide.pawn.value': 'Value: 1 point',
      'guide.pawn.desc': 'Pawns move forward one square (or two from their starting position). Pawns capture diagonally. When reaching the last rank, a pawn must be promoted.',

      // Guide - Special Moves
      'guide.castling.title': '🏰 Castling',
      'guide.castling.desc': 'A special move between the King and Rook. The King moves 2 squares toward the Rook, and the Rook jumps over the King to the other side.',
      'guide.castling.c1': 'Neither the King nor the Rook has moved before',
      'guide.castling.c2': 'No pieces between the King and Rook',
      'guide.castling.c3': 'The King is not currently in check',
      'guide.castling.c4': 'The King does not pass through or land on a square under attack',
      'guide.enpassant.title': '⚡ En Passant',
      'guide.enpassant.desc': 'When an opponent\'s pawn advances 2 squares from its starting position and lands beside your pawn, you can capture it by moving diagonally to the square it passed through.',
      'guide.enpassant.c1': 'The opponent\'s pawn just moved 2 squares on the previous turn',
      'guide.enpassant.c2': 'Your pawn is beside the opponent\'s pawn',
      'guide.enpassant.c3': 'Must be done immediately on the next move',
      'guide.promotion.title': '👑 Promotion',
      'guide.promotion.desc': 'When a pawn reaches the last rank (rank 8 for White, rank 1 for Black), it must be promoted to another piece.',
      'guide.promotion.c1': 'Can choose: Queen, Rook, Bishop, or Knight',
      'guide.promotion.c2': 'Usually Queen is chosen as it\'s the most powerful',
      'guide.promotion.c3': 'Promotion is mandatory, you cannot keep the Pawn',

      // Guide - Rules
      'guide.rules.title': 'Rules & Game End',
      'guide.rules.check.title': 'Check',
      'guide.rules.check.desc': 'When the King is under attack by an opponent\'s piece, it\'s called "check". The player must get out of check by: moving the King, blocking the attack, or capturing the attacking piece.',
      'guide.rules.checkmate.title': 'Checkmate',
      'guide.rules.checkmate.desc': 'When the King is in check and there\'s no way to escape. The game ends and the checkmated player loses.',
      'guide.rules.stalemate.title': 'Stalemate',
      'guide.rules.stalemate.desc': 'When it\'s a player\'s turn but they have no legal moves, and the King is NOT in check. The game ends in a draw.',
      'guide.rules.draw.title': 'Other Draws',
      'guide.rules.draw.desc': 'Draw by 50-move rule (50 consecutive moves without any capture or pawn move), or draw by insufficient material (King vs King, King+Bishop vs King, King+Knight vs King).',
    }
  },

  init() {
    const saved = localStorage.getItem('chess-language');
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    }
    this.updateAll();
  },

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('chess-language', lang);
      this.updateAll();
    }
  },

  t(key) {
    const lang = this.translations[this.currentLang];
    if (lang && lang[key] !== undefined) return lang[key];
    const fallback = this.translations['en'];
    if (fallback && fallback[key] !== undefined) return fallback[key];
    return key;
  },

  updateAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
    // Update lang selector UI
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });
  }
};

window.I18N = I18N;
