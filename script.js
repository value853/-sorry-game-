class PuzzleGame {
    constructor(imageUrl, message) {
        this.imageUrl = imageUrl;
        this.message = message;
        this.pieces = [];
        this.currentLevel = 12; // 默认难度
        this.init();
        this.setupControls();
    }

    setupControls() {
        // 难度选择
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentLevel = parseInt(btn.dataset.level);
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.resetGame();
            });
        });

        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }

    resetGame() {
        const container = document.getElementById('puzzle-container');
        container.innerHTML = '';
        document.getElementById('success-message').classList.add('hidden');
        this.updateGridLayout();
        this.init();
    }

    updateGridLayout() {
        const container = document.getElementById('puzzle-container');
        switch(this.currentLevel) {
            case 9:
                container.style.gridTemplateColumns = 'repeat(3, 1fr)';
                break;
            case 16:
                container.style.gridTemplateColumns = 'repeat(4, 1fr)';
                container.style.height = '400px'; // 保持正方形
                break;
            default: // 12块
                container.style.gridTemplateColumns = 'repeat(4, 1fr)';
                container.style.height = '300px';
        }
    }

    init() {
        const container = document.getElementById('puzzle-container');
        const pieces = this.createPieces();
        
        // 打乱拼图顺序
        this.pieces = this.shuffleArray(pieces);
        
        // 渲染拼图
        this.pieces.forEach((piece, index) => {
            container.appendChild(this.createPieceElement(piece, index));
        });

        this.addEventListeners();
    }

    createPieces() {
        const pieces = [];
        for (let i = 0; i < this.currentLevel; i++) {
            pieces.push({
                id: i,
                position: i
            });
        }
        return pieces;
    }

    createPieceElement(piece, index) {
        const element = document.createElement('div');
        element.className = 'puzzle-piece';
        element.dataset.id = piece.id;
        
        // 根据难度计算背景位置
        let cols = this.currentLevel === 9 ? 3 : 4;
        let size = this.currentLevel === 16 ? 100 : (400 / cols);
        const x = (piece.id % cols) * size;
        const y = Math.floor(piece.id / cols) * size;
        
        element.style.backgroundImage = `url(${this.imageUrl})`;
        element.style.backgroundSize = `${cols * 100}% ${this.currentLevel === 16 ? '400%' : '300%'}`;
        element.style.backgroundPosition = `-${x}px -${y}px`;
        
        return element;
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    addEventListeners() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        let selectedPiece = null;

        pieces.forEach(piece => {
            piece.addEventListener('click', () => {
                if (!selectedPiece) {
                    selectedPiece = piece;
                    piece.style.border = '2px solid #07c160';
                } else {
                    // 交换两个片段
                    const tempBackground = selectedPiece.style.backgroundPosition;
                    const tempId = selectedPiece.dataset.id;
                    
                    selectedPiece.style.backgroundPosition = piece.style.backgroundPosition;
                    selectedPiece.dataset.id = piece.dataset.id;
                    
                    piece.style.backgroundPosition = tempBackground;
                    piece.dataset.id = tempId;
                    
                    selectedPiece.style.border = '1px solid #ccc';
                    selectedPiece = null;

                    // 检查是否完成
                    this.checkCompletion();
                }
            });
        });

        // 添加分享按钮事件
        document.getElementById('share-btn').addEventListener('click', () => {
            // 使用原生分享API（这样在手机浏览器中也能分享）
            if (navigator.share) {
                navigator.share({
                    title: '来和我一起玩拼图游戏吧！',
                    text: '这是一个有趣的甲秀楼拼图游戏',
                    url: window.location.href
                });
            } else {
                // 复制链接到剪贴板
                const dummy = document.createElement('input');
                document.body.appendChild(dummy);
                dummy.value = window.location.href;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
                alert('链接已复制，请粘贴给好友！');
            }
        });
    }

    checkCompletion() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        const isComplete = Array.from(pieces).every((piece, index) => 
            parseInt(piece.dataset.id) === index
        );

        if (isComplete) {
            document.getElementById('success-message').classList.remove('hidden');
            document.getElementById('custom-message').textContent = this.message;
        }
    }
}

// 使用示例
const game = new PuzzleGame(
    '甲秀楼图片URL', // 这里需要替换为实际的图片URL
    '恭喜你完成了甲秀楼拼图！这座始建于明朝的古建筑见证了贵阳的历史变迁。'
); 