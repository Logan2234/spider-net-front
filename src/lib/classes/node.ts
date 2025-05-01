import { GRAPH_TRANSITION_SPEED } from '$lib/constants/graph';
import { Vector2D, type DrawableElement } from '$lib/types/drawableElement';

export class Node implements DrawableElement {
    private _noise: number;

    private currentBackgroundOpacity: number = 0;
    private targetBackgroundOpacity: number = 0;

    public acceleration: Vector2D = new Vector2D();
    public velocity: Vector2D = new Vector2D();
    public coord: Vector2D = new Vector2D();

    public radius: number = 1;
    public color: string = 'black';
    public label: string = '';
    public hovered: boolean = false;

    constructor(
        coord: Vector2D = new Vector2D(),
        weight: number = 1,
        color: string = 'black',
        label: string = ''
    ) {
        this.coord = coord;
        this.radius = 2 + Math.sqrt(weight);
        this.color = color;
        this.label = label;
        this._noise = ((Math.random() - 0.5) * 100) / this.radius;
    }

    public get noise(): number {
        return this._noise;
    }

    public move(): void {
        this.coord.add(this.velocity.add(this.acceleration));
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

        this.targetBackgroundOpacity = this.hovered ? 1 : 0;

        this.currentBackgroundOpacity +=
            (this.targetBackgroundOpacity - this.currentBackgroundOpacity) * GRAPH_TRANSITION_SPEED;

        ctx.fillStyle = `rgba(0, 0, 0, ${this.currentBackgroundOpacity})`;
        ctx.fill();
    }

    public toString(): string {
        return `(${this.coord.x}, ${this.coord.y})`;
    }
}
