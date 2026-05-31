// Wait for DOM to load before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Verify Phaser is loaded
    if (typeof Phaser === 'undefined') {
        console.error('Phaser not loaded!');
        return;
    }

    // Game Configuration
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1200,
            height: 675
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [MenuScene, GameScene, EndingScene]
    };

    // Initialize game
    const game = new Phaser.Game(config);

    // ===== MENU SCENE =====
    class MenuScene extends Phaser.Scene {
        constructor() {
            super('MenuScene');
        }

        create() {
            // Show main menu and hide game UI
            document.getElementById('main-menu').classList.remove('hidden');
            document.getElementById('ui-overlay').style.display = 'none';
            
            // Event listeners
            const startBtn = document.getElementById('start-btn');
            const controlsBtn = document.getElementById('controls-btn');
            const backBtn = document.getElementById('back-btn');
            
            if (startBtn) {
                startBtn.onclick = () => {
                    document.getElementById('main-menu').classList.add('hidden');
                    this.scene.start('GameScene', { level: 0 });
                };
            }
            
            if (controlsBtn) {
                controlsBtn.onclick = () => {
                    document.getElementById('main-menu').classList.add('hidden');
                    document.getElementById('controls-menu').classList.remove('hidden');
                };
            }
            
            if (backBtn) {
                backBtn.onclick = () => {
                    document.getElementById('controls-menu').classList.add('hidden');
                    document.getElementById('main-menu').classList.remove('hidden');
                };
            }
        }
    }

    // ===== GAME SCENE =====
    class GameScene extends Phaser.Scene {
        constructor() {
            super('GameScene');
            this.currentLevel = 0;
            this.score = 0;
            this.health = 100;
            this.isPaused = false;
            this.boostActive = false;
            this.spawnRate = 1500;
            this.levelName = 'Candy Highway';
        }

        init(data) {
            this.currentLevel = data.level || 0;
        }

        create() {
            document.getElementById('ui-overlay').style.display = 'block';
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('pause-menu').classList.add('hidden');
            document.getElementById('level-complete').classList.add('hidden');
            document.getElementById('game-over').classList.add('hidden');
            
            // Create background
            this.createBackground();
            
            // Create player (Mello in car) - use emoji text
            this.player = this.add.text(600, 600, '🍬', { fontSize: '48px' });
            this.physics.add.existing(this.player, false);
            this.player.body.setCollideWorldBounds(true);
            this.player.body.setBounce(0.2);
            this.player.setOrigin(0.5, 0.5);
            
            // Create groups
            this.obstacles = this.physics.add.group();
            this.collectibles = this.physics.add.group();
            
            // Setup level
            this.setupLevel(this.currentLevel);
            
            // Input
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,A,S,D');
            this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
            
            // Physics overlaps
            this.physics.add.overlap(this.player, this.obstacles, (player, obstacle) => this.hitObstacle(obstacle));
            this.physics.add.overlap(this.player, this.collectibles, (player, collectible) => this.collectItem(collectible));
            
            // UI
            this.updateUI();
            this.showDannyDialog();
            
            // Event listeners
            const pauseBtn = document.getElementById('pause-btn');
            const resumeBtn = document.getElementById('resume-btn');
            const menuBtn = document.getElementById('menu-btn');
            const menuBtn2 = document.getElementById('menu-btn-2');
            const restartBtn = document.getElementById('restart-btn');
            const nextLevelBtn = document.getElementById('next-level-btn');
            
            if (pauseBtn) pauseBtn.onclick = () => this.togglePause();
            if (resumeBtn) resumeBtn.onclick = () => this.togglePause();
            if (menuBtn) menuBtn.onclick = () => this.backToMenu();
            if (menuBtn2) menuBtn2.onclick = () => this.backToMenu();
            if (restartBtn) restartBtn.onclick = () => this.restartLevel();
            if (nextLevelBtn) nextLevelBtn.onclick = () => this.nextLevel();
            
            this.pKey.on('down', () => this.togglePause());
            this.spaceBar.on('down', () => this.activateBoost());
            
            // Start spawning
            this.spawnObstacleTimer = this.time.addEvent({
                delay: this.spawnRate,
                callback: () => this.spawnObstacle(),
                loop: true
            });
            
            this.spawnCollectibleTimer = this.time.addEvent({
                delay: this.spawnRate + 500,
                callback: () => this.spawnCollectible(),
                loop: true
            });
        }

        createBackground() {
            const colors = [0x2d0052, 0x1a0066, 0x330033];
            const bgColor = colors[this.currentLevel % 3];
            this.add.rectangle(600, 337.5, 1200, 675).setFillStyle(bgColor).setDepth(-2);
            
            // Add stars
            for (let i = 0; i < 20; i++) {
                const star = this.add.text(
                    Phaser.Math.Between(0, 1200),
                    Phaser.Math.Between(0, 337.5),
                    '⭐',
                    { fontSize: '12px' }
                );
                star.setAlpha(0.6);
                star.setDepth(-1);
            }
            
            // Add hearts
            for (let i = 0; i < 5; i++) {
                const heart = this.add.text(
                    Phaser.Math.Between(0, 1200),
                    Phaser.Math.Between(0, 675),
                    '💛',
                    { fontSize: '20px' }
                );
                heart.setAlpha(0.3);
                heart.setDepth(-1);
                this.tweens.add({
                    targets: heart,
                    y: heart.y - 100,
                    alpha: 0,
                    duration: 3000 + Phaser.Math.Between(0, 2000),
                    repeat: -1
                });
            }
        }

        setupLevel(level) {
            const levels = [
                { name: 'Candy Highway', spawnRate: 1500 },
                { name: 'Chaos City', spawnRate: 1200 },
                { name: 'Purple Sunset Run', spawnRate: 1000 },
                { name: 'Friendship Gauntlet', spawnRate: 800 }
            ];
            
            const currentLevelData = levels[level % levels.length];
            this.levelName = currentLevelData.name;
            this.spawnRate = currentLevelData.spawnRate;
            
            document.getElementById('level-display').textContent = `Level: ${this.levelName}`;
            
            // Draw finish line
            const finishLine = this.add.rectangle(600, 50, 1200, 10);
            finishLine.setFillStyle(0xffff00);
            this.physics.add.existing(finishLine, true);
            this.finishLineSprite = finishLine;
            
            this.physics.add.overlap(this.player, this.finishLineSprite, () => this.levelComplete());
        }

        spawnObstacle() {
            if (this.isPaused) return;
            
            const obstacles = ['🍬', '🍭', '🛒', '🚗', '🍩'];
            const obs = obstacles[Phaser.Math.Between(0, obstacles.length - 1)];
            const x = Phaser.Math.Between(100, 1100);
            const obstacle = this.add.text(x, 0, obs, { fontSize: '32px' });
            obstacle.setOrigin(0.5, 0.5);
            
            this.physics.add.existing(obstacle, false);
            obstacle.body.setVelocityY(Phaser.Math.Between(200, 300));
            obstacle.body.setBounce(0.5);
            this.obstacles.add(obstacle);
            
            // Remove when off screen
            this.time.delayedCall(5000, () => {
                if (obstacle && obstacle.active) obstacle.destroy();
            });
        }

        spawnCollectible() {
            if (this.isPaused) return;
            
            const items = ['⭐', '🍫', '💫'];
            const item = items[Phaser.Math.Between(0, items.length - 1)];
            const x = Phaser.Math.Between(100, 1100);
            const collectible = this.add.text(x, -50, item, { fontSize: '24px' });
            collectible.setOrigin(0.5, 0.5);
            
            this.physics.add.existing(collectible, false);
            collectible.body.setVelocityY(150);
            this.collectibles.add(collectible);
            
            // Remove when off screen
            this.time.delayedCall(5000, () => {
                if (collectible && collectible.active) collectible.destroy();
            });
        }

        hitObstacle(obstacle) {
            this.health -= 10;
            this.createExplosion(obstacle.x, obstacle.y);
            obstacle.destroy();
            this.playSound('hit');
            
            if (this.health <= 0) {
                this.gameOver();
            }
            this.updateUI();
        }

        collectItem(collectible) {
            this.score += 10;
            this.createConfetti(collectible.x, collectible.y);
            collectible.destroy();
            this.playSound('collect');
            this.showDannyDialog();
            this.updateUI();
        }

        activateBoost() {
            if (!this.boostActive) {
                this.boostActive = true;
                this.player.body.setDrag(0.5);
                this.time.delayedCall(300, () => {
                    this.boostActive = false;
                    this.player.body.setDrag(0);
                });
            }
        }

        update() {
            if (this.isPaused) return;
            
            // Player movement
            let velocityX = 0;
            let velocityY = 0;
            
            if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -300;
            if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = 300;
            if (this.cursors.up.isDown || this.wasd.W.isDown) velocityY = -300;
            if (this.cursors.down.isDown || this.wasd.S.isDown) velocityY = 300;
            
            this.player.body.setVelocity(velocityX, velocityY);
        }

        updateUI() {
            const scoreDisplay = document.getElementById('score-display');
            const healthFill = document.getElementById('health-fill');
            
            if (scoreDisplay) scoreDisplay.textContent = `Score: ${this.score}`;
            if (healthFill) healthFill.style.width = `${Math.max(0, this.health)}%`;
        }

        showDannyDialog() {
            const dialogs = [
                "Mello, incoming donut!",
                "This feels unsafe.",
                "Actually we're doing amazing.",
                "Best road trip ever.",
                "You got this!",
                "Friendship level increased.",
                "Danny believes in you.",
                "Mello and Danny against the world!"
            ];
            
            const dialog = dialogs[Phaser.Math.Between(0, dialogs.length - 1)];
            const dannyText = document.getElementById('danny-text');
            if (dannyText) dannyText.textContent = dialog;
            
            this.time.delayedCall(3000, () => {
                if (dannyText) dannyText.textContent = '';
            });
        }

        createExplosion(x, y) {
            for (let i = 0; i < 10; i++) {
                const particle = this.add.text(x, y, '✨', { fontSize: '16px' });
                this.physics.add.existing(particle, false);
                const angle = (Math.PI * 2 * i) / 10;
                particle.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
                this.time.delayedCall(500, () => {
                    if (particle && particle.active) particle.destroy();
                });
            }
        }

        createConfetti(x, y) {
            const confetti = ['🎉', '✨', '💫', '⭐'];
            for (let i = 0; i < 5; i++) {
                const particle = this.add.text(x + Phaser.Math.Between(-20, 20), y, confetti[i % 4], { fontSize: '20px' });
                this.physics.add.existing(particle, false);
                particle.body.setVelocityY(-150 - Phaser.Math.Between(0, 100));
                particle.body.setVelocityX(Phaser.Math.Between(-100, 100));
                this.time.delayedCall(1000, () => {
                    if (particle && particle.active) particle.destroy();
                });
            }
        }

        playSound(type) {
            if (window.gameAudio) {
                window.gameAudio.playSound(type);
            }
        }

        togglePause() {
            this.isPaused = !this.isPaused;
            const pauseMenu = document.getElementById('pause-menu');
            if (pauseMenu) {
                if (this.isPaused) {
                    pauseMenu.classList.remove('hidden');
                } else {
                    pauseMenu.classList.add('hidden');
                }
            }
        }

        levelComplete() {
            this.physics.pause();
            const levelComplete = document.getElementById('level-complete');
            if (levelComplete) {
                levelComplete.classList.remove('hidden');
                const text = document.getElementById('level-complete-text');
                const score = document.getElementById('level-score');
                if (text) text.textContent = `You and Danny made it through ${this.levelName}!`;
                if (score) score.textContent = `Score: ${this.score}`;
            }
        }

        gameOver() {
            this.physics.pause();
            const gameOver = document.getElementById('game-over');
            if (gameOver) {
                gameOver.classList.remove('hidden');
                const msg = document.getElementById('final-message');
                const score = document.getElementById('final-score');
                if (msg) msg.textContent = 'Keep trying! Mello and Danny believe in you!';
                if (score) score.textContent = `Final Score: ${this.score}`;
            }
        }

        nextLevel() {
            const levelComplete = document.getElementById('level-complete');
            if (levelComplete) levelComplete.classList.add('hidden');
            
            if (this.currentLevel + 1 >= 4) {
                this.scene.start('EndingScene', { finalScore: this.score });
            } else {
                this.scene.restart({ level: this.currentLevel + 1 });
            }
        }

        restartLevel() {
            const gameOver = document.getElementById('game-over');
            if (gameOver) gameOver.classList.add('hidden');
            this.scene.restart({ level: this.currentLevel });
        }

        backToMenu() {
            const pauseMenu = document.getElementById('pause-menu');
            const gameOver = document.getElementById('game-over');
            if (pauseMenu) pauseMenu.classList.add('hidden');
            if (gameOver) gameOver.classList.add('hidden');
            this.scene.start('MenuScene');
        }
    }

    // ===== ENDING SCENE =====
    class EndingScene extends Phaser.Scene {
        constructor() {
            super('EndingScene');
        }

        init(data) {
            this.finalScore = data.finalScore || 0;
        }

        create() {
            document.getElementById('ui-overlay').style.display = 'none';
            const endingScene = document.getElementById('ending-scene');
            if (endingScene) endingScene.classList.remove('hidden');
            
            // Add stars
            const starsContainer = document.querySelector('.stars-background');
            if (starsContainer) {
                starsContainer.innerHTML = '';
                for (let i = 0; i < 50; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    star.textContent = '⭐';
                    star.style.left = Math.random() * 100 + '%';
                    star.style.top = Math.random() * 100 + '%';
                    star.style.animationDelay = (Math.random() * 2) + 's';
                    starsContainer.appendChild(star);
                }
            }
            
            const endingRestart = document.getElementById('ending-restart');
            if (endingRestart) {
                endingRestart.onclick = () => {
                    const endingScene = document.getElementById('ending-scene');
                    if (endingScene) endingScene.classList.add('hidden');
                    this.scene.start('MenuScene');
                };
            }
        }
    }
});

// Hide all menus on load
window.addEventListener('load', () => {
    const menus = ['pause-menu', 'level-complete', 'game-over', 'controls-menu', 'ending-scene'];
    menus.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
});
