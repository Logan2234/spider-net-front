export class Vector2D {
    constructor(
        public x: number = 0,
        public y: number = 0
    ) {}

    add(vector: Vector2D): this {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    multiply(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    static add(v1: Vector2D, v2: Vector2D): Vector2D {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }

    getAngle(otherNode: Vector2D): number {
        return Math.atan2(otherNode.y - this.y, otherNode.x - this.x);
    }

    getDistance(otherNode: Vector2D): number;
    getDistance(x: number, y: number): number;

    getDistance(arg1: Vector2D | number, arg2?: number): number {
        if (arg1 instanceof Vector2D) {
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
