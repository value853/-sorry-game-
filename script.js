class PuzzleGame {
    constructor(imageUrl, message) {
        this.imageUrl = imageUrl;
        this.message = message;
        this.pieces = [];
        this.currentLevel = 12;
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
                const containerWidth = 400;
                const ratio = this.imageWidth / this.imageHeight;
                this.displayWidth = containerWidth;
                this.displayHeight = containerWidth / ratio;
                
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
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentLevel = parseInt(btn.dataset.level);
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.resetGame();
            });
        });

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
                container.style.height = '400px';
                break;
            default:
                container.style.gridTemplateColumns = 'repeat(4, 1fr)';
                container.style.height = '300px';
        }
    }

    init() {
        const container = document.getElementById('puzzle-container');
        const pieces = this.createPieces();
        this.pieces = this.shuffleArray(pieces);
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
        
        let cols = this.currentLevel === 9 ? 3 : 4;
        let rows = this.currentLevel === 16 ? 4 : 3;
        
        const pieceWidth = this.displayWidth / cols;
        const pieceHeight = this.displayHeight / rows;
        
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
                    const tempBackground = selectedPiece.style.backgroundPosition;
                    const tempId = selectedPiece.dataset.id;
                    
                    selectedPiece.style.backgroundPosition = piece.style.backgroundPosition;
                    selectedPiece.dataset.id = piece.dataset.id;
                    
                    piece.style.backgroundPosition = tempBackground;
                    piece.dataset.id = tempId;
                    
                    selectedPiece.style.border = '1px solid #ccc';
                    selectedPiece = null;

                    this.checkCompletion();
                }
            });
        });

        document.getElementById('share-btn').addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: '星星同学的拼图',
                    text: '来看看我想对你说的话',
                    url: window.location.href
                });
            } else {
                const dummy = document.createElement('input');
                document.body.appendChild(dummy);
                dummy.value = window.location.href;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
                alert('链接已复制，请粘贴给Ta！');
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

// 登录和游戏初始化逻辑
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const loginContainer = document.getElementById('login-container');
    const gameContainer = document.getElementById('game-container');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const customImage = document.getElementById('custom-image');
    const customMessage = document.getElementById('custom-message');
    let imageDataUrl = null;

    // 添加图片预览功能
    customImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageDataUrl = e.target.result;
                document.getElementById('upload-btn').textContent = '已选择图片';
                document.getElementById('upload-btn').style.background = '#4CAF50';
            };
            reader.readAsDataURL(file);
        }
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const message = customMessage.value.trim();
        
        if (username === 'xingxing' && password === 'stars') {
            if (!imageDataUrl) {
                alert('请选择一张图片');
                return;
            }
            if (!message) {
                alert('请输入想说的话');
                return;
            }

            console.log('登录成功');
            const loginTime = new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'});
            recordLogin(loginTime);
            
            loginContainer.style.display = 'none';
            
            setTimeout(() => {
                gameContainer.style.display = 'block';
                gameContainer.classList.remove('hidden');
                
                new PuzzleGame(
                    imageDataUrl,  // 使用用户上传的图片
                    message  // 使用用户输入的文字
                );
            }, 100);
        } else {
            console.log('登录失败');
            alert('用户名或密码错误');
        }
    }

    // 添加登录记录函数
    async function recordLogin(loginTime) {
        try {
            const response = await fetch('https://api.github.com/repos/value853/-sorry-game-/issues', {
                method: 'POST',
                headers: {
                    'Authorization': 'token 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',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    title: `登录记录 - ${loginTime}`,
                    body: `用户登录时间：${loginTime}\n\n登录IP：${await getIP()}`
                })
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API responded with status ${response.status}`);
            }
        } catch (error) {
            console.error('记录登录信息时出错:', error);
        }
    }

    // 获取用户IP
    async function getIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return '未知IP';
        }
    }

    loginBtn.addEventListener('click', handleLogin);

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    gameContainer.style.display = 'none';
    gameContainer.classList.add('hidden');
    loginContainer.style.display = 'flex';
});