import MapGenerator from './MapGenerator';

export default class PerformanceTest {
	mapGenerator: MapGenerator;

	constructor() {
		this.mapGenerator = new MapGenerator();
	}

	runDifficulty(difficulty: string) {
		let start: number = Date.now();
		for (let i: number = 0; i < 10000; i++) {
			this.mapGenerator.generateMap(30, 35, difficulty);
		}
		let end: number = Date.now() - start;
		console.log('Created 10,000 ' + difficulty + ' maps, took ' + end / 1000 + ' seconds.');
	}

	runPerformanceTest() {
		console.log("Starting performance test...");
		this.runDifficulty('easy');
		this.runDifficulty('medium');
		this.runDifficulty('hard');
	}
}