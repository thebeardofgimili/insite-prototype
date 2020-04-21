import { Room, Client } from "colyseus";
import { Player } from "./Player";
import { State } from "./State";

export class ArenaRoom extends Room<State> {

  onCreate() {
    this.setState(new State());
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "JOINED");
    this.state.createPlayer(client.sessionId);
  }

  onMessage(client: Client, message: any) {
    const player = this.state.players[client.sessionId];
    const [command, data] = message;

  // change angle
    if (command === "mouse") {
      player.speed = 10;
      player.targetx = data.x;
      player.targety = data.y
      player.angle = Math.atan2(player.y - data.y, player.x - data.x);
    }

  }

  onLeave(client: Client) {
    console.log(client.sessionId, "LEFT!");
    delete this.state.players[client.sessionId];
  }

}
