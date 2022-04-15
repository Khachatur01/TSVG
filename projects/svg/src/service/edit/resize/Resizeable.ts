import {Rect} from "../../../model/Rect";
import {Point} from "../../../model/Point";

export interface Resizeable {
  get lastRect(): Rect;

  getRect(): Rect;

  setRect(rect: Rect, delta?: Point): void;

  fixRect(): void;
}
