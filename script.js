// Variáveis do jogo
let player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    speed: 5,
    health: 100,
    maxHealth: 100,
    direction: 1 // 1 para direita, -1 para esquerda
};

let gameState = {
    score: 0,
    level: 1,
    xp: 0,
    xpNeeded: 10,
    zombiesKilled: 0,
    gameTime: 0,
    isPaused: false,
    gameOver: false
};

let powers = {
    doubleShot: false,
    movementSpeed: false,
    regeneration: false
};

let zombies = [];
let bullets = [];
let xpOrbs = [];
let lastRegeneration = 0;

// Inicialização do jogo
function initGame() {
    // Posicionar o jogador
    updatePlayerPosition();
    
    // Iniciar loops do jogo
    setInterval(gameLoop, 1000/60); // 60 FPS
    setInterval(zombieSpawner, 2000); // Spawn de zumbi a cada 2 segundos
    setInterval(updateGameTime, 1000); // Atualizar tempo a cada segundo
    
    // Event listeners
    document.addEventListener('mousemove', movePlayer);
    document.addEventListener('click', shoot);
    
    // Iniciar a regeneração de vida se o poder estiver ativo
    setInterval(regenerateHealth, 5000);
}

// Atualizar posição visual do jogador
function updatePlayerPosition() {
    const playerElement = document.getElementById('player');
    playerElement.style.left = player.x + 'px';
    playerElement.style.top = player.y + 'px';
    
    // Virar o personagem na direção do movimento
    if (player.direction === -1) {
        playerElement.style.transform = 'translate(-50%, -50%) scaleX(-1)';
    } else {
        playerElement.style.transform = 'translate(-50%, -50%) scaleX(1)';
    }
}

// Loop principal do jogo
function gameLoop() {
    if (gameState.isPaused || gameState.gameOver) return;
    
    moveBullets();
    moveZombies();
    moveXpOrbs();
    checkCollisions();
    updateUI();
}

// Movimentação do jogador
function movePlayer(e) {
    if (gameState.isPaused || gameState.gameOver) return;
    
    // Atualizar a posição do cursor personalizado
    document.getElementById('custom-cursor').style.left = e.clientX + 'px';
    document.getElementById('custom-cursor').style.top = e.clientY + 'px';
    
    // Determinar direção do personagem
    if (e.clientX > player.x) {
        player.direction = 1;
    } else if (e.clientX < player.x) {
        player.direction = -1;
    }
    
    // Calcular a direção do movimento
    const dx = e.clientX - player.x;
    const dy = e.clientY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Mover o jogador em direção ao cursor
    if (distance > 5) {
        player.x += (dx / distance) * player.speed;
        player.y += (dy / distance) * player.speed;
        
        // Atualizar a posição visual do jogador
        updatePlayerPosition();
    }
}

// Disparar projéteis
function shoot(e) {
    if (gameState.isPaused || gameState.gameOver) return;
    
    // Criar um novo projétil
    const bullet = {
        x: player.x,
        y: player.y,
        dx: e.clientX - player.x,
        dy: e.clientY - player.y,
        speed: 10,
        distance: 0,
        maxDistance: 300
    };
    
    // Normalizar a direção
    const distance = Math.sqrt(bullet.dx * bullet.dx + bullet.dy * bullet.dy);
    bullet.dx /= distance;
    bullet.dy /= distance;
    
    bullets.push(bullet);
    
    // Disparo duplo se o poder estiver ativo
    if (powers.doubleShot) {
        const bullet2 = {
            x: player.x,
            y: player.y,
            dx: e.clientX - player.x + (bullet.dy * 20), // perpendicular
            dy: e.clientY - player.y - (bullet.dx * 20), // perpendicular
            speed: 10,
            distance: 0,
            maxDistance: 300
        };
        
        const distance2 = Math.sqrt(bullet2.dx * bullet2.dx + bullet2.dy * bullet2.dy);
        bullet2.dx /= distance2;
        bullet2.dy /= distance2;
        
        bullets.push(bullet2);
    }
    
    // Criar elemento visual para o projétil
    const bulletElement = document.createElement('div');
    bulletElement.className = 'bullet';
    bulletElement.style.left = bullet.x + 'px';
    bulletElement.style.top = bullet.y + 'px';
    document.getElementById('game-container').appendChild(bulletElement);
}

// Movimentação dos projéteis
function moveBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Atualizar posição
        bullet.x += bullet.dx * bullet.speed;
        bullet.y += bullet.dy * bullet.speed;
        bullet.distance += bullet.speed;
        
        // Remover projéteis que atingiram a distância máxima
        if (bullet.distance >= bullet.maxDistance) {
            bullets.splice(i, 1);
            document.querySelectorAll('.bullet')[i]?.remove();
            continue;
        }
        
        // Atualizar posição visual
        const bulletElements = document.querySelectorAll('.bullet');
        if (bulletElements[i]) {
            bulletElements[i].style.left = bullet.x + 'px';
            bulletElements[i].style.top = bullet.y + 'px';
        }
    }
}

// Gerador de zumbis
function zombieSpawner() {
    if (gameState.isPaused || gameState.gameOver) return;
    
    // Aumentar a dificuldade com o tempo
    const zombieCount = Math.min(10 + Math.floor(gameState.gameTime / 30), 30);
    if (zombies.length >= zombieCount) return;
    
    // Criar um novo zumbi em uma posição aleatória fora da tela
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
        case 0: // Topo
            x = Math.random() * window.innerWidth;
            y = -30;
            break;
        case 1: // Direita
            x = window.innerWidth + 30;
            y = Math.random() * window.innerHeight;
            break;
        case 2: // Base
            x = Math.random() * window.innerWidth;
            y = window.innerHeight + 30;
            break;
        case 3: // Esquerda
            x = -30;
            y = Math.random() * window.innerHeight;
            break;
    }
    
    const zombie = {
        x,
        y,
        speed: 1 + Math.random() * 0.5 + (gameState.gameTime / 300), // Aumenta com o tempo
        health: 10 + Math.floor(gameState.gameTime / 20) // Aumenta com o tempo
    };
    
    zombies.push(zombie);
    
    // Criar elemento visual para o zumbi
    const zombieElement = document.createElement('div');
    zombieElement.className = 'zombie';
    zombieElement.style.left = zombie.x + 'px';
    zombieElement.style.top = zombie.y + 'px';
    document.getElementById('game-container').appendChild(zombieElement);
}

// Movimentação dos zumbis
function moveZombies() {
    const zombieElements = document.querySelectorAll('.zombie');
    
    for (let i = 0; i < zombies.length; i++) {
        const zombie = zombies[i];
        
        // Calcular direção para o jogador
        const dx = player.x - zombie.x;
        const dy = player.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mover em direção ao jogador
        if (distance > 5) {
            zombie.x += (dx / distance) * zombie.speed;
            zombie.y += (dy / distance) * zombie.speed;
        }
        
        // Atualizar posição visual
        if (zombieElements[i]) {
            zombieElements[i].style.left = zombie.x + 'px';
            zombieElements[i].style.top = zombie.y + 'px';
        }
    }
}

// Verificar colisões
function checkCollisions() {
    // Colisão entre projéteis e zumbis
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = zombies.length - 1; j >= 0; j--) {
            const bullet = bullets[i];
            const zombie = zombies[j];
            
            const dx = bullet.x - zombie.x;
            const dy = bullet.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) { // Colisão
                // Remover o projétil
                bullets.splice(i, 1);
                document.querySelectorAll('.bullet')[i]?.remove();
                
                // Reduzir a vida do zumbi
                zombie.health -= 10;
                
                // Verificar se o zumbi morreu
                if (zombie.health <= 0) {
                    // Gerar orbe de XP
                    createXpOrb(zombie.x, zombie.y);
                    
                    // Remover o zumbi
                    zombies.splice(j, 1);
                    document.querySelectorAll('.zombie')[j]?.remove();
                    
                    // Atualizar estatísticas
                    gameState.zombiesKilled++;
                    gameState.xp += 5;
                    
                    // Verificar se subiu de nível
                    if (gameState.xp >= gameState.xpNeeded) {
                        levelUp();
                    }
                }
                
                break;
            }
        }
    }
    
    // Colisão entre jogador e zumbis
    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];
        
        const dx = player.x - zombie.x;
        const dy = player.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) { // Colisão
            // Causar dano ao jogador
            player.health -= 1;
            
            // Empurrar o jogador
            player.x += dx * 2;
            player.y += dy * 2;
            
            // Atualizar posição visual
            updatePlayerPosition();
            
            // Verificar se o jogador morreu
            if (player.health <= 0) {
                gameOver();
                return;
            }
        }
    }
    
    // Colisão entre jogador e orbes de XP
    for (let i = xpOrbs.length - 1; i >= 0; i--) {
        const orb = xpOrbs[i];
        
        const dx = player.x - orb.x;
        const dy = player.y - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) { // Colisão
            // Coletar XP
            gameState.xp += orb.value;
            xpOrbs.splice(i, 1);
            document.querySelectorAll('.xp-orb')[i]?.remove();
            
            // Verificar se subiu de nível
            if (gameState.xp >= gameState.xpNeeded) {
                levelUp();
            }
        }
    }
}

// Criar orbe de XP
function createXpOrb(x, y) {
    const orb = {
        x,
        y,
        value: 5
    };
    
    xpOrbs.push(orb);
    
    // Criar elemento visual para o orbe
    const orbElement = document.createElement('div');
    orbElement.className = 'xp-orb';
    orbElement.style.left = orb.x + 'px';
    orbElement.style.top = orb.y + 'px';
    document.getElementById('game-container').appendChild(orbElement);
}

// Movimentação dos orbes de XP em direção ao jogador
function moveXpOrbs() {
    const orbElements = document.querySelectorAll('.xp-orb');
    
    for (let i = 0; i < xpOrbs.length; i++) {
        const orb = xpOrbs[i];
        
        // Calcular direção para o jogador
        const dx = player.x - orb.x;
        const dy = player.y - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mover em direção ao jogador se estiver perto o suficiente
        if (distance < 200) {
            orb.x += (dx / distance) * 3;
            orb.y += (dy / distance) * 3;
        }
        
        // Atualizar posição visual
        if (orbElements[i]) {
            orbElements[i].style.left = orb.x + 'px';
            orbElements[i].style.top = orb.y + 'px';
        }
    }
}

// Subir de nível
function levelUp() {
    gameState.level++;
    gameState.xp -= gameState.xpNeeded;
    gameState.xpNeeded = Math.floor(gameState.xpNeeded * 1.5);
    
    // Pausar o jogo e mostrar a tela de seleção de poderes
    gameState.isPaused = true;
    document.getElementById('level-up-screen').style.display = 'block';
}

// Selecionar poder
function selectPower(powerIndex) {
    switch(powerIndex) {
        case 0:
            powers.doubleShot = true;
            break;
        case 1:
            powers.movementSpeed = true;
            player.speed *= 1.2;
            break;
        case 2:
            powers.regeneration = true;
            break;
    }
    
    // Retomar o jogo
    gameState.isPaused = false;
    document.getElementById('level-up-screen').style.display = 'none';
}

// Regenerar vida
function regenerateHealth() {
    if (powers.regeneration && player.health < player.maxHealth && !gameState.gameOver) {
        player.health = Math.min(player.health + 1, player.maxHealth);
    }
}

// Atualizar tempo de jogo
function updateGameTime() {
    if (gameState.isPaused || gameState.gameOver) return;
    
    gameState.gameTime++;
    
    const minutes = Math.floor(gameState.gameTime / 60);
    const seconds = gameState.gameTime % 60;
    
    document.getElementById('time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Atualizar interface do usuário
function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('xp').textContent = gameState.xp;
    document.getElementById('xp-needed').textContent = gameState.xpNeeded;
    document.getElementById('health').textContent = player.health;
}

// Game over
function gameOver() {
    gameState.gameOver = true;
    
    // Atualizar estatísticas finais
    const minutes = Math.floor(gameState.gameTime / 60);
    const seconds = gameState.gameTime % 60;
    
    document.getElementById('survived-time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('zombies-killed').textContent = gameState.zombiesKilled;
    document.getElementById('final-level').textContent = gameState.level;
    
    // Mostrar tela de game over
    document.getElementById('game-over').style.display = 'block';
}

// Reiniciar jogo
function restartGame() {
    // Limpar arrays
    zombies = [];
    bullets = [];
    xpOrbs = [];
    
    // Remover elementos visuais
    document.querySelectorAll('.zombie').forEach(el => el.remove());
    document.querySelectorAll('.bullet').forEach(el => el.remove());
    document.querySelectorAll('.xp-orb').forEach(el => el.remove());
    
    // Reiniciar estado do jogo
    player = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        speed: 5,
        health: 100,
        maxHealth: 100,
        direction: 1
    };
    
    gameState = {
        score: 0,
        level: 1,
        xp: 0,
        xpNeeded: 10,
        zombiesKilled: 0,
        gameTime: 0,
        isPaused: false,
        gameOver: false
    };
    
    powers = {
        doubleShot: false,
        movementSpeed: false,
        regeneration: false
    };
    
    // Reposicionar o jogador
    updatePlayerPosition();
    
    // Esconder telas
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('level-up-screen').style.display = 'none';
    
    // Atualizar UI
    updateUI();
}

// Iniciar o jogo quando a página carregar
window.onload = initGame;