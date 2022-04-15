import {Point} from "../../../model/Point";

export interface Draggable {
  drag(position: Point): void;

  get SVG(): SVGElement;

  fixRect(): void;
}
