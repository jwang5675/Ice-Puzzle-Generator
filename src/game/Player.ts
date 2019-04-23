import {vec2} from 'gl-matrix';


export default class Player {
	position: vec2;
	map: string[][];
	state: any;

	constructor(pos: vec2, map: string[][]) {
		this.position = pos;
		this.map = map;
		this.state = null;

		// Setup Event Listeners
		document.onkeydown = this.keypress.bind(this);
	}

	keypress(event: any) {
		if (event.keyCode == '38') {
			if (this.state == null) {
	        	this.state = this.up;
	    	}
	    }
	    else if (event.keyCode == '40') {
	    	if (this.state == null) {
	        	this.state = this.down;
	    	}
	    }
	    else if (event.keyCode == '37') {
	    	if (this.state == null) {
	    		this.state = this.left;
	    	}
	    }
	    else if (event.keyCode == '39') {
	    	if (this.state == null) {
	    		this.state = this.right;
	    	}
	    }
	}

	testMovement(x: number, y: number) {
		if (x >= 0 && x < this.map.length && y >=0 && y < this.map[0].length) {
			if (this.map[x][y] != 'O') {
				this.position[0] = x;
				this.position[1] = y;
				return true;
			}
		}
		return false;
	}

	left() {
		let x: number = this.position[0] - 1;
		let y: number = this.position[1];
		if (!this.testMovement(x, y)) {
			this.state = null;
		}
	}

	right() {
		let x: number = this.position[0] + 1;
		let y: number = this.position[1];
		if (!this.testMovement(x, y)) {
			this.state = null;
		}
	}

	down() {
		let x: number = this.position[0];
		let y: number = this.position[1] - 1;
		if (!this.testMovement(x, y)) {
			this.state = null;
		}
	}

	up() {
		let x: number = this.position[0];
		let y: number = this.position[1] + 1;
		if (!this.testMovement(x, y)) {
			this.state = null;
		}
	}

	tick() {
		if (this.state) {
			this.state();
		}
	}
}