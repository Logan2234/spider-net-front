import type { DrawableElement } from '$lib/types/drawableElement';
import type { Node } from './node';

export class Link implements DrawableElement {
    constructor(
        public from: Node,
        public to: Node
    ) {}

    draw(ctx: CanvasRenderingContext2D): void {
        const angle = this.from.coord.getAngle(this.to.coord);

        ctx.beginPath();
        ctx.moveTo(
            this.from.coord.x + Math.cos(angle) * this.from.radius,
            this.from.coord.y + Math.sin(angle) * this.from.radius
        );
        ctx.lineTo(
            this.to.coord.x - Math.cos(angle) * this.to.radius,
            this.to.coord.y - Math.sin(angle) * this.to.radius
        );
        ctx.strokeStyle = this.to.color;
        ctx.stroke();
    }

    toString(): string {
        return `(${this.from.coord.x}, ${this.from.coord.y}) -> (${this.to.coord.x}, ${this.to.coord.y})`;
    }
}
