import { Point2D, type DrawableElement } from '$lib/types/drawableElement';

export class Node implements DrawableElement {
    private _noise: number;

    public acceleration: Point2D = new Point2D();
    public velocity: Point2D = new Point2D();

    public coord: Point2D = new Point2D();
    public radius: number = 1;
    public color: string = 'black';
    public label: string = '';
    public fill: boolean = false;

    constructor(
        coord: Point2D = new Point2D(0, 0),
        weight: number = 1,
        color: string = 'black',
        fill: boolean = false,
        label: string = ''
    ) {
        this.coord = coord;
        this.radius = 10 + 0.1 * weight; // TODO find a better function
        this.color = color;
        this.fill = fill;
        this.label = label;
        this._noise = ((Math.random() - 0.5) * 1000) / this.radius;
    }

    public get noise(): number {
        return this._noise;
    }

    public move(): void {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.coord.x += this.velocity.x;
        this.coord.y += this.velocity.y;
    }

    public translate(x: number, y: number): void {
        this.coord.x += x;
        this.coord.y += y;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.coord.x, this.coord.y, this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = this.color;
        ctx.stroke();

        if (this.fill) {
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    public toString(): string {
        return `(${this.coord.x}, ${this.coord.y})`;
    }
}
