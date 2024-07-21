const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 800;

const NATION_COUNT = 10;
const nations = [];
const syllables = ['k', 's', 't', 'm', 'y', 'r', 'w', 'h', 'g', 'z', 'd', 'p', 'ch', 'sh', 'zh'];
const vowels = ['a', 'i', 'u', 'e', 'o', 'ea'];
let year = 0;
let season = 0;
const backgroundImage = new Image();
backgroundImage.src = '世界.png'; // 画像のパス

// 国のデータ構造
class Nation {
    constructor(x, y, strength, population, peaceLevel, color, name, armySize = 0, flagSize = 50) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.population = population;
        this.peaceLevel = peaceLevel;
        this.color = color;
        this.name = name;
        this.territory = 1;
        this.armySize = armySize;
        this.flagSize = flagSize;
        this.exclaves = [];
        this.ships = [];
        this.generateExclave();
    }

    generateExclave() {
        const xOffset = Math.random() * 91 - 45;
        const yOffset = Math.random() * 91 - 45;
        this.exclaves.push({ x: this.x + xOffset, y: this.y + yOffset });
    }
    
    generateShips(number) {
        for (let i = 0; i < number; i++) {
            this.ships.push({
                x: this.x + Math.random() * 50 - 25,
                y: this.y + Math.random() * 50 - 25,
                dx: Math.random() * 2 - 1, // 船の動きの速度
                dy: Math.random() * 2 - 1  // 船の動きの速度
            });
        }
    }
}

// ランダムな国名を生成する関数
function generateRandomName() {
    let name = '';
    for (let i = 0; i < 3; i++) {
        name += syllables[Math.floor(Math.random() * syllables.length)];
        name += vowels[Math.floor(Math.random() * vowels.length)];
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

// ランダムな位置を取得
function getRandomPosition() {
    let x, y, overlapping;
    do {
        x = Math.random() * (canvas.width - 50);
        y = Math.random() * (canvas.height - 50);
        overlapping = nations.some(nation => {
            return x < nation.x + 50 * nation.territory &&
                   x + 50 * nation.territory > nation.x &&
                   y < nation.y + 50 * nation.territory &&
                   y + 50 * nation.territory > nation.y;
        });
    } while (overlapping);
    return { x, y };
}

// ゲーム初期化
function init() {
    nations.length = 0;

    for (let i = 0; i < NATION_COUNT; i++) {
        const { x, y } = getRandomPosition();
        const strength = Math.random() * 100 + 1;
        const population = Math.random() * 1000 + 100;
        const peaceLevel = Math.random() * 100;
        const color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.32)`;
        const name = generateRandomName();
        const armySize = Math.random() * 100 + 10;
        const flagSize = parseInt(document.getElementById('flagSize').value) || 50;
        const shipCount = parseInt(document.getElementById('nationShips').value) || 0;
        
        const nation = new Nation(x, y, strength, population, peaceLevel, color, name, armySize, flagSize);
        nation.generateShips(shipCount);
        nations.push(nation);
    }
}

// 描画
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
    nations.forEach(nation => {
        drawTerritory(nation);
        
        ctx.fillStyle = `rgba(${parseInt(nation.color.split('(')[1].split(',')[0])}, ${parseInt(nation.color.split(',')[1])}, ${parseInt(nation.color.split(',')[2])}, 0.32)`;
        nation.exclaves.forEach(exclave => {
            drawTerritory({ x: exclave.x, y: exclave.y, color: ctx.fillStyle });
        });
        
        drawWavyFlag(nation.x + 25, nation.y + 25, nation.flagSize);
        
        ctx.fillStyle = '#96a3b1';
        ctx.font = '16px Arial';
        ctx.fillText(nation.name, nation.x + 10, nation.y + 30);
        
        nation.ships.forEach(ship => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(ship.x, ship.y, 10, 5);
        });
    });
}

// 国土を描画する関数
function drawTerritory(nation) {
    const numVertices = 6 + Math.floor(Math.random() * 10);
    const radius = 50 * nation.territory;
    const centerX = nation.x + radius / 2;
    const centerY = nation.y + radius / 2;
    const angleStep = 2 * Math.PI / numVertices;
    
    ctx.fillStyle = nation.color;
    ctx.beginPath();
    
    for (let i = 0; i < numVertices; i++) {
        const angle = i * angleStep;
        const xOffset = Math.random() * (radius / 2) - (radius / 4);
        const yOffset = Math.random() * (radius / 2) - (radius / 4);
        const x = centerX + Math.cos(angle) * (radius / 2 + xOffset);
        const y = centerY + Math.sin(angle) * (radius / 2 + yOffset);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
}

// 国旗を描画する関数
function drawWavyFlag(x, y, size) {
    ctx.fillStyle = 'yellow'; // 旗の色
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < 10; i++) {
        ctx.lineTo(x + Math.sin(i) * size, y + (i % 2 === 0 ? size / 2 : -size / 2));
    }
    ctx.closePath();
    ctx.fill();
}

// 反乱のロジック
function rebellion() {
    nations.forEach(nation => {
        if (nation.peaceLevel < 20) { // 平和度
            nation.population -= Math.random() * 100; // 人口の減少
            displayNotification(`${nation.name} で反乱が発生しました。人口が減少しました。`);
        }
    });
}

// 戦争のロジック
function war() {
    nations.forEach(nation => {
        nation.ships.forEach(ship => {
            nations.forEach(otherNation => {
                if (otherNation !== nation &&
                    ship.x > otherNation.x && ship.x < otherNation.x + 50 * otherNation.territory &&
                    ship.y > otherNation.y && ship.y < otherNation.y + 50 * otherNation.territory) {
                    
                    // 戦争が発生する
                    const attacker = nation;
                    const defender = otherNation;
                    const populationLoss = Math.min(attacker.population * 0.1, 100); // 最大100の人口減少
                    const armyLoss = Math.min(attacker.armySize * 0.1, 10); // 最大10の軍隊減少

                    if (attacker.strength > defender.strength) {
                        defender.strength = Math.max(0, defender.strength - attacker.strength * 0.1);
                        attacker.strength -= attacker.strength * 0.1;
                        defender.population = Math.max(0, defender.population - populationLoss);
                        attacker.armySize = Math.max(0, attacker.armySize - armyLoss);
                        displayNotification(`${attacker.name} が ${defender.name} と戦争を開始しました。${defender.name} の国力と人口が減少しました。`);
                    } else {
                        attacker.strength = Math.max(0, attacker.strength - defender.strength * 0.1);
                        attacker.population = Math.max(0, attacker.population - populationLoss);
                        attacker.armySize = Math.max(0, attacker.armySize - armyLoss);
                        displayNotification(`${defender.name} が ${attacker.name} と戦争を開始しました。${attacker.name} の国力と人口が減少しました。`);
                    }
                }
            });
        });
    });
}

// 国を作成する関数
function createNation() {
    const name = document.getElementById('nationName').value || generateRandomName();
    const strength = parseFloat(document.getElementById('nationStrength').value) || 10;
    const population = parseFloat(document.getElementById('nationPopulation').value) || 100;
    const peaceLevel = parseFloat(document.getElementById('nationPeaceLevel').value) || 50;
    const r = parseInt(document.getElementById('nationColorR').value) || 0;
    const g = parseInt(document.getElementById('nationColorG').value) || 0;
    const b = parseInt(document.getElementById('nationColorB').value) || 0;
    const armySize = parseFloat(document.getElementById('nationArmySize').value) || 0;
    const shipCount = parseFloat(document.getElementById('nationShips').value) || 0;
    const flagSize = parseInt(document.getElementById('flagSize').value) || 50;
    
    const color = `rgba(${r}, ${g}, ${b}, 0.32)`;
    const { x, y } = getRandomPosition();
    
    const nation = new Nation(x, y, strength, population, peaceLevel, color, name, armySize, flagSize);
    nation.generateShips(shipCount);
    nations.push(nation);
}

// 国の編集
function editNation() {
    const name = document.getElementById('editNationName').value;
    const nation = nations.find(n => n.name === name);
    
    if (nation) {
        // 国の編集機能をここに追加
        displayNotification(`${name} の国情報が編集されました。`);
    } else {
        displayNotification(`国名 ${name} は存在しません。`);
    }
}

// 通知を表示する関数
function displayNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    setTimeout(() => notification.textContent = '', 5000);
}

// ローカルストレージへの保存
function saveToLocalStorage() {
    localStorage.setItem('nations', JSON.stringify(nations));
}

// ローカルストレージからの読み込み
function loadFromLocalStorage() {
    const savedNations = localStorage.getItem('nations');
    if (savedNations) {
        const loadedNations = JSON.parse(savedNations);
        loadedNations.forEach(nationData => {
            const nation = new Nation(
                nationData.x,
                nationData.y,
                nationData.strength,
                nationData.population,
                nationData.peaceLevel,
                nationData.color,
                nationData.name,
                nationData.armySize,
                nationData.flagSize
            );
            nation.exclaves = nationData.exclaves;
            nation.ships = nationData.ships;
            nations.push(nation);
        });
    }
}

// データリセット関数
function resetGame() {
    nations.length = 0;
    saveToLocalStorage();
    init();
    draw();
    displayNotification('ゲームデータがリセットされました。');
}

// 船の動きと戦争処理
function updateShips() {
    nations.forEach(nation => {
        nation.ships.forEach(ship => {
            // 船の位置を更新
            ship.x += ship.dx;
            ship.y += ship.dy;

            // 境界チェック
            if (ship.x < 0 || ship.x > canvas.width) ship.dx *= -1;
            if (ship.y < 0 || ship.y > canvas.height) ship.dy *= -1;
        });
    });
}

// 初期化
init();
draw();
setInterval(() => {
    updateShips();
    rebellion();
    war();
    draw();
    year++;
    if (year % 12 === 0) {
        season = (season + 1) % 4;
    }
}, 10000); // 10秒ごとに更新
