export class Point2D {
    constructor(
        public x: number = 0,
        public y: number = 0
    ) {}

    getAngle(otherNode: Point2D): number {
        return Math.atan2(otherNode.y - this.y, otherNode.x - this.x);
    }

    getDistance(otherNode: Point2D): number;
    getDistance(x: number, y: number): number;

    getDistance(arg1: Point2D | number, arg2?: number): number {
        if (arg1 instanceof Point2D) {
            return Math.sqrt(Math.pow(arg1.x - this.x, 2) + Math.pow(arg1.y - this.y, 2));
        } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
            return Math.sqrt(Math.pow(arg1 - this.x, 2) + Math.pow(arg2 - this.y, 2));
        }

        throw new Error('Invalid arguments');
    }
}

export interface DrawableElement {
    draw(ctx: CanvasRenderingContext2D): void;
}
