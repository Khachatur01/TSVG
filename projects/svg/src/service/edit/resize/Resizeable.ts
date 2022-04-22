import {Rect} from "../../../model/Rect";
import {Point} from "../../../model/Point";

export interface Resizeable {
  get __lastRect__(): Rect;

  getRect(): Rect;

  __setRect__(rect: Rect, delta?: Point): void;

  __fixRect__(): void;
}
