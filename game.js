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
        document.getElementById('start-btn').onclick = () => {
            document.getElementById('main-menu').classList.add('hidden');
            this.scene.start('GameScene', { level: 0 });
        };
        
        document.getElementById('controls-btn').onclick = () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('controls-menu').classList.remove('hidden');
        };
        
        document.getElementById('back-btn').onclick = () => {
            document.getElementById('controls-menu').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        };
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
        
        // Create player (Mello in car)
        this.player = this.physics.add.sprite(600, 600, null);
        this.player.setDisplaySize(60, 40);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        
        // Create groups
        this.obstacles = this.physics.add.group();
        this.collectibles = this.physics.add.group();
        this.particles = this.add.group();
        
        // Create level
        this.levelName = this.createLevel(this.currentLevel);
        document.getElementById('level-display').textContent = `Level: ${this.levelName}`;
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        
        // Physics
        this.physics.add.overlap(this.player, this.obstacles, (player, obstacle) => this.hitObstacle(obstacle));
        this.physics.add.overlap(this.player, this.collectibles, (player, collectible) => this.collectItem(collectible));
        
        // UI
        this.updateUI();
        this.showDannyDialog();
        
        // Event listeners
        document.getElementById('pause-btn').onclick = () => this.togglePause();
        document.getElementById('resume-btn').onclick = () => this.togglePause();
        document.getElementById('menu-btn').onclick = () => this.backToMenu();
        document.getElementById('menu-btn-2').onclick = () => this.backToMenu();
        document.getElementById('restart-btn').onclick = () => this.restartLevel();
        document.getElementById('next-level-btn').onclick = () => this.nextLevel();
        
        this.pKey.on('down', () => this.togglePause());
        this.spaceBar.on('down', () => this.activateBoost());
    }

    createBackground() {
        const levelBg = ['#2d0052', '#1a0066', '#330033'][this.currentLevel % 3];
        this.add.rectangle(600, 337.5, 1200, 675).setFillStyle(Phaser.Display.Color.HexStringToColor(levelBg).color);
        
        // Add parallax stars
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

    createLevel(level) {
        const levels = [
            { name: 'Candy Highway', spawnRate: 1500 },
            { name: 'Chaos City', spawnRate: 1200 },
            { name: 'Purple Sunset Run', spawnRate: 1000 },
            { name: 'Friendship Gauntlet', spawnRate: 800 }
        ];
        
        const currentLevel = levels[level % levels.length];
        this.spawnRate = currentLevel.spawnRate;
        this.finishLine = 100;
        
        // Draw finish line
        const finishLine = this.add.rectangle(600, this.finishLine, 1200, 10);
        finishLine.setFillStyle(0xffff00);
        this.physics.add.existing(finishLine, true);
        this.finishLine = finishLine;
        
        this.physics.add.overlap(this.player, this.finishLine, () => this.levelComplete());
        
        // Spawn obstacles and collectibles
        this.time.addEvent({
            delay: this.spawnRate,
            callback: () => this.spawnObstacle(),
            loop: true
        });
        
        this.time.addEvent({
            delay: this.spawnRate + 500,
            callback: () => this.spawnCollectible(),
            loop: true
        });
        
        return currentLevel.name;
    }

    spawnObstacle() {
        if (this.isPaused) return;
        
        const obstacles = ['🍬', '🍭', '🛒', '🚗', '🍩'];
        const obs = obstacles[Phaser.Math.Between(0, obstacles.length - 1)];
        const x = Phaser.Math.Between(100, 1100);
        const obstacle = this.add.text(x, 0, obs, { fontSize: '32px' });
        
        this.physics.add.existing(obstacle, false);
        obstacle.body.setVelocityY(Phaser.Math.Between(200, 300));
        obstacle.body.setBounce(0.5);
        this.obstacles.add(obstacle);
        
        // Remove when off screen
        this.time.addEvent({
            delay: 5000,
            callback: () => obstacle.destroy()
        });
    }

    spawnCollectible() {
        if (this.isPaused) return;
        
        const items = ['⭐', '🍫', '💫'];
        const item = items[Phaser.Math.Between(0, items.length - 1)];
        const x = Phaser.Math.Between(100, 1100);
        const collectible = this.add.text(x, -50, item, { fontSize: '24px' });
        
        this.physics.add.existing(collectible, false);
        collectible.body.setVelocityY(150);
        this.collectibles.add(collectible);
        
        // Remove when off screen
        this.time.addEvent({
            delay: 5000,
            callback: () => collectible.destroy()
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
        
        // Rotate player based on movement
        if (velocityX !== 0 || velocityY !== 0) {
            this.player.setRotation(Math.atan2(velocityY, velocityX));
        }
    }

    updateUI() {
        document.getElementById('score-display').textContent = `Score: ${this.score}`;
        const healthPercent = Math.max(0, this.health);
        document.getElementById('health-fill').style.width = `${healthPercent}%`;
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
        document.getElementById('danny-text').textContent = dialog;
        
        // Fade out after 3 seconds
        this.time.delayedCall(3000, () => {
            document.getElementById('danny-text').textContent = '';
        });
    }

    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            const particle = this.add.text(x, y, '✨', { fontSize: '16px' });
            this.physics.add.existing(particle, false);
            const angle = (Math.PI * 2 * i) / 10;
            particle.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
            this.time.delayedCall(500, () => particle.destroy());
        }
    }

    createConfetti(x, y) {
        const confetti = ['🎉', '✨', '💫', '⭐'];
        for (let i = 0; i < 5; i++) {
            const particle = this.add.text(x + Phaser.Math.Between(-20, 20), y, confetti[i % 4], { fontSize: '20px' });
            this.physics.add.existing(particle, false);
            particle.body.setVelocityY(-150 - Phaser.Math.Between(0, 100));
            particle.body.setVelocityX(Phaser.Math.Between(-100, 100));
            this.time.delayedCall(1000, () => particle.destroy());
        }
    }

    playSound(type) {
        // Sound will be generated by sounds.js
        if (window.gameAudio) {
            window.gameAudio.playSound(type);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            document.getElementById('pause-menu').classList.remove('hidden');
        } else {
            document.getElementById('pause-menu').classList.add('hidden');
        }
    }

    levelComplete() {
        this.physics.pause();
        document.getElementById('level-complete').classList.remove('hidden');
        document.getElementById('level-complete-text').textContent = `You and Danny made it through ${this.levelName}!`;
        document.getElementById('level-score').textContent = `Score: ${this.score}`;
    }

    gameOver() {
        this.physics.pause();
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-message').textContent = 'Keep trying! Mello and Danny believe in you!';
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
    }

    nextLevel() {
        document.getElementById('level-complete').classList.add('hidden');
        if (this.currentLevel + 1 >= 4) {
            // Go to ending scene
            this.scene.start('EndingScene', { finalScore: this.score });
        } else {
            this.scene.restart({ level: this.currentLevel + 1 });
        }
    }

    restartLevel() {
        document.getElementById('game-over').classList.add('hidden');
        this.scene.restart({ level: this.currentLevel });
    }

    backToMenu() {
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
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
        document.getElementById('ending-scene').classList.remove('hidden');
        
        // Add stars to background
        const starsContainer = document.querySelector('.stars-background');
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
        
        // Event listeners
        document.getElementById('ending-restart').onclick = () => {
            document.getElementById('ending-scene').classList.add('hidden');
            this.scene.start('MenuScene');
        };
    }
}

// Hide all menus on start
window.addEventListener('load', () => {
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('level-complete').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('controls-menu').classList.add('hidden');
    document.getElementById('ending-scene').classList.add('hidden');
});