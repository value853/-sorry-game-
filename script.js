class PuzzleGame {
    constructor(imageUrl, message, timeLimit) {
        this.imageUrl = imageUrl;
        this.message = message;
        this.timeLimit = parseInt(timeLimit);
        this.timer = null;
        this.pieces = [];
        this.currentLevel = 12;
        
        // 初始化音乐
        this.initMusic();
        
        this.loadImage().then(() => {
            this.init();
            this.setupControls();
            this.startTimer();
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
                const level = parseInt(btn.dataset.level);
                this.currentLevel = level;
                
                // 根据难度设置时间
                switch(level) {
                    case 9:  // 简单
                        this.timeLimit = 60;  // 1分钟
                        break;
                    case 16: // 困难
                        this.timeLimit = 180; // 3分钟
                        break;
                    default: // 中等
                        this.timeLimit = 120; // 2分钟
                }
                
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
        clearInterval(this.timer);
        const container = document.getElementById('puzzle-container');
        container.innerHTML = '';
        document.getElementById('success-message').classList.add('hidden');
        
        // 重置计时器显示
        const countdownEl = document.getElementById('countdown');
        this.updateTimerDisplay(this.timeLimit, countdownEl);
        
        this.updateGridLayout();
        this.init();
        this.startTimer();
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

    initMusic() {
        const music = document.getElementById('bgMusic');
        const musicBtn = document.getElementById('musicToggle');
        
        musicBtn.addEventListener('click', () => {
            if (music.paused) {
                music.play();
                musicBtn.classList.add('playing');
            } else {
                music.pause();
                musicBtn.classList.remove('playing');
            }
        });
    }

    startTimer() {
        let timeLeft = this.timeLimit;
        const countdownEl = document.getElementById('countdown');
        
        // 立即显示初始时间
        this.updateTimerDisplay(timeLeft, countdownEl);
        
        this.timer = setInterval(() => {
            timeLeft--;
            if (timeLeft >= 0) {
                this.updateTimerDisplay(timeLeft, countdownEl);
            }
            if (timeLeft <= 0) {
                this.gameOver(false);
            }
        }, 1000);
    }

    updateTimerDisplay(timeLeft, element) {
        if (typeof timeLeft !== 'number') {
            console.error('Invalid timeLeft value:', timeLeft);
            return;
        }
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        element.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    gameOver(success) {
        clearInterval(this.timer);
        
        if (success) {
            console.log('===== 游戏完成阶段 =====');
            console.log('当前实例:', this);
            console.log('保存的消息:', this.message);
            
            const successMessage = document.getElementById('success-message');
            const messageElement = document.getElementById('custom-message');
            
            console.log('消息元素:', messageElement);
            console.log('消息元素当前内容:', messageElement.textContent);
            
            // 尝试多种方式设置消息
            try {
                messageElement.textContent = this.message;
                messageElement.innerHTML = this.message;
                
                // 强制更新显示
                setTimeout(() => {
                    console.log('===== 显示更新后 =====');
                    console.log('元素可见性:', messageElement.style.display);
                    console.log('元素内容:', messageElement.textContent);
                    console.log('元素HTML:', messageElement.innerHTML);
                    
                    // 确保元素可见
                    messageElement.style.display = 'block';
                    successMessage.style.display = 'block';
                    successMessage.classList.remove('hidden');
                }, 100);
            } catch (error) {
                console.error('设置消息时出错:', error);
            }
        } else {
            alert('时间到！游戏结束');
            this.resetGame();
        }
    }

    checkCompletion() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        const isComplete = Array.from(pieces).every((piece, index) => 
            parseInt(piece.dataset.id) === index
        );

        if (isComplete) {
            this.gameOver(true);
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

    // 在图片预览功能中添加预览图更新
    customImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageDataUrl = e.target.result;
                // 更新上传按钮状态
                document.getElementById('upload-btn').textContent = '已选择图片';
                document.getElementById('upload-btn').style.background = '#4CAF50';
                
                // 更新登录页预览图
                const loginPreviewImage = document.getElementById('login-preview-image');
                loginPreviewImage.src = imageDataUrl;
                loginPreviewImage.parentElement.style.display = 'block';
                
                // 更新游戏页预览图（移除模糊效果）
                const previewImage = document.getElementById('preview-image');
                previewImage.src = imageDataUrl;
            };
            reader.readAsDataURL(file);
        }
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const message = customMessage.value.trim();
        
        if (username === 'xingxing' && password === 'stars') {
            // 检查消息内容
            console.log('===== 登录阶段 =====');
            console.log('原始消息:', customMessage.value);
            console.log('处理后消息:', message);
            console.log('消息长度:', message.length);
            console.log('消息类型:', typeof message);

            if (!imageDataUrl) {
                alert('请选择一张图片');
                return;
            }
            if (!message) {
                alert('请输入想说的话');
                return;
            }

            // 创建游戏实例时检查
            setTimeout(() => {
                // ... 其他代码 ...
                
                // 创建游戏实例
                window.currentGame = new PuzzleGame(
                    imageDataUrl,
                    message,
                    timeLimit
                );
                
                console.log('===== 游戏创建阶段 =====');
                console.log('游戏实例:', window.currentGame);
                console.log('保存的消息:', window.currentGame.message);
            }, 100);
        } else {
            alert('用户名或密码错误');
        }
    }

    // 添加登录记录函数
    async function recordLogin(loginTime) {
        try {
            const response = await fetch('https://api.github.com/repos/value853/-sorry-game-/issues', {
                method: 'POST',
                headers: {
                    'Authorization': 'token YOUR_NEW_TOKEN',
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

    // 初始状态设置
    gameContainer.style.display = 'none';
    gameContainer.classList.add('hidden');
    loginContainer.style.display = 'flex';
    
    // 清除预览图
    document.getElementById('preview-image').src = '';

    // 检查关键元素
    console.log('===== 页面加载检查 =====');
    console.log('成功消息容器:', document.getElementById('success-message'));
    console.log('消息元素:', document.getElementById('custom-message'));
});