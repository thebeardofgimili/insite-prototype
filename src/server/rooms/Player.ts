import { Schema, type } from "@colyseus/schema";


export class Player extends Schema {

    @type("float64") x: number;
    @type("float64") y: number;
    @type("string") name: string;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;

        // Random name for now
        const names = ['Aang', 'Bob', 'Chris', 'Elise', 'Felicity', 'Feng', 'Jane', 'London', 'Niaomi', 'Tatiana', 'Yui'];
        this.name = names[Math.floor(Math.random() * names.length)];
    }

    static distance(a: Player, b: Player) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }
}