import Queue from '../game/Queue';


export default class MapGenerator {
	rockThreshold: number;

	// Last map generated from previous generateMap() call
	currentMap: string[][];
	start: any;

	constructor() {
		this.rockThreshold = 0.125;
	}

	/*
	 * Returns a randomly generate map with dimensions x and y.
	 * The map returned is likely to be unsolvable.
	 */
	getRandomMap(x: number, y: number) {
		let map: string[][] = [];

		for (let i: number = 0; i < x; i++) {
			let currentRow: string[] = [];
			for (let j: number = 0; j < y; j++) {
				if (i == 0 || j == 0 || i == x - 1 || j == y - 1) {
					currentRow.push('O');
				} else {
					let random: number = Math.random();
					if (random < this.rockThreshold) {
						currentRow.push('O');
					} else {
						currentRow.push('.');
					}
				}
			}
			map.push(currentRow);
		}

		return map;
	}

	checkBounds(currX: number, currY: number, x: number, y: number) {
		return currX > -1 && currY > -1 && currX < x && currY < y;
	}

	findLeft(map: string[][], currX: number, currY: number, x: number, y: number) {
		let testX: number = currX - 1;
		let testY: number = currY;

		// If out of bounds, return current point
		if (!this.checkBounds(testX, testY, x, y)) {
			return {
				'x': currX,
				'y': currY,
			}
		}

		// Find left most point that hits a rock
		while (map[testX][testY] != 'O') {
			testX = testX - 1;

			// If out of bounds, break
			if (!this.checkBounds(testX, testY, x, y)) {
				break;
			}
		}

		return {
			'x': testX + 1,
			'y': testY,
		}
	}

	findRight(map: string[][], currX: number, currY: number, x: number, y: number) {
		let testX: number = currX + 1;
		let testY: number = currY;

		// If out of bounds, return current point
		if (!this.checkBounds(testX, testY, x, y)) {
			return {
				'x': currX,
				'y': currY,
			}
		}

		// Find right most point that hits a rock
		while (map[testX][testY] != 'O') {
			testX = testX + 1;

			// If out of bounds, break
			if (!this.checkBounds(testX, testY, x, y)) {
				break;
			}
		}

		return {
			'x': testX - 1,
			'y': testY,
		}
	}

	findUp(map: string[][], currX: number, currY: number, x: number, y: number) {
		let testX: number = currX;
		let testY: number = currY + 1;

		// If out of bounds, return current point
		if (!this.checkBounds(testX, testY, x, y)) {
			return {
				'x': currX,
				'y': currY,
			}
		}

		// Find up most point that hits a rock
		while (map[testX][testY] != 'O') {
			testY = testY + 1;

			// If out of bounds, break
			if (!this.checkBounds(testX, testY, x, y)) {
				break;
			}
		}

		return {
			'x': testX,
			'y': testY - 1,
		}
	}

	findDown(map: string[][], currX: number, currY: number, x: number, y: number) {
		let testX: number = currX;
		let testY: number = currY - 1;

		// If out of bounds, return current point
		if (!this.checkBounds(testX, testY, x, y)) {
			return {
				'x': currX,
				'y': currY,
			}
		}

		// Find down most point that hits a rock
		while (map[testX][testY] != 'O') {
			testY = testY - 1;

			// If out of bounds, break
			if (!this.checkBounds(testX, testY, x, y)) {
				break;
			}
		}

		return {
			'x': testX,
			'y': testY + 1,
		}
	}

	/*
	 * Checks map difficulty
	 */
	validDifficulty(difficulty: string, steps: number) {
		if (difficulty == 'easy') {
			return steps >= 3 && steps < 6;
		}
		if (difficulty == 'medium') {
			return steps >= 6 && steps < 10;
		}
		if (difficulty == 'hard') {
			return steps >= 10;
		}
		return true;
	}

	/*
	 * Generates a map of size (x, y);
	 */
	generateMap(x: number, y: number, difficulty: string): string[][] {
		let createdNewMap: boolean = false;
		// Tries to generate a solveable map
		while (!createdNewMap) {
			let map: string[][] = this.getRandomMap(x, y);

			// Generates random starting and ending point
			if (Math.random() < 0.5) {

			} else {

			}
			let start: number = Math.floor(Math.random() * y);
			map[0][start] = 'S';

			let end: number = Math.floor(Math.random() * y);
			map[x - 1][end] = 'E';

			// Check if the map is valid by running a BFS on the map
			let startingPoint: any = {
				'x': 0,
				'y': start,
				'steps': 0,
			};
			this.start = startingPoint;

			let endingPoint: any = {
				'x': x - 1,
				'y': end,
			};

			let discovered: boolean[][] = [];
			for (let i: number = 0; i < x; i++) {
				let row: boolean[] = [];
				for (let j: number = 0; j < y; j++) {
					row[j] = false;
				}
				discovered.push(row);
			}
			discovered[startingPoint.x][startingPoint.y] = true;

			let queue: Queue = new Queue();
			queue.enqueue(startingPoint);

			while (!queue.isEmpty()) {
				let currentPoint = queue.dequeue();

				// If we reach the end, possible to solve the map
				if (currentPoint.x == endingPoint.x && currentPoint.y == endingPoint.y) {
					if (!this.validDifficulty(difficulty, currentPoint['steps'])) {
						return this.generateMap(x, y, difficulty);
					} 
					this.currentMap = map;
					console.log("THIS MAP IS POSSIBLE TO SOLVE WITH " + currentPoint['steps'] + " STEPS");
					createdNewMap = true;
					return this.currentMap;
				}

				// Find all neighbors and add it to our queue
				let left: any = this.findLeft(map, currentPoint.x, currentPoint.y, x, y);
				if (left) {
					if (!discovered[left.x][left.y]) {
						discovered[left.x][left.y] = true;
						left['steps'] = currentPoint['steps'] + 1;
						queue.enqueue(left);
					}
				}

				let right: any = this.findRight(map, currentPoint.x, currentPoint.y, x, y);
				if (right) {
					if (!discovered[right.x][right.y]) {
						discovered[right.x][right.y] = true;
						right['steps'] = currentPoint['steps'] + 1;
						queue.enqueue(right);
					}
				}

				let up: any = this.findUp(map, currentPoint.x, currentPoint.y, x, y);
				if (up) {
					if (!discovered[up.x][up.y]) {
						discovered[up.x][up.y] = true;
						up['steps'] = currentPoint['steps'] + 1;
						queue.enqueue(up);
					}
				}

				let down: any = this.findDown(map, currentPoint.x, currentPoint.y, x, y);
				if (down) {
					if (!discovered[down.x][down.y]) {
						discovered[down.x][down.y] = true;
						down['steps'] = currentPoint['steps'] + 1;
						queue.enqueue(down);
					}
				}
			}
		}
	}

	/* 
	 * Prints out the last map generated from generateMap()
	 */
	printCurrentMap() {
		if (this.currentMap) {
			let map: string = "";

			for (let i: number = 0; i < this.currentMap.length; i++) {
				let currentRow: string[] = this.currentMap[i];
				let out: string = "";

				if (i < 10) {
					out = "0" + i + ":";
				} else {
					out = i + ":";
				}
				
				for (let j: number = 0; j < currentRow.length; j++) {
					out = out + currentRow[j];
				}
				map = map + out + "\n";
			}

			console.log(map);
		} else {
			console.log("current map is null");
		}
	}

}