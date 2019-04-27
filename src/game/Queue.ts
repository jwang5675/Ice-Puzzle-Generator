// Adapted from http://code.iamkate.com/javascript/queues/
export default class Queue {
    a: any[];
    b: number;

    constructor() {
        this.a = [];
        this.b = 0;
    }

    getLength() {
        return this.a.length - this.b;
    }

    isEmpty() {
        return 0 == this.a.length
    }

    enqueue(item: any) {
        this.a.push(item);
    }

    dequeue() {
        if (0 != this.a.length) {
            let c = this.a[this.b];
            2 * ++this.b >= this.a.length && (this.a = this.a.slice(this.b), this.b = 0);
            return c;
        } else {
            return null;
        }
    }

    peek() {
        return 0 < this.a.length ? this.a[this.b] : null;
    }

}