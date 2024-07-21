const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
    constructor(x, y, strength, population, peaceLevel, color, name) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.population = population;
        this.peaceLevel = peaceLevel;
        this.color = color;
        this.name = name;
        this.territory = 1; // 領土の初期値
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

// 初期化
function init() {
    for (let i = 0; i < NATION_COUNT; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const strength = Math.random() * 100 + 1;
        const population = Math.random() * 1000 + 100;
        const peaceLevel = Math.random() * 100;
        const color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.32)`;
        const name = generateRandomName();
        
        nations.push(new Nation(x, y, strength, population, peaceLevel, color, name));
    }
}

// 描画
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景画像を描画
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
    nations.forEach(nation => {
        ctx.fillStyle = nation.color;
        ctx.fillRect(nation.x, nation.y, 50 * nation.territory, 50 * nation.territory); // 領土に基づいてサイズを変更
        ctx.fillStyle = 'black';
        ctx.fillText(nation.name, nation.x + 10, nation.y + 30);
    });
}

// 戦争のロジック
function war() {
    for (let i = 0; i < NATION_COUNT; i++) {
        for (let j = i + 1; j < NATION_COUNT; j++) {
            if (Math.random() < 0.1) { // 10%の確率で戦争が発生
                if (nations[i].strength > nations[j].strength) {
                    nations[i].territory += 0.1; // 勝った国は領土を増加
                    nations[j].territory -= 0.1; // 負けた国は領土を減少
                    if (nations[j].territory <= 0) {
                        nations.splice(j, 1); // 国が滅亡した場合、その国を削除
                        j--; // 削除した分インデックスを調整
                    }
                } else {
                    nations[j].territory += 0.1; // 勝った国は領土を増加
                    nations[i].territory -= 0.1; // 負けた国は領土を減少
                    if (nations[i].territory <= 0) {
                        nations.splice(i, 1); // 国が滅亡した場合、その国を削除
                        i--; // 削除した分インデックスを調整
                    }
                }
            }
        }
    }
}

// 時間の進行
function updateTime() {
    year++;
    if (year % 360 === 0) {
        season = (season + 1) % 4; // 季節の変更
    }
}

// メインループ
function mainLoop() {
    draw();
    war();
    updateTime();
    requestAnimationFrame(mainLoop);
}

// 国の生成
function createNation() {
    const name = document.getElementById('nationName').value || generateRandomName();
    const strength = parseInt(document.getElementById('nationStrength').value) || 1;
    const population = parseInt(document.getElementById('nationPopulation').value) || 100;
    const peaceLevel = parseInt(document.getElementById('nationPeaceLevel').value) || 50;
    const colorR = parseInt(document.getElementById('nationColorR').value) || 0;
    const colorG = parseInt(document.getElementById('nationColorG').value) || 0;
    const colorB = parseInt(document.getElementById('nationColorB').value) || 0;
    const color = `rgba(${colorR}, ${colorG}, ${colorB}, 0.32)`;

    // 国の位置はランダムで設定
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    // 新しい国を追加
    nations.push(new Nation(x, y, strength, population, peaceLevel, color, name));
}

// 国の編集
function editNation() {
    const name = document.getElementById('editNationName').value;
    const nation = nations.find(n => n.name === name);

    if (nation) {
        nation.x = Math.random() * canvas.width;
        nation.y = Math.random() * canvas.height;
        nation.strength = Math.random() * 100 + 1;
        nation.population = Math.random() * 1000 + 100;
        nation.peaceLevel = Math.random() * 100;
        nation.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.32)`;
    }
}

// 背景画像の読み込みが完了してから初期化してメインループを開始
backgroundImage.onload = function() {
    init();
    mainLoop();
};

// 「国を作成」ボタンのクリックイベント
document.getElementById('createNation').addEventListener('click', createNation);

// 「国を編集」ボタンのクリックイベント
document.getElementById('editNation').addEventListener('click', editNation);
