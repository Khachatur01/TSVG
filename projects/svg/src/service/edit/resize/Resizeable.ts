import {Size} from "../../../model/Size";
import {Rect} from "../../../model/Rect";
import {Point} from "../../../model/Point";

export interface Resizeable {
  get lastRect(): Rect;

  get size(): Size;

  setSize(rect: Rect, delta: Point | null): void;

  fixRect(): void;

  fixSize(): void;
}
