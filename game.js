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
backgroundImage.src = '世界.png';

// 国のデータ構造
class Nation {
    constructor(x, y, strength, population, peaceLevel, color, name, armySize = 0) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.population = population;
        this.peaceLevel = peaceLevel;
        this.color = color;
        this.name = name;
        this.territory = 1;
        this.armySize = armySize;
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

// 国が重ならないようにランダムな位置を取得
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

// 初期化
function init() {
    for (let i = 0; i < NATION_COUNT; i++) {
        const { x, y } = getRandomPosition();
        const strength = Math.random() * 100 + 1;
        const population = Math.random() * 1000 + 100;
        const peaceLevel = Math.random() * 100;
        const color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.32)`;
        const name = generateRandomName();
        const armySize = Math.random() * 100 + 10; // 初期軍隊数
        
        nations.push(new Nation(x, y, strength, population, peaceLevel, color, name, armySize));
    }
}

// 描画
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
    nations.forEach(nation => {
        ctx.fillStyle = nation.color;
        ctx.fillRect(nation.x, nation.y, 50 * nation.territory, 50 * nation.territory);
        ctx.fillStyle = 'black';
        ctx.fillText(nation.name, nation.x + 10, nation.y + 30);
    });
}

// 反乱のロジック
function rebellion() {
    nations.forEach(nation => {
        if (nation.peaceLevel < 20) { // 平和度が低いと反乱
            nation.territory -= 0.1;
            if (nation.territory <= 0) {
                displayNotification(`${nation.name} が滅亡しました！`);
                nations.splice(nations.indexOf(nation), 1);
            }
        }
    });
}

// 隣接する国を見つける関数
function findAdjacentNations(nation) {
    return nations.filter(otherNation => {
        const dx = Math.abs(nation.x - otherNation.x);
        const dy = Math.abs(nation.y - otherNation.y);
        return dx < 50 * nation.territory && dy < 50 * nation.territory;
    });
}

// 戦争のロジック
function war() {
    for (let i = 0; i < NATION_COUNT; i++) {
        const nation = nations[i];
        if (nation.peaceLevel < 20) { // 平和度が低いと戦争
            const adjacentNations = findAdjacentNations(nation);
            adjacentNations.forEach(adjacentNation => {
                if (nation !== adjacentNation && Math.random() < 0.1) {
                    if (nation.strength > adjacentNation.strength) {
                        nation.territory += 0.1;
                        adjacentNation.territory -= 0.1;
                        displayNotification(`${nation.name} が ${adjacentNation.name} と戦争し、領土を拡大しました。`);
                        if (adjacentNation.territory <= 0) {
                            displayNotification(`${adjacentNation.name} が滅亡しました！`);
                            nations.splice(nations.indexOf(adjacentNation), 1);
                        }
                    } else {
                        adjacentNation.territory += 0.1;
                        nation.territory -= 0.1;
                        displayNotification(`${adjacentNation.name} が ${nation.name} と戦争し、領土を拡大しました。`);
                        if (nation.territory <= 0) {
                            displayNotification(`${nation.name} が滅亡しました！`);
                            nations.splice(nations.indexOf(nation), 1);
                        }
                    }
                }
            });
        }
    }
}

// 時間の進行
function updateTime() {
    year++;
    if (year % 360 === 0) {
        season = (season + 1) % 4;
    }
}

// メインループ
function mainLoop() {
    draw();
    rebellion();
    war();
    updateTime();
    saveToLocalStorage();
    requestAnimationFrame(mainLoop);
}

// 国の生成
function createNation() {
    const name = document.getElementById('nationName').value || generateRandomName();
    const strength = parseFloat(document.getElementById('nationStrength').value) || 10;
    const population = parseFloat(document.getElementById('nationPopulation').value) || 100;
    const peaceLevel = parseFloat(document.getElementById('nationPeaceLevel').value) || 50;
    const r = parseInt(document.getElementById('nationColorR').value) || 0;
    const g = parseInt(document.getElementById('nationColorG').value) || 0;
    const b = parseInt(document.getElementById('nationColorB').value) || 0;
    const armySize = parseFloat(document.getElementById('nationArmySize').value) || 0;
    
    const color = `rgba(${r}, ${g}, ${b}, 0.32)`;
    const { x, y } = getRandomPosition();
    
    nations.push(new Nation(x, y, strength, population, peaceLevel, color, name, armySize));
}

// 国の編集
function editNation() {
    const name = document.getElementById('editNationName').value;
    const nation = nations.find(n => n.name === name);
    
    if (nation) {
        // 国の編集機能をここに追加
        // 例: nation.strength = newStrength;
        displayNotification(`${name} の国情報が編集されました。`);
    } else {
        displayNotification(`国名 ${name} は存在しません。`);
    }
}

// 通知を表示する関数
function displayNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 5000);
}

// ローカルストレージに保存
function saveToLocalStorage() {
    localStorage.setItem('nations', JSON.stringify(nations));
}

// ローカルストレージからロード
function loadFromLocalStorage() {
    const savedNations = JSON.parse(localStorage.getItem('nations'));
    if (savedNations) {
        savedNations.forEach(nation => {
            nations.push(new Nation(
                nation.x, nation.y, nation.strength, nation.population,
                nation.peaceLevel, nation.color, nation.name, nation.armySize
            ));
        });
    }
}

// イベントリスナー
document.getElementById('createNation').addEventListener('click', createNation);
document.getElementById('editNation').addEventListener('click', editNation);

// 初期化と開始
init();
loadFromLocalStorage();
mainLoop();
