const moveSection: number = 32;
const atack: number = 32;

enum ReliefLevel {
  LOWEST,
  MIDDLE,
  HIGHEST
}

enum ReliefType {
  SURFACE
}

enum ProbabilityReliefLevel {
  LOWEST = 80,
  HIGHEST = 95
}

enum GladiatorProperties {
  MIN_HEALTH = 80,
  MAX_HEALTH = 100,
  MIN_ACTION_SCORES = 80,
  MAX_ACTION_SCORES = 100,
  DEFAULT_ACTION_SCORES = 0
}

class Arena {
  map: Section[][];

  constructor(public height: number, public width: number) {
    this.height = height;
    this.width = width;
    this.map = this.createMap(height, width);
  }

  createMap(height: number, width: number): Section[][] {
    const map: Section[][] = [];

    for (let i = 0; i < height; i++) {
      const row: Section[] = [];

      for (let j = 0; j < width; j++) {
        row.push(new Section());
      }

      map.push(row);
    }

    return map;
  }

  showMap(): void {
    for (let i = 0; i < this.height; i++) {
      console.log(this.getMapRow(i));
    }
  }

  getMapRow(i: number): string {
    let row: string = "";

    for (let j = 0; j < this.width; j++) {
      row += this.map[i][j].getReliefLevel();
    }
    return row;
  }
  getMap(): string[] {
    const map: string[] = [];
    for (let i = 0; i < this.height; i++) {
      map.push(this.getMapRow(i));
    }
    return map;
  }

  getSection(x: number, y: number): Section {
    return this.map[x][y];
  }
}

class Section {
  reliefLevel: ReliefLevel;
  reliefType: ReliefType;

  constructor() {
    this.reliefLevel = this.setReliefLevel();
    this.reliefType = ReliefType.SURFACE;
  }

  setReliefLevel(): ReliefLevel {
    const rundomNumber: number = Math.random() * 100;

    switch (true) {
      case rundomNumber < ProbabilityReliefLevel.LOWEST:
        return ReliefLevel.LOWEST;
      case rundomNumber >= ProbabilityReliefLevel.LOWEST &&
        rundomNumber < ProbabilityReliefLevel.HIGHEST:
        return ReliefLevel.MIDDLE;
      default:
        return ReliefLevel.HIGHEST;
    }
  }

  getReliefLevel(): ReliefLevel {
    return this.reliefLevel;
  }
}

class Gladiator {
  public positionX: number;
  public positionY: number;
  public health: number;
  public actionScores: number;
  public currentActionScores: number;
  constructor(positionX, positionY) {
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

  restoreCurrentActionScores(): void {
    this.currentActionScores = this.actionScores;
  }

  getStats(): object {
    return {
      positionX: this.positionX,
      positionY: this.positionY,
      health: this.health,
      actionScores: this.actionScores,
      currentActionScores: this.currentActionScores
    };
  }

  getFightPosition(enemy: Gladiator): object {
    let x =
      this.positionX === enemy.positionX
        ? enemy.positionX
        : this.positionX > enemy.positionX
        ? enemy.positionX + 1
        : enemy.positionX - 1;
    let y =
      this.positionY === enemy.positionY
        ? enemy.positionY
        : this.positionY > enemy.positionY
        ? enemy.positionY + 1
        : enemy.positionY - 1;
    return {
      x,
      y
    };
  }
  move(neededPosition: any): void {
    const wayLength: number =
      Math.abs(this.positionX - neededPosition.x) +
      Math.abs(this.positionY - neededPosition.y);
    let wayPossibility: number = Math.floor(
      this.currentActionScores / moveSection
    );
    if (wayPossibility > wayLength) {
      wayPossibility = wayLength;
    }
    this.currentActionScores -= wayPossibility * moveSection;
    let wayMap = [];
    for (
      let i = Math.min(neededPosition.x, this.positionX);
      i <= Math.max(neededPosition.x, this.positionX);
      i++
    ) {
      for (
        let j = Math.min(neededPosition.y, this.positionY);
        j <= Math.max(neededPosition.y, this.positionY);
        j++
      ) {
        let caseWayLength =
          Math.abs(i - neededPosition.x) + Math.abs(j - neededPosition.y);
        wayMap.push({
          x: i,
          y: j,
          caseWayLength
        });
      }
    }
    wayMap = wayMap.filter(
      coordinates => wayLength - wayPossibility == coordinates.caseWayLength
    );

    if (wayMap.length > 1) {
      wayMap.sort((firstEl, secondEl) => {
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
  }

  tryAtack(enemy, arena): void {
    const x: number = (this.positionX - enemy.positionX) ** 2;
    const y: number = (this.positionY - enemy.positionY) ** 2;
    if (x === 1 && y === 1 && this.currentActionScores > atack) {
      let chanceOfSuccses: number = Math.random() * 120;
      const reliefLevel: ReliefLevel =
        arena.map[this.positionX][this.positionY].getReliefLevel() -
        arena.map[enemy.positionX][enemy.positionY].getReliefLevel();
      chanceOfSuccses += chanceOfSuccses * 0.2 * reliefLevel;
      if (chanceOfSuccses >= 100) {
        enemy.health = 0;
      }
    }
  }
}

class Duel {
  public gladiators: Gladiator[];
  public arena: Arena;
  constructor(gladiators, arena) {
    this.gladiators = gladiators;
    this.arena = arena;
  }
  fight(): void {
    while (this.gladiators[0].health > 0 && this.gladiators[1].health > 0) {
      this.gladiators[0].restoreCurrentActionScores();
      this.gladiators[1].restoreCurrentActionScores();
      this.showCurrentPositions();
      this.gladiators[0].move(
        this.gladiators[0].getFightPosition(this.gladiators[1])
      );
      this.showCurrentPositions();
      this.gladiators[1].move(
        this.gladiators[1].getFightPosition(this.gladiators[0])
      );
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
    const map: string[] = this.arena.getMap();
    const firstGladiator: Gladiator = this.gladiators[0];
    const secondGladiator: Gladiator = this.gladiators[1];
    let rowArray = map[firstGladiator.positionX].split("");
    rowArray[firstGladiator.positionY] = "*";
    let row = rowArray.join("");
    map[firstGladiator.positionX] = row;
    rowArray = map[secondGladiator.positionX].split("");
    rowArray[secondGladiator.positionY] = "#";
    row = rowArray.join("");
    map[secondGladiator.positionX] = row;
    for (let i = 0; i < map.length; i++) {
      rowArray = map[i].split("");
      for (let j = 0; j < rowArray.length; j++) {
        if (rowArray[j] != "*" && rowArray[j] != "#") {
          rowArray[j] = " ";
        }
      }
      map[i] = rowArray.join("");
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
