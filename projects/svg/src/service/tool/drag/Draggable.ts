import {Point} from "../../../model/Point";

export interface Draggable {
  get position(): Point;

  set position(position: Point);

  get SVG(): SVGElement;

  fixRect(): void;

  fixPosition(): void;
}
