// Mickey's 3D Adventure - Advanced 3D Game Engine

class Game3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.player = null;
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        this.particles = [];
        this.lights = [];
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // 3D settings
        this.gravity = -0.02;
        this.jumpPower = 0.8;
        this.playerSpeed = 0.15;
        this.runSpeed = 0.25;
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.cameraMode = 'follow'; // 'follow' or 'orbit'
        
        // Performance
        this.clock = new THREE.Clock();
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = 0;
        
        this.setupEventListeners();
        this.init();
    }
    
    async init() {
        this.updateLoadingProgress(10, 'Initializing 3D engine...');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        
        this.updateLoadingProgress(20, 'Setting up camera...');
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 20);
        
        this.updateLoadingProgress(30, 'Creating renderer...');
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB, 1);
        
        const gameCanvas = document.getElementById('gameCanvas');
        gameCanvas.appendChild(this.renderer.domElement);
        
        this.updateLoadingProgress(40, 'Setting up controls...');
        
        // Setup controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        this.updateLoadingProgress(50, 'Creating lighting...');
        
        // Create lighting
        this.createLighting();
        
        this.updateLoadingProgress(60, 'Building 3D world...');
        
        // Create 3D world
        await this.createWorld();
        
        this.updateLoadingProgress(80, 'Creating player...');
        
        // Create player
        this.createPlayer();
        
        this.updateLoadingProgress(90, 'Finalizing...');
        
        // Setup game
        this.setupGame();
        
        this.updateLoadingProgress(100, 'Ready to play!');
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 1000);
        
        // Start game loop
        this.gameLoop();
    }
    
    updateLoadingProgress(progress, text) {
        document.getElementById('loadingProgress').style.width = progress + '%';
        document.getElementById('loadingText').textContent = text;
    }
    
    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0xff6b35, 1, 50);
        pointLight1.position.set(-20, 10, -20);
        this.scene.add(pointLight1);
        this.lights.push(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x4ecdc4, 1, 50);
        pointLight2.position.set(20, 10, 20);
        this.scene.add(pointLight2);
        this.lights.push(pointLight2);
    }
    
    async createWorld() {
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Create skybox
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        
        // Create platforms
        await this.createPlatforms();
        
        // Create collectibles
        await this.createCollectibles();
        
        // Create enemies
        await this.createEnemies();
        
        // Create decorative elements
        this.createDecorations();
    }
    
    async createPlatforms() {
        const platformPositions = [
            { x: 0, y: 0, z: 0, width: 40, height: 2, depth: 40, color: 0x8B4513 },
            { x: -30, y: 5, z: -20, width: 20, height: 2, depth: 20, color: 0x228B22 },
            { x: 30, y: 8, z: -15, width: 25, height: 2, depth: 25, color: 0x228B22 },
            { x: 0, y: 12, z: -40, width: 30, height: 2, depth: 30, color: 0x228B22 },
            { x: -40, y: 15, z: 0, width: 15, height: 2, depth: 15, color: 0x228B22 },
            { x: 40, y: 18, z: 20, width: 20, height: 2, depth: 20, color: 0x228B22 }
        ];
        
        for (const pos of platformPositions) {
            const platform = this.createPlatform(pos);
            this.platforms.push(platform);
            this.scene.add(platform);
        }
    }
    
    createPlatform(config) {
        const geometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
        const material = new THREE.MeshLambertMaterial({ color: config.color });
        const platform = new THREE.Mesh(geometry, material);
        
        platform.position.set(config.x, config.y, config.z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        
        // Add platform data for collision detection
        platform.userData = {
            type: 'platform',
            width: config.width,
            height: config.height,
            depth: config.depth
        };
        
        return platform;
    }
    
    async createCollectibles() {
        const collectiblePositions = [
            { x: -15, y: 7, z: -20 },
            { x: 15, y: 10, z: -15 },
            { x: 0, y: 14, z: -40 },
            { x: -20, y: 17, z: 0 },
            { x: 20, y: 20, z: 20 },
            { x: -10, y: 3, z: 10 },
            { x: 10, y: 6, z: 15 },
            { x: 0, y: 9, z: -10 }
        ];
        
        for (const pos of collectiblePositions) {
            const collectible = this.createCollectible(pos);
            this.collectibles.push(collectible);
            this.scene.add(collectible);
        }
    }
    
    createCollectible(position) {
        // Create cheese wedge geometry
        const cheeseGeometry = new THREE.ConeGeometry(2, 4, 4);
        const cheeseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFD700,
            emissive: 0x444400
        });
        const cheese = new THREE.Mesh(cheeseGeometry, cheeseMaterial);
        
        cheese.position.set(position.x, position.y, position.z);
        cheese.rotation.y = Math.PI / 4;
        cheese.castShadow = true;
        
        // Add collectible data
        cheese.userData = {
            type: 'collectible',
            collected: false,
            rotationSpeed: 0.02
        };
        
        return cheese;
    }
    
    async createEnemies() {
        const enemyPositions = [
            { x: -25, y: 1, z: -20, patrolDistance: 20 },
            { x: 25, y: 1, z: -15, patrolDistance: 20 },
            { x: 0, y: 1, z: -35, patrolDistance: 15 }
        ];
        
        for (const pos of enemyPositions) {
            const enemy = this.createEnemy(pos);
            this.enemies.push(enemy);
            this.scene.add(enemy);
        }
    }
    
    createEnemy(config) {
        // Create cat body
        const bodyGeometry = new THREE.SphereGeometry(1.5, 8, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Create cat head
        const headGeometry = new THREE.SphereGeometry(1, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        
        // Create cat ears
        const earGeometry = new THREE.ConeGeometry(0.3, 0.8, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.5, 2.2, 0);
        leftEar.rotation.z = -0.3;
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.5, 2.2, 0);
        rightEar.rotation.z = 0.3;
        
        // Group all parts
        const enemy = new THREE.Group();
        enemy.add(body);
        enemy.add(head);
        enemy.add(leftEar);
        enemy.add(rightEar);
        
        enemy.position.set(config.x, config.y, config.z);
        enemy.castShadow = true;
        
        // Add enemy data
        enemy.userData = {
            type: 'enemy',
            startX: config.x,
            patrolDistance: config.patrolDistance,
            direction: 1,
            speed: 0.05
        };
        
        return enemy;
    }
    
    createDecorations() {
        // Create trees
        for (let i = 0; i < 10; i++) {
            const tree = this.createTree();
            tree.position.set(
                (Math.random() - 0.5) * 150,
                0,
                (Math.random() - 0.5) * 150
            );
            this.scene.add(tree);
        }
        
        // Create clouds
        for (let i = 0; i < 8; i++) {
            const cloud = this.createCloud();
            cloud.position.set(
                (Math.random() - 0.5) * 200,
                80 + Math.random() * 40,
                (Math.random() - 0.5) * 200
            );
            this.scene.add(cloud);
        }
    }
    
    createTree() {
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        
        const leavesGeometry = new THREE.SphereGeometry(4, 8, 6);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 6;
        
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);
        
        trunk.castShadow = true;
        leaves.castShadow = true;
        
        return tree;
    }
    
    createCloud() {
        const cloudGeometry = new THREE.SphereGeometry(3, 8, 6);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        
        return cloud;
    }
    
    createPlayer() {
        // Create Mickey's body
        const bodyGeometry = new THREE.SphereGeometry(1.5, 8, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Create Mickey's head
        const headGeometry = new THREE.SphereGeometry(2, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.5;
        
        // Create Mickey's ears
        const earGeometry = new THREE.SphereGeometry(1, 8, 6);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-1.5, 3.5, 0);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(1.5, 3.5, 0);
        
        // Create Mickey's face
        const eyeGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.8, 2.8, 1.5);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.8, 2.8, 1.5);
        
        // Create Mickey's nose
        const noseGeometry = new THREE.SphereGeometry(0.4, 8, 6);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 2.2, 1.8);
        
        // Group all parts
        this.player = new THREE.Group();
        this.player.add(body);
        this.player.add(head);
        this.player.add(leftEar);
        this.player.add(rightEar);
        this.player.add(leftEye);
        this.player.add(rightEye);
        this.player.add(nose);
        
        this.player.position.set(0, 5, 0);
        this.player.castShadow = true;
        
        // Add player data
        this.player.userData = {
            type: 'player',
            velocity: new THREE.Vector3(0, 0, 0),
            onGround: false,
            health: 100
        };
        
        this.scene.add(this.player);
    }
    
    setupGame() {
        this.updateUI();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' && this.gameRunning && !this.gamePaused) {
                this.playerJump();
            }
            
            if (e.code === 'KeyR') {
                this.restartLevel();
            }
            
            if (e.code === 'KeyC') {
                this.toggleCameraMode();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartLevel());
        document.getElementById('cameraBtn').addEventListener('click', () => this.toggleCameraMode());
        document.getElementById('overlayBtn').addEventListener('click', () => this.startGame());
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    playerJump() {
        if (this.player.userData.onGround) {
            this.player.userData.velocity.y = this.jumpPower;
            this.player.userData.onGround = false;
        }
    }
    
    toggleCameraMode() {
        this.cameraMode = this.cameraMode === 'follow' ? 'orbit' : 'follow';
        if (this.cameraMode === 'orbit') {
            this.controls.enabled = true;
        } else {
            this.controls.enabled = false;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.gamePaused = false;
        document.getElementById('gameOverlay').classList.add('hidden');
        document.getElementById('pauseBtn').textContent = 'Pause';
    }
    
    togglePause() {
        if (this.gameRunning && !this.gameOver) {
            this.gamePaused = !this.gamePaused;
            document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Resume' : 'Pause';
        }
    }
    
    restartLevel() {
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gamePaused = false;
        this.player.position.set(0, 5, 0);
        this.player.userData.velocity.set(0, 0, 0);
        this.updateUI();
        document.getElementById('pauseBtn').textContent = 'Pause';
    }
    
    updatePlayer() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        const moveVector = new THREE.Vector3(0, 0, 0);
        const speed = this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? this.runSpeed : this.playerSpeed;
        
        // WASD movement
        if (this.keys['KeyW']) moveVector.z -= speed;
        if (this.keys['KeyS']) moveVector.z += speed;
        if (this.keys['KeyA']) moveVector.x -= speed;
        if (this.keys['KeyD']) moveVector.x += speed;
        if (this.keys['KeyQ']) moveVector.x -= speed * 0.7;
        if (this.keys['KeyE']) moveVector.x += speed * 0.7;
        
        // Apply movement
        this.player.position.add(moveVector);
        
        // Apply gravity
        this.player.userData.velocity.y += this.gravity;
        this.player.position.y += this.player.userData.velocity.y;
        
        // Check platform collisions
        this.checkPlatformCollisions();
        
        // Update camera
        this.updateCamera();
    }
    
    checkPlatformCollisions() {
        this.player.userData.onGround = false;
        
        for (const platform of this.platforms) {
            const playerBox = new THREE.Box3().setFromObject(this.player);
            const platformBox = new THREE.Box3().setFromObject(platform);
            
            if (playerBox.intersectsBox(platformBox)) {
                if (this.player.userData.velocity.y > 0 && this.player.position.y > platform.position.y) {
                    this.player.position.y = platform.position.y + platform.userData.height / 2 + 2.5;
                    this.player.userData.velocity.y = 0;
                    this.player.userData.onGround = true;
                }
            }
        }
        
        // Check boundaries
        if (this.player.position.y < -10) {
            this.loseLife();
        }
    }
    
    updateCamera() {
        if (this.cameraMode === 'follow') {
            const targetPosition = this.player.position.clone();
            targetPosition.y += 8;
            targetPosition.z += 15;
            
            this.camera.position.lerp(targetPosition, 0.05);
            this.camera.lookAt(this.player.position);
        }
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            // Move enemy
            enemy.position.x += enemy.userData.speed * enemy.userData.direction;
            
            // Change direction at patrol boundaries
            if (enemy.position.x <= enemy.userData.startX - enemy.userData.patrolDistance / 2 ||
                enemy.position.x >= enemy.userData.startX + enemy.userData.patrolDistance / 2) {
                enemy.userData.direction *= -1;
            }
            
            // Check collision with player
            const playerBox = new THREE.Box3().setFromObject(this.player);
            const enemyBox = new THREE.Box3().setFromObject(enemy);
            
            if (playerBox.intersectsBox(enemyBox)) {
                this.loseLife();
            }
        });
    }
    
    updateCollectibles() {
        this.collectibles.forEach(collectible => {
            if (!collectible.userData.collected) {
                // Rotate collectible
                collectible.rotation.y += collectible.userData.rotationSpeed;
                
                // Check collision with player
                const playerBox = new THREE.Box3().setFromObject(this.player);
                const collectibleBox = new THREE.Box3().setFromObject(collectible);
                
                if (playerBox.intersectsBox(collectibleBox)) {
                    collectible.userData.collected = true;
                    collectible.visible = false;
                    this.score += 100;
                    this.createParticles(collectible.position, 0xFFD700);
                    this.updateUI();
                    
                    // Check if all collectibles are collected
                    if (this.collectibles.every(c => c.userData.collected)) {
                        this.nextLevel();
                    }
                }
            }
        });
    }
    
    createParticles(position, color) {
        for (let i = 0; i < 15; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({ color: color });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            particle.position.copy(position);
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.3,
                    (Math.random() - 0.5) * 0.2
                ),
                life: 60
            };
            
            this.particles.push(particle);
            this.scene.add(particle);
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.y -= 0.01;
            particle.userData.life--;
            
            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                return false;
            }
            
            particle.material.opacity = particle.userData.life / 60;
            return true;
        });
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.showGameOver();
        } else {
            // Reset player position
            this.player.position.set(0, 5, 0);
            this.player.userData.velocity.set(0, 0, 0);
        }
    }
    
    nextLevel() {
        this.level++;
        this.updateUI();
        this.createLevel();
        this.player.position.set(0, 5, 0);
        this.player.userData.velocity.set(0, 0, 0);
        this.showLevelComplete();
    }
    
    createLevel() {
        // Reset collectibles
        this.collectibles.forEach(collectible => {
            collectible.userData.collected = false;
            collectible.visible = true;
        });
        
        // Reset enemies
        this.enemies.forEach(enemy => {
            enemy.position.x = enemy.userData.startX;
            enemy.userData.direction = 1;
        });
    }
    
    showGameOver() {
        document.getElementById('overlayTitle').textContent = 'Game Over!';
        document.getElementById('overlayMessage').textContent = `Final Score: ${this.score}`;
        document.getElementById('overlayBtn').textContent = 'Play Again';
        document.getElementById('gameOverlay').classList.remove('hidden');
    }
    
    showLevelComplete() {
        document.getElementById('overlayTitle').textContent = `Level ${this.level - 1} Complete!`;
        document.getElementById('overlayMessage').textContent = `Score: ${this.score}`;
        document.getElementById('overlayBtn').textContent = 'Continue';
        document.getElementById('gameOverlay').classList.remove('hidden');
        this.gameRunning = false;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    updateFPS() {
        this.frameCount++;
        const currentTime = this.clock.getElapsedTime();
        
        if (currentTime - this.lastTime >= 1) {
            this.fps = Math.round(this.frameCount / (currentTime - this.lastTime));
            document.getElementById('fps').textContent = this.fps;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        
        if (!this.gamePaused) {
            this.updatePlayer();
            this.updateEnemies();
            this.updateCollectibles();
            this.updateParticles();
            this.updateFPS();
        }
        
        // Update controls
        if (this.controls.enabled) {
            this.controls.update();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize 3D game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game3D();
});
