import {Point} from '../../../model/Point';

export interface Draggable {
  __drag__(position: Point): void;

  get SVG(): SVGElement;

  __fixRect__(): void;
}
