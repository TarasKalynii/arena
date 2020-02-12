const moveSection = 32;
const atack = 32;

class Arena {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.map = this.createMap(height, width);
    }

    createMap(height, width) {
        const map = [];
        for (let i = 0; i < height; i++) {
            const row = [];
            for (let j = 0; j < width; j++) {
                row.push(new Section());
            }
            map.push(row);
        }
        return map;
    }

    showMap() {
        for (let i = 0; i < this.height; i++) {
            console.log(this.getMapRow(i));
        }
    }

    getMapRow(i) {
        let row = '';
        for (let j = 0; j < this.width; j++) {
            row += this.map[i][j].getReliefLevel();
        }
        return row;
    }
    getMap() {
        const map = []
        for (let i = 0; i < this.height; i++) {
            map.push(this.getMapRow(i));
        }
        return map;
    }

    getSection(x, y) {
        return this.map[x][y];
    }
}

class Section {
    constructor() {
        this.reliefLevel = this.setReliefLevel();
        this.reliefType = "surface";
    }

    setReliefLevel() {
        const rundomNumber = Math.random() * (100 - 0) + 0;
        return rundomNumber < 80 ? 1 : rundomNumber >= 80 && rundomNumber < 95 ? 0 : 2;
    }

    getReliefLevel() {
        return this.reliefLevel;
    }
}

class Gladiator {
    constructor(positionX, positionY) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.health = Math.random() * (100 - 80) + 80;
        this.actionScores = Math.random() * (100 - 80) + 80;
        this.currentActionScores = 0;
    }

    restoreCurrentActionScores() {
        this.currentActionScores = this.actionScores;
    }

    getStats() {
        return {
            positionX: this.positionX,
            positionY: this.positionY,
            health: this.health,
            actionScores: this.actionScores,
            currentActionScores: this.currentActionScores,
        };
    }

    getFightPosition(enemy) {
        let x = this.positionX === enemy.positionX ? enemy.positionX : this.positionX > enemy.positionX ? enemy.positionX + 1 : enemy.positionX - 1;
        let y = this.positionY === enemy.positionY ? enemy.positionY : this.positionY > enemy.positionY ? enemy.positionY + 1 : enemy.positionY - 1;
        return {
            x,
            y,
        };
    }
    move(neededPosition) {
        const wayLength = Math.abs(this.positionX - neededPosition.x) + Math.abs(this.positionY - neededPosition.y);
        let wayPossibility = parseInt(this.currentActionScores / moveSection);
        if (wayPossibility > wayLength) {
            wayPossibility = wayLength;
        }
        this.currentActionScores -= wayPossibility * moveSection;
        let wayMap = [];
        for (let i = Math.min(neededPosition.x, this.positionX); i <= Math.max(neededPosition.x, this.positionX); i++) {
            for (let j = Math.min(neededPosition.y, this.positionY); j <= Math.max(neededPosition.y, this.positionY); j++) {
                let caseWayLength = Math.abs(i - neededPosition.x) + Math.abs(j - neededPosition.y);
                wayMap.push({
                    x: i,
                    y: j,
                    caseWayLength,
                });
            }
        }
        wayMap = wayMap.filter((coordinates) => {
            return wayLength - wayPossibility == coordinates.caseWayLength;
        });
        if (wayMap.length > 1) {
            wayMap.sort((firstEl, secondEl) => {
                firstEl.reliefLevel = arena.getSection(firstEl.x, firstEl.y).getReliefLevel();
                secondEl.reliefLevel = arena.getSection(secondEl.x, secondEl.y).getReliefLevel();
                return firstEl.reliefLevel < secondEl.reliefLevel;
            });
        }
        this.positionX = wayMap[0].x;
        this.positionY = wayMap[0].y;
    }

    tryAtack(enemy, arena) {
        const x = (this.positionX - enemy.positionX) * (this.positionX - enemy.positionX);
        const y = (this.positionY - enemy.positionY) * (this.positionY - enemy.positionY);
        if (x === 1 && y === 1 && this.currentActionScores > atack) {
            let chanceOfSuccses = Math.random() * (120 - 0) + 0;
            const reliefLevel = arena.map[this.positionX][this.positionY].getReliefLevel() - arena.map[enemy.positionX][enemy.positionY].getReliefLevel();
            chanceOfSuccses += chanceOfSuccses * 0.2 * reliefLevel;
            if (chanceOfSuccses >= 100) {
                enemy.health = 0;
            }
        }
    }
}

class Duel {
    constructor(gladiators, arena) {
        this.gladiators = gladiators;
        this.arena = arena;
    }
    fight() {
        while (this.gladiators[0].health > 0 && this.gladiators[1].health > 0) {
            this.gladiators[0].restoreCurrentActionScores();
            this.gladiators[1].restoreCurrentActionScores();
            this.showCurrentPositions();
            this.gladiators[0].move(this.gladiators[0].getFightPosition(this.gladiators[1]));
            this.showCurrentPositions();
            this.gladiators[1].move(this.gladiators[1].getFightPosition(this.gladiators[0]));
            if (this.gladiators[0].actionScores > this.gladiators[1].actionScores) {
                if (this.gladiators[0].health) {
                    this.gladiators[0].tryAtack(this.gladiators[1], this.arena);
                } else {
                    console.log("Second gladiator was killed!");
                }
                if (this.gladiators[1].health) {
                    this.gladiators[1].tryAtack(this.gladiators[0], this.arena);
                    if (!this.gladiators[0].health) {
                        console.log("Second gladiator was killed!");
                    }
                } else {
                    console.log("First gladiator was killed!");
                }
            } else {
                if (this.gladiators[1].health) {
                    this.gladiators[1].tryAtack(this.gladiators[0], this.arena);
                } else {
                    console.log("Second gladiator was killed!");
                }
                if (this.gladiators[0].health) {
                    this.gladiators[0].tryAtack(this.gladiators[1], this.arena);
                    if (!this.gladiators[1].health) {
                        console.log("Second gladiator was killed!");
                    }
                } else {
                    console.log("First gladiator was killed!");
                }
            }
        }
    }
    showCurrentPositions() {
        const map = this.arena.getMap();
        const firstGladiator = this.gladiators[0];
        const secondGladiator = this.gladiators[1];
        let row = map[firstGladiator.positionX].split('');
        row[firstGladiator.positionY] = "*";
        row = row.join('');
        map[firstGladiator.positionX] = row;
        row = map[secondGladiator.positionX].split('');
        row[secondGladiator.positionY] = "#";
        row = row.join('');
        map[secondGladiator.positionX] = row;
        for (let i = 0; i < map.length; i++) {
            row = map[i].split('');
            for (let j = 0; j < row.length; j++) {
                if (row[j] != "*" && row[j] != "#") {
                    row[j] = " ";
                }
            }
            map[i] = row.join('');
        }
        let line = "__";
        for (let i = 0; i < row.length; i++) {
            line = line + "_";
        }
        console.log(line);
        for (let i = 0; i < map.length; i++) {
            console.log(`|${map[i]}|`);
        }
        line = "--";
        for (let i = 0; i < row.length; i++) {
            line = line + "-";
        }
        console.log(line);
    }
}
const arena = new Arena(10, 30);
// arena.showMap();
// console.log(arena.getMap());
const gladiatorF = new Gladiator(0, 0);
const gladiatorS = new Gladiator(9, 29);
const duel = new Duel([gladiatorF, gladiatorS], arena);
duel.fight();
