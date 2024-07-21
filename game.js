const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 800;

const NATION_COUNT = 10;
let nations = [];
const ships = [];
const syllables = ['k', 's', 't', 'm', 'y', 'r', 'w', 'h', 'g', 'z', 'd', 'p', 'ch', 'sh', 'zh'];
const vowels = ['a', 'i', 'u', 'e', 'o', 'ea'];
let year = 0;
let season = 0;
const backgroundImage = new Image();
backgroundImage.src = '世界.png';
backgroundImage.onload = () => {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};

class Nation {
    constructor(x, y, strength, population, peaceLevel, color, name, armySize = 0, territorySize = 50) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.population = population;
        this.peaceLevel = peaceLevel;
        this.color = color;
        this.name = name;
        this.territory = 1;
        this.armySize = armySize;
        this.territorySize = territorySize;
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
                y: this.y + Math.random() * 50 - 25
            });
        }
    }

    expandTerritory(amount) {
        this.territory += amount;
        this.territorySize = 50 * this.territory;
    }

    drawBoundary() {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.territorySize, this.territorySize);
        ctx.stroke();
    }
}

function generateRandomName() {
    let name = '';
    for (let i = 0; i < 3; i++) {
        name += syllables[Math.floor(Math.random() * syllables.length)];
        name += vowels[Math.floor(Math.random() * vowels.length)];
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function getRandomPosition() {
    let x, y, overlapping;
    do {
        x = Math.random() * (canvas.width - 50);
        y = Math.random() * (canvas.height - 50);
        overlapping = nations.some(nation => {
            return x < nation.x + nation.territorySize &&
                   x + nation.territorySize > nation.x &&
                   y < nation.y + nation.territorySize &&
                   y + nation.territorySize > nation.y;
        });
    } while (overlapping);
    return { x, y };
}

function init() {
    if (localStorage.getItem('nations')) {
        nations = JSON.parse(localStorage.getItem('nations')).map(nationData => {
            const nation = new Nation(
                nationData.x,
                nationData.y,
                nationData.strength,
                nationData.population,
                nationData.peaceLevel,
                nationData.color,
                nationData.name,
                nationData.armySize,
                nationData.territorySize
            );
            nation.territory = nationData.territory;
            nation.exclaves = nationData.exclaves;
            nation.ships = nationData.ships;
            return nation;
        });
    } else {
        for (let i = 0; i < NATION_COUNT; i++) {
            const { x, y } = getRandomPosition();
            const strength = Math.random() * 100 + 1;
            const population = Math.random() * 1000 + 100;
            const peaceLevel = Math.random() * 100;
            const color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.32)`;
            const name = generateRandomName();
            const armySize = Math.random() * 100 + 10;
            const territorySize = parseInt(document.getElementById('territorySize').value) || 50;
            const shipCount = parseInt(document.getElementById('nationShips').value) || 0;

            const nation = new Nation(x, y, strength, population, peaceLevel, color, name, armySize, territorySize);
            nation.generateShips(shipCount);
            nations.push(nation);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    nations.forEach(nation => {
        drawTerritory(nation);
        nation.drawBoundary();

        ctx.fillStyle = `rgba(${parseInt(nation.color.split('(')[1].split(',')[0])}, ${parseInt(nation.color.split(',')[1])}, ${parseInt(nation.color.split(',')[2])}, 0.32)`;
        nation.exclaves.forEach(exclave => {
            drawTerritory({ x: exclave.x, y: exclave.y, color: ctx.fillStyle, territorySize: 20 });
        });

        ctx.fillStyle = '#96a3b1';
        ctx.font = '16px Arial';
        ctx.fillText(nation.name, nation.x + 10, nation.y + 30);

        nation.ships.forEach(ship => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(ship.x, ship.y, 10, 5);
        });
    });
}

function drawTerritory(nation) {
    const numVertices = 6 + Math.floor(Math.random() * 10);
    const radius = nation.territorySize / 2;
    const centerX = nation.x + radius;
    const centerY = nation.y + radius;
    const angleStep = 2 * Math.PI / numVertices;

    ctx.fillStyle = nation.color;
    ctx.beginPath();

    for (let i = 0; i < numVertices; i++) {
        const angle = i * angleStep;
        const xOffset = Math.random() * (radius / 2) - (radius / 4);
        const yOffset = Math.random() * (radius / 2) - (radius / 4);
        const x = centerX + Math.cos(angle) * (radius + xOffset);
        const y = centerY + Math.sin(angle) * (radius + yOffset);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
}

function rebellion() {
    nations.forEach(nation => {
        if (nation.peaceLevel < 20) {
            nation.population -= Math.random() * 100;
            displayNotification(`${nation.name} で反乱が発生しました。人口が減少しました。`);
        }
    });
}

function moveShips() {
    nations.forEach(nation => {
        nation.ships.forEach(ship => {
            const speed = 5;
            const nearbyNation = nations.find(n => n !== nation && 
                Math.abs(n.x - ship.x) <= 100 && 
                Math.abs(n.y - ship.y) <= 100
            );

            if (nearbyNation) {
                if (ship.x < nearbyNation.x) ship.x += speed;
                if (ship.x > nearbyNation.x) ship.x -= speed;
                if (ship.y < nearbyNation.y) ship.y += speed;
                if (ship.y > nearbyNation.y) ship.y -= speed;
            } else {
                ship.x += (Math.random() - 0.5) * speed;
                ship.y += (Math.random() - 0.5) * speed;
            }
        });
    });
}

function war() {
    nations.forEach(attackingNation => {
        attackingNation.ships.forEach(ship => {
            nations.forEach(defendingNation => {
                if (defendingNation !== attackingNation &&
                    ship.x > defendingNation.x && ship.x < defendingNation.x + defendingNation.territorySize &&
                    ship.y > defendingNation.y && ship.y < defendingNation.y + defendingNation.territorySize) {

                    const attackStrength = attackingNation.armySize;
                    const defendStrength = defendingNation.armySize;

                    if (attackStrength > defendStrength) {
                        defendingNation.territory -= 1;
                        attackingNation.territory += 1;
                        displayNotification(`${attackingNation.name} が ${defendingNation.name} を攻撃し、領土を獲得しました。`);
                    } else {
                        attackingNation.territory -= 1;
                        displayNotification(`${attackingNation.name} の攻撃が失敗しました。`);
                    }

                    if (defendingNation.territory <= 0) {
                        mergeNations(attackingNation, defendingNation);
                    }
                }
            });
        });
    });
}

function mergeNations(winningNation, losingNation) {
    winningNation.territory += losingNation.territory;
    winningNation.exclaves.push(...losingNation.exclaves);
    nations = nations.filter(nation => nation !== losingNation);
    displayNotification(`${losingNation.name} は ${winningNation.name} に併合されました。`);
}

function displayNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function update() {
    year += 1;
    if (year % 4 === 0) {
        season = (season + 1) % 4;
    }
    rebellion();
    war();
    moveShips();
    draw();
    saveToLocalStorage();
}

function saveToLocalStorage() {
    const nationData = nations.map(nation => ({
        x: nation.x,
        y: nation.y,
        strength: nation.strength,
        population: nation.population,
        peaceLevel: nation.peaceLevel,
        color: nation.color,
        name: nation.name,
        armySize: nation.armySize,
        territorySize: nation.territorySize,
        territory: nation.territory,
        exclaves: nation.exclaves,
        ships: nation.ships
    }));
    localStorage.setItem('nations', JSON.stringify(nationData));
}

document.getElementById('startGame').addEventListener('click', () => {
    init();
    setInterval(update, 36.5 * 1000); // 1年 = 36.5秒
});

document.getElementById('resetGame').addEventListener('click', () => {
    localStorage.removeItem('nations');
    location.reload();
});
