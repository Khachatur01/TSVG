import {TSVG} from "../../../TSVG";
import {Point} from "../../../model/Point";

export interface Drawable {
  _new(): Drawable;
  start(container: TSVG): void;
  stop(): void;

  makeMouseDown(position: Point): void;
  makeMouseMove(position: Point): void;
  makeMouseUp(position: Point): void;
}
