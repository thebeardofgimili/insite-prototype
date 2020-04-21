import nanoid from "nanoid";
import { Schema, type, MapSchema } from "@colyseus/schema";

import { Player } from "./Player";

const WORLD_SIZE = 2000;


export class State extends Schema {

  width = 4810;
  height = 3007;

  @type({ map: Player })
  players = new MapSchema<Player>();

  createPlayer (sessionId: string) {
    this.players[sessionId] = new Player(
      Math.random() * this.width,
      Math.random() * this.height
    );
  }

  removePlayer (player: Player) {
    this.players = this.players.filter(p => p != player);
  }

  update() {
    for (const sessionId in this.players) {
      const player = this.players[sessionId];

      if (player.speed > 0) {
        player.x -= (Math.cos(player.angle)) * player.speed;
        player.y -= (Math.sin(player.angle)) * player.speed;

        // apply boundary limits
        if (player.x < 0) { player.x = 0; }
        if (player.x > this.width) { player.x = this.width; }
        if (player.y < 0) { player.y = 0; }
        if (player.y > this.height) { player.y = this.height; }

        if (Math.sqrt(Math.pow(player.x - player.targetx, 2) + Math.pow(player.y - player.targety, 2)) < player.speed) {
          player.speed=0;
        }
      }

      


    }

  }
}
