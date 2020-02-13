var moveSection = 32;
var atack = 32;
var ReliefLevel;
(function (ReliefLevel) {
    ReliefLevel[ReliefLevel["LOWEST"] = 0] = "LOWEST";
    ReliefLevel[ReliefLevel["MIDDLE"] = 1] = "MIDDLE";
    ReliefLevel[ReliefLevel["HIGHEST"] = 2] = "HIGHEST";
})(ReliefLevel || (ReliefLevel = {}));
var ReliefType;
(function (ReliefType) {
    ReliefType[ReliefType["SURFACE"] = 0] = "SURFACE";
})(ReliefType || (ReliefType = {}));
var ProbabilityReliefLevel;
(function (ProbabilityReliefLevel) {
    ProbabilityReliefLevel[ProbabilityReliefLevel["LOWEST"] = 80] = "LOWEST";
    ProbabilityReliefLevel[ProbabilityReliefLevel["HIGHEST"] = 95] = "HIGHEST";
})(ProbabilityReliefLevel || (ProbabilityReliefLevel = {}));
var GladiatorProperties;
(function (GladiatorProperties) {
    GladiatorProperties[GladiatorProperties["MIN_HEALTH"] = 80] = "MIN_HEALTH";
    GladiatorProperties[GladiatorProperties["MAX_HEALTH"] = 100] = "MAX_HEALTH";
    GladiatorProperties[GladiatorProperties["MIN_ACTION_SCORES"] = 80] = "MIN_ACTION_SCORES";
    GladiatorProperties[GladiatorProperties["MAX_ACTION_SCORES"] = 100] = "MAX_ACTION_SCORES";
    GladiatorProperties[GladiatorProperties["DEFAULT_ACTION_SCORES"] = 0] = "DEFAULT_ACTION_SCORES";
})(GladiatorProperties || (GladiatorProperties = {}));
var Arena = /** @class */ (function () {
    function Arena(height, width) {
        this.height = height;
        this.width = width;
        this.height = height;
        this.width = width;
        this.map = this.createMap(height, width);
    }
    Arena.prototype.createMap = function (height, width) {
        var map = [];
        for (var i = 0; i < height; i++) {
            var row = [];
            for (var j = 0; j < width; j++) {
                row.push(new Section());
            }
            map.push(row);
        }
        return map;
    };
    Arena.prototype.showMap = function () {
        for (var i = 0; i < this.height; i++) {
            console.log(this.getMapRow(i));
        }
    };
    Arena.prototype.getMapRow = function (i) {
        var row = "";
        for (var j = 0; j < this.width; j++) {
            row += this.map[i][j].getReliefLevel();
        }
        return row;
    };
    Arena.prototype.getMap = function () {
        var map = [];
        for (var i = 0; i < this.height; i++) {
            map.push(this.getMapRow(i));
        }
        return map;
    };
    Arena.prototype.getSection = function (x, y) {
        return this.map[x][y];
    };
    return Arena;
}());
var Section = /** @class */ (function () {
    function Section() {
        this.reliefLevel = this.setReliefLevel();
        this.reliefType = ReliefType.SURFACE;
    }
    Section.prototype.setReliefLevel = function () {
        var rundomNumber = Math.random() * 100;
        switch (true) {
            case rundomNumber < ProbabilityReliefLevel.LOWEST:
                return ReliefLevel.LOWEST;
            case rundomNumber >= ProbabilityReliefLevel.LOWEST &&
                rundomNumber < ProbabilityReliefLevel.HIGHEST:
                return ReliefLevel.MIDDLE;
            default:
                return ReliefLevel.HIGHEST;
        }
    };
    Section.prototype.getReliefLevel = function () {
        return this.reliefLevel;
    };
    return Section;
}());
var Gladiator = /** @class */ (function () {
    function Gladiator(positionX, positionY) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.health =
            Math.random() *
                (GladiatorProperties.MAX_HEALTH - GladiatorProperties.MIN_HEALTH) +
                GladiatorProperties.MIN_HEALTH;
        this.actionScores =
            Math.random() *
                (GladiatorProperties.MAX_ACTION_SCORES -
                    GladiatorProperties.MIN_ACTION_SCORES) +
                GladiatorProperties.MIN_ACTION_SCORES;
        this.currentActionScores = GladiatorProperties.DEFAULT_ACTION_SCORES;
    }
    Gladiator.prototype.restoreCurrentActionScores = function () {
        this.currentActionScores = this.actionScores;
    };
    Gladiator.prototype.getStats = function () {
        return {
            positionX: this.positionX,
            positionY: this.positionY,
            health: this.health,
            actionScores: this.actionScores,
            currentActionScores: this.currentActionScores
        };
    };
    Gladiator.prototype.getFightPosition = function (enemy) {
        var x = this.positionX === enemy.positionX
            ? enemy.positionX
            : this.positionX > enemy.positionX
                ? enemy.positionX + 1
                : enemy.positionX - 1;
        var y = this.positionY === enemy.positionY
            ? enemy.positionY
            : this.positionY > enemy.positionY
                ? enemy.positionY + 1
                : enemy.positionY - 1;
        return {
            x: x,
            y: y
        };
    };
    Gladiator.prototype.move = function (neededPosition) {
        var wayLength = Math.abs(this.positionX - neededPosition.x) +
            Math.abs(this.positionY - neededPosition.y);
        var wayPossibility = Math.floor(this.currentActionScores / moveSection);
        if (wayPossibility > wayLength) {
            wayPossibility = wayLength;
        }
        this.currentActionScores -= wayPossibility * moveSection;
        var wayMap = [];
        for (var i = Math.min(neededPosition.x, this.positionX); i <= Math.max(neededPosition.x, this.positionX); i++) {
            for (var j = Math.min(neededPosition.y, this.positionY); j <= Math.max(neededPosition.y, this.positionY); j++) {
                var caseWayLength = Math.abs(i - neededPosition.x) + Math.abs(j - neededPosition.y);
                wayMap.push({
                    x: i,
                    y: j,
                    caseWayLength: caseWayLength
                });
            }
        }
        wayMap = wayMap.filter(function (coordinates) {
            return wayLength - wayPossibility == coordinates.caseWayLength;
        });
        if (wayMap.length > 1) {
            wayMap.sort(function (firstEl, secondEl) {
                firstEl.reliefLevel = arena
                    .getSection(firstEl.x, firstEl.y)
                    .getReliefLevel();
                secondEl.reliefLevel = arena
                    .getSection(secondEl.x, secondEl.y)
                    .getReliefLevel();
                return firstEl.reliefLevel < secondEl.reliefLevel ? 1 : -1;
            });
        }
        this.positionX = wayMap[0].x;
        this.positionY = wayMap[0].y;
    };
    Gladiator.prototype.tryAtack = function (enemy, arena) {
        var x = (this.positionX - enemy.positionX) * (this.positionX - enemy.positionX);
        var y = (this.positionY - enemy.positionY) * (this.positionY - enemy.positionY);
        if (x === 1 && y === 1 && this.currentActionScores > atack) {
            var chanceOfSuccses = Math.random() * (120 - 0) + 0;
            var reliefLevel = arena.map[this.positionX][this.positionY].getReliefLevel() -
                arena.map[enemy.positionX][enemy.positionY].getReliefLevel();
            chanceOfSuccses += chanceOfSuccses * 0.2 * reliefLevel;
            if (chanceOfSuccses >= 100) {
                enemy.health = 0;
            }
        }
    };
    return Gladiator;
}());
var Duel = /** @class */ (function () {
    function Duel(gladiators, arena) {
        this.gladiators = gladiators;
        this.arena = arena;
    }
    Duel.prototype.fight = function () {
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
                }
                else {
                    console.log("Second gladiator was killed!");
                }
                if (this.gladiators[1].health) {
                    this.gladiators[1].tryAtack(this.gladiators[0], this.arena);
                    if (!this.gladiators[0].health) {
                        console.log("Second gladiator was killed!");
                    }
                }
                else {
                    console.log("First gladiator was killed!");
                }
            }
            else {
                if (this.gladiators[1].health) {
                    this.gladiators[1].tryAtack(this.gladiators[0], this.arena);
                }
                else {
                    console.log("Second gladiator was killed!");
                }
                if (this.gladiators[0].health) {
                    this.gladiators[0].tryAtack(this.gladiators[1], this.arena);
                    if (!this.gladiators[1].health) {
                        console.log("Second gladiator was killed!");
                    }
                }
                else {
                    console.log("First gladiator was killed!");
                }
            }
        }
    };
    Duel.prototype.showCurrentPositions = function () {
        var map = this.arena.getMap();
        var firstGladiator = this.gladiators[0];
        var secondGladiator = this.gladiators[1];
        var rowArray = map[firstGladiator.positionX].split("");
        rowArray[firstGladiator.positionY] = "*";
        var row = rowArray.join("");
        map[firstGladiator.positionX] = row;
        rowArray = map[secondGladiator.positionX].split("");
        rowArray[secondGladiator.positionY] = "#";
        row = rowArray.join("");
        map[secondGladiator.positionX] = row;
        for (var i = 0; i < map.length; i++) {
            rowArray = map[i].split("");
            for (var j = 0; j < rowArray.length; j++) {
                if (rowArray[j] != "*" && rowArray[j] != "#") {
                    rowArray[j] = " ";
                }
            }
            map[i] = rowArray.join("");
        }
        var line = "__";
        for (var i = 0; i < row.length; i++) {
            line = line + "_";
        }
        console.log(line);
        for (var i = 0; i < map.length; i++) {
            console.log("|" + map[i] + "|");
        }
        line = "--";
        for (var i = 0; i < row.length; i++) {
            line = line + "-";
        }
        console.log(line);
    };
    return Duel;
}());
var arena = new Arena(10, 30);
// arena.showMap();
// console.log(arena.getMap());
var gladiatorF = new Gladiator(0, 0);
var gladiatorS = new Gladiator(9, 29);
var duel = new Duel([gladiatorF, gladiatorS], arena);
duel.fight();
