// Global o'zgaruvchilar
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var gameContainer = document.getElementById('gameContainer');
var gameInfo = document.getElementById('gameInfo');

var currentGame = null;
var gameLoop = null;
var intervals = [];
var eventListeners = [];

function addInterval(id) { 
    intervals.push(id); 
}

function addGameEvent(target, event, handler) {
    target.addEventListener(event, handler);
    eventListeners.push({ target: target, event: event, handler: handler });
}

function startGame(type) {
    closeGame();
    gameContainer.classList.add('active');
    
    if (type === 'minecraft') startMinecraft();
    else if (type === 'shooter') startShooter();
    else if (type === 'snake') startSnake();
    else if (type === 'pong') startPong();
    else if (type === 'tetris') startTetris();
    else if (type === 'target') startTarget();
}

function closeGame() {
    gameContainer.classList.remove('active');
    
    if (gameLoop) { 
        cancelAnimationFrame(gameLoop); 
        gameLoop = null; 
    }
    
    intervals.forEach(function(id) { 
        clearInterval(id); 
    }); 
    intervals = [];
    
    eventListeners.forEach(function(item) { 
        item.target.removeEventListener(item.event, item.handler); 
    });
    eventListeners = [];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    gameInfo.textContent = '';
    currentGame = null;
}

// MINECRAFT GAME
function startMinecraft() {
    canvas.width = 800; 
    canvas.height = 600;
    
    var blockSize = 40;
    var player = { x: 400, y: 300, size: blockSize, speed: 6 };
    var blocks = [];
    var colors = ['#8B4513', '#228B22', '#4169E1', '#FFD700', '#FF4500'];
    var keys = {};
    var placed = 0;
    
    for (var i = 0; i < 40; i++) {
        blocks.push({
            x: Math.floor(Math.random() * 20) * blockSize,
            y: Math.floor(Math.random() * 15) * blockSize,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    var keyDown = function(e) {
        keys[e.key] = true;
        if (e.key === ' ') {
            e.preventDefault();
            blocks.push({ 
                x: Math.floor(player.x / blockSize) * blockSize, 
                y: Math.floor(player.y / blockSize) * blockSize, 
                color: '#00ff41' 
            });
            placed++;
            gameInfo.textContent = 'Bloklar: ' + placed + ' | WASD';
        }
    };
    var keyUp = function(e) { keys[e.key] = false; };
    
    addGameEvent(window, 'keydown', keyDown);
    addGameEvent(window, 'keyup', keyUp);
    
    gameInfo.textContent = 'Bloklar: 0 | WASD - harakat, SPACE - qo\'yish';
    
    function loop() {
        if (keys['w'] || keys['W']) player.y = Math.max(0, player.y - player.speed);
        if (keys['s'] || keys['S']) player.y = Math.min(canvas.height - blockSize, player.y + player.speed);
        if (keys['a'] || keys['A']) player.x = Math.max(0, player.x - player.speed);
        if (keys['d'] || keys['D']) player.x = Math.min(canvas.width - blockSize, player.x + player.speed);
        
        ctx.fillStyle = '#87CEEB'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        blocks.forEach(function(b) {
            ctx.fillStyle = b.color; 
            ctx.fillRect(b.x, b.y, blockSize, blockSize);
            ctx.strokeStyle = '#000'; 
            ctx.lineWidth = 2; 
            ctx.strokeRect(b.x, b.y, blockSize, blockSize);
        });
        
        ctx.fillStyle = '#00ff41'; 
        ctx.fillRect(player.x, player.y, blockSize, blockSize);
        ctx.strokeStyle = '#000'; 
        ctx.lineWidth = 3; 
        fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`)

        ctx.strokeRect(player.x, player.y, blockSize, blockSize);
        
        gameLoop = requestAnimationFrame(loop);
    }
    loop(); 
    currentGame = 'minecraft';
}

// SHOOTER GAME
function startShooter() {
    canvas.width = 800; 
    canvas.height = 600;
    
    var score = 0;
    var player = { x: 400, y: 550, width: 40, height: 40, speed: 7 };
    var bullets = []; 
    var enemies = []; 
    var keys = {};
    
    gameInfo.textContent = 'Ball: 0 | WASD, SPACE';
    
    var keyDown = function(e) {
        keys[e.key] = true;
        if (e.key === ' ' && bullets.length < 5) {
            bullets.push({ x: player.x + 18, y: player.y, width: 4, height: 15 });
        }
    };
    var keyUp = function(e) { keys[e.key] = false; };
    
    addGameEvent(window, 'keydown', keyDown); 
    addGameEvent(window, 'keyup', keyUp);
    
    var spawner = setInterval(function() {
        if (enemies.length < 8) {
            enemies.push({ 
                x: Math.random() * 770, 
                y: -30, 
                width: 30, 
                height: 30, 
                speed: 2 + Math.random() * 2 
            });
        }
    }, 1000);
    addInterval(spawner);
    
    function loop() {
        if (keys['a'] || keys['A']) player.x = Math.max(0, player.x - player.speed);
        if (keys['d'] || keys['D']) player.x = Math.min(760, player.x + player.speed);
        
        for (var i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= 10;
            if (bullets[i].y < 0) bullets.splice(i, 1);
        }
        
        for (var i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += enemies[i].speed;
            if (enemies[i].y > 600) {
                enemies.splice(i, 1);
                continue;
            }
            
            for (var j = bullets.length - 1; j >= 0; j--) {
                if (bullets[j].x < enemies[i].x + enemies[i].width && 
                    bullets[j].x + bullets[j].width > enemies[i].x && 
                    bullets[j].y < enemies[i].y + enemies[i].height && 
                    bullets[j].y + bullets[j].height > enemies[i].y) {
                    enemies.splice(i, 1); 
                    bullets.splice(j, 1); 
                    score += 10;
                    gameInfo.textContent = 'Ball: ' + score;
                    break;
                }
            }
        }
        
        ctx.fillStyle = '#000'; 
        ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = '#00ff41'; 
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        bullets.forEach(function(b) { 
            ctx.fillStyle = '#ff00ff'; 
            ctx.fillRect(b.x, b.y, b.width, b.height); 
        });
        
        enemies.forEach(function(e) { 
            ctx.fillStyle = '#ff0000'; 
            ctx.fillRect(e.x, e.y, e.width, e.height); 
        });
        
        gameLoop = requestAnimationFrame(loop);
    }
    loop(); 
    currentGame = 'shooter';
}

// SNAKE GAME
function startSnake() {
    canvas.width = 800; 
    canvas.height = 600;
    
    var gridSize = 25;
    var score = 0;
    var snake = [{ x: 400, y: 300 }];
    var direction = { x: gridSize, y: 0 };
    var food = { 
        x: Math.floor(Math.random() * 32) * gridSize, 
        y: Math.floor(Math.random() * 24) * gridSize 
    };
    
    gameInfo.textContent = 'Ball: 0 | O\'qlar';
    
    var keyDown = function(e) {
        if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -gridSize };
        else if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: gridSize };
        else if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -gridSize, y: 0 };
        else if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: gridSize, y: 0 };
    };
    
    addGameEvent(window, 'keydown', keyDown);
    
    var lastTime = 0;
    function loop(time) {
        if (time - lastTime < 100) { 
            gameLoop = requestAnimationFrame(loop); 
            return; 
        }
        lastTime = time;
        
        var head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        
        if (head.x < 0 || head.x >= 800 || head.y < 0 || head.y >= 600) {
            alert('O\'yin tugadi! Ball: ' + score); 
            closeGame(); 
            return;
        }
        
        for (var i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                alert('O\'yin tugadi! Ball: ' + score); 
                closeGame(); 
                return;
            }
        }
        
        snake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
            score += 10; 
            gameInfo.textContent = 'Ball: ' + score;
            food = { 
                x: Math.floor(Math.random() * 32) * gridSize, 
                y: Math.floor(Math.random() * 24) * gridSize 
            };
        } else { 
            snake.pop(); 
        }
        
        ctx.fillStyle = '#0a0e27'; 
        ctx.fillRect(0, 0, 800, 600);
        
        snake.forEach(function(s, i) {
            ctx.fillStyle = i === 0 ? '#00ff41' : '#00d4ff';
            ctx.fillRect(s.x, s.y, gridSize - 2, gridSize - 2);
        });
        
        ctx.fillStyle = '#ff00ff'; 
        ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
        
        gameLoop = requestAnimationFrame(loop);
    }
    loop(0); 
    currentGame = 'snake';
}

// PONG GAME
function startPong() {
    canvas.width = 800; 
    canvas.height = 600;
    
    var score1 = 0, score2 = 0;
    var p1 = { x: 30, y: 250, w: 15, h: 100, speed: 8 };
    var p2 = { x: 755, y: 250, w: 15, h: 100, speed: 6 };
    var ball = { x: 400, y: 300, r: 10, dx: 5, dy: 5 };
    var keys = {};
    
    gameInfo.textContent = 'Siz: 0 | AI: 0 | W/S';
    
    var keyDown = function(e) { keys[e.key] = true; };
    var keyUp = function(e) { keys[e.key] = false; };
    
    addGameEvent(window, 'keydown', keyDown); 
    addGameEvent(window, 'keyup', keyUp);
    
    function loop() {
        if (keys['w'] || keys['W']) p1.y = Math.max(0, p1.y - p1.speed);
        if (keys['s'] || keys['S']) p1.y = Math.min(500, p1.y + p1.speed);
        
        if (ball.y < p2.y + 50) p2.y = Math.max(0, p2.y - p2.speed);
        if (ball.y > p2.y + 50) p2.y = Math.min(500, p2.y + p2.speed);
        
        ball.x += ball.dx; 
        ball.y += ball.dy;
        
        if (ball.y < 0 || ball.y > 600) ball.dy *= -1;
        
        if (ball.x < p1.x + p1.w && ball.y > p1.y && ball.y < p1.y + p1.h) ball.dx = Math.abs(ball.dx);
        if (ball.x > p2.x && ball.y > p2.y && ball.y < p2.y + p2.h) ball.dx = -Math.abs(ball.dx);
        
        if (ball.x < 0) { 
            score2++; 
            ball.x = 400; 
            ball.y = 300; 
            gameInfo.textContent = 'Siz: ' + score1 + ' | AI: ' + score2; 
        }
        if (ball.x > 800) { 
            score1++; 
            ball.x = 400; 
            ball.y = 300; 
            gameInfo.textContent = 'Siz: ' + score1 + ' | AI: ' + score2; 
        }
        
        ctx.fillStyle = '#000'; 
        ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = '#00ff41'; 
        ctx.fillRect(p1.x, p1.y, p1.w, p1.h); 
        ctx.fillRect(p2.x, p2.y, p2.w, p2.h);
        ctx.beginPath(); 
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); 
        ctx.fill();
        
        gameLoop = requestAnimationFrame(loop);
    }
    loop(); 
    currentGame = 'pong';
}

// TETRIS GAME
function startTetris() {
    canvas.width = 300; 
    canvas.height = 600;
    
    var ROWS = 20, COLS = 10, SIZE = 30;
    var score = 0;
    var board = [];
    for (var i = 0; i < ROWS; i++) {
        board.push([]);
        for (var j = 0; j < COLS; j++) {
            board[i].push(0);
        }
    }
    
    var shapes = [
        { s: [[1,1,1,1]], c: '#00d4ff' },
        { s: [[1,1],[1,1]], c: '#ffff00' },
        { s: [[0,1,0],[1,1,1]], c: '#ff00ff' }
    ];
    
    var piece = { s: shapes[0].s, c: shapes[0].c, x: 3, y: 0 };
    
    gameInfo.textContent = 'Ball: 0 | O\'qlar';
    
    var keyDown = function(e) {
        if (e.key === 'ArrowLeft') { 
            piece.x--; 
            if (collision()) piece.x++; 
        }
        else if (e.key === 'ArrowRight') { 
            piece.x++; 
            if (collision()) piece.x--; 
        }
        else if (e.key === 'ArrowDown') { 
            piece.y++; 
            if (collision()) { 
                piece.y--; 
                lock(); 
            } 
        }
    };
    
    addGameEvent(window, 'keydown', keyDown);
    
    function collision() {
        for (var r = 0; r < piece.s.length; r++) {
            for (var c = 0; c < piece.s[r].length; c++) {
                if (piece.s[r][c]) {
                    var x = piece.x + c, y = piece.y + r;
                    if (x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x])) return true;
                }
            }
        }
        return false;
    }
    
    function lock() {
        for (var r = 0; r < piece.s.length; r++) {
            for (var c = 0; c < piece.s[r].length; c++) {
                if (piece.s[r][c]) board[piece.y + r][piece.x + c] = piece.c;
            }
        }
        
        for (var r = ROWS - 1; r >= 0; r--) {
            var full = true;
            for (var c = 0; c < COLS; c++) {
                if (!board[r][c]) { full = false; break; }
            }
            if (full) {
                board.splice(r, 1); 
                var newRow = [];
                for (var c = 0; c < COLS; c++) newRow.push(0);
                board.unshift(newRow);
                score += 100; 
                gameInfo.textContent = 'Ball: ' + score;
            }
        }
        
        var p = shapes[Math.floor(Math.random() * shapes.length)];
        piece = { s: p.s, c: p.c, x: 3, y: 0 };
        if (collision()) { alert('Tugadi! Ball: ' + score); closeGame(); }
    }
    
    var lastTime = 0;
    function loop(time) {
        if (time - lastTime > 500) {
            piece.y++; 
            if (collision()) { piece.y--; lock(); }
            lastTime = time;
        }
        
        ctx.fillStyle = '#0a0e27'; 
        ctx.fillRect(0, 0, 300, 600);
        
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (board[r][c]) {
                    ctx.fillStyle = board[r][c];
                    ctx.fillRect(c * SIZE, r * SIZE, SIZE - 1, SIZE - 1);
                }
            }
        }
        
        ctx.fillStyle = piece.c;
        for (var r = 0; r < piece.s.length; r++) {
            for (var c = 0; c < piece.s[r].length; c++) {
                if (piece.s[r][c]) {
                    ctx.fillRect((piece.x + c) * SIZE, (piece.y + r) * SIZE, SIZE - 1, SIZE - 1);
                }
            }
        }
        
        gameLoop = requestAnimationFrame(loop);
    }
    loop(0); 
    currentGame = 'tetris';
}

// TARGET GAME
function startTarget() {
    canvas.width = 800; 
    canvas.height = 600;
    
    var score = 0;
    var targets = [];
    
    gameInfo.textContent = 'Ball: 0 | Click!';
    
    var spawner = setInterval(function() {
        targets.push({ 
            x: Math.random() * 750, 
            y: Math.random() * 550, 
            size: 40, 
            speed: 2 
        });
    }, 1000);
    addInterval(spawner);
    
    var click = function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left, y = e.clientY - rect.top;
        
        for (var i = targets.length - 1; i >= 0; i--) {
            var t = targets[i];
            var dist = Math.sqrt((x - t.x) * (x - t.x) + (y - t.y) * (y - t.y));
            if (dist < t.size / 2) {
                targets.splice(i, 1); 
                score += 10;
                gameInfo.textContent = 'Ball: ' + score;
            }
        }
    };
    
    addGameEvent(canvas, 'click', click);
    
    function loop() {
        for (var i = targets.length - 1; i >= 0; i--) {
            targets[i].y += targets[i].speed;
            if (targets[i].y > 600) targets.splice(i, 1);
        }
        
        ctx.fillStyle = '#1a1a2e'; 
        ctx.fillRect(0, 0, 800, 600);
        
        targets.forEach(function(t) {
            ctx.fillStyle = '#ff00ff'; 
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size / 2, 0, Math.PI * 2); 
            ctx.fill();
            ctx.strokeStyle = '#00ff41'; 
            ctx.lineWidth = 3;
            ctx.beginPath(); 
            ctx.arc(t.x, t.y, t.size / 2, 0, Math.PI * 2); 
            ctx.stroke();
        });
        
        gameLoop = requestAnimationFrame(loop);
    }
    loop(); 
    currentGame = 'target';
}
fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`)
