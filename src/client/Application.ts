import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Room, Client } from "colyseus.js";
import { State } from "../server/rooms/State";

declare var process: {
    env:{
        NODE_ENV: string
    }
}

const ENDPOINT = (process.env.NODE_ENV==="development")
    ? "ws://localhost:8080"
    : "wss://insite-prototype.herokuapp.com";

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

export class Application extends PIXI.Application {
    players: { [id: string]: PIXI.Sprite } = {};
    currentPlayerEntity: PIXI.Sprite;

    client = new Client(ENDPOINT);
    room: Room<State>;

    viewport: Viewport;
    _interpolation: boolean;

    constructor () {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0xFFFFFF,
        });

        this.authenticate();

        
        // add viewport to stage
        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
        });
        // Draw map
        const map = PIXI.Sprite.from('../../resources/maps/SampleMap.png');
        map.x = -220; map.y = -289;
        this.viewport.addChild(map);

        this.stage.addChild(this.viewport.wheel().drag().clampZoom({minWidth: 3000, maxWidth: 8000}));
        this.viewport.fit();
        this.interpolation = false;

        this.viewport.on("clicked", (e) => {
            if (this.currentPlayerEntity) {
                const point = this.viewport.toLocal(e.screen);
                this.room.send(['mouse', { x: point.x, y: point.y }]);
            }
        });


    }

    async authenticate() {
        // anonymous auth
        //await this.client.auth.login();

        console.log("Success!", this.client.auth);

        this.room = await this.client.joinOrCreate<State>("arena");
        

        this.room.state.players.onAdd = (player, sessionId: string) => {

            const sprite = PIXI.Sprite.from(`../../resources/users/${player.name}.png`);
            sprite.scale.x = 2;
            sprite.scale.y = 2;
            sprite.x = player.x;
            sprite.y = player.y;
            this.viewport.addChild(sprite);

            this.players[sessionId] = sprite;

            // detecting current user
            if (sessionId === this.room.sessionId) {
                sprite.anchor.set(0.5);
                this.currentPlayerEntity = sprite;
                this.viewport.snapZoom({width: 5000, time: 0.1})
                this.viewport.snap(sprite.x,sprite.y, {time: 0.1, removeOnComplete: true});
            }

            player.onChange = (changes) => {
                const sprite = this.players[sessionId];

                // set x/y directly if interpolation is turned off
                if (!this._interpolation) {
                    sprite.x = player.x;
                    sprite.y = player.y;
                }
            }
        };

        this.room.state.players.onRemove = (_, sessionId: string) => {
            this.viewport.removeChild(this.players[sessionId]);
            this.players[sessionId].destroy();
            delete this.players[sessionId];
        };


    }

    set interpolation (bool: boolean) {
        this._interpolation = bool;

        if (this._interpolation) {
            this.loop();
        }
    }

    loop () {
        for (let id in this.players) {
            this.players[id].x = lerp(this.players[id].x, this.room.state.players[id].x, 0.2);
            this.players[id].y = lerp(this.players[id].y, this.room.state.players[id].y, 0.2);
        }

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}
