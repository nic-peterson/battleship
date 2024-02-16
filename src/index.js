import "./style.css";
import { createShip } from "./ship.js";

const ship = createShip(3, "horizontal", "cruiser");
//console.log(ship);
console.log(`The ship's length is ${ship.getLength()}`);
console.log(`The ship's type is ${ship.getType()}`);
console.log(`The ship's orientation is ${ship.getOrientation()}`);
console.log(`The ship has been hit ${ship.getHits()} times`);
