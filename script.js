class PuzzleGame {
    constructor(imageUrl, message) {
        this.imageUrl = imageUrl;
        this.message = message;
        this.pieces = [];
        this.currentLevel = 12; // 默认难度
        this.loadImage().then(() => {
            this.init();
            this.setupControls();
        });
    }

    loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageWidth = img.width;
                this.imageHeight = img.height;
                // 计算合适的显示尺寸，保持比例
                const containerWidth = 400;
                const ratio = this.imageWidth / this.imageHeight;
                this.displayWidth = containerWidth;
                this.displayHeight = containerWidth / ratio;
                
                // 更新容器尺寸
                const container = document.getElementById('puzzle-container');
                container.style.width = `${this.displayWidth}px`;
                container.style.height = `${this.displayHeight}px`;
                
                resolve();
            };
            img.onerror = reject;
            img.src = this.imageUrl;
        });
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
        let rows = this.currentLevel === 16 ? 4 : 3;
        
        // 计算每个片段的大小
        const pieceWidth = this.displayWidth / cols;
        const pieceHeight = this.displayHeight / rows;
        
        // 计算背景位置
        const x = (piece.id % cols) * pieceWidth;
        const y = Math.floor(piece.id / cols) * pieceHeight;
        
        element.style.backgroundImage = `url(${this.imageUrl})`;
        element.style.backgroundSize = `${this.displayWidth}px ${this.displayHeight}px`;
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
            this.playCompletionAnimation();
        }
    }

    playCompletionAnimation() {
        const card = document.querySelector('.card');
        card.style.animation = 'popIn 0.5s ease-out';
    }
}

// 使用示例
const game = new PuzzleGame(
    'image2.jpeg',  // 直接使用文件名
    '对不起，我知道我做错了。你的感受我都明白，我应该更细心、更体贴。原谅我好吗？我会努力改正，好好珍惜你。'
); 