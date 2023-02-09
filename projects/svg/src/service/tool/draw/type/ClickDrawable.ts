import {Point} from '../../../../model/Point';
import {Drawable} from './Drawable';

export interface ClickDrawable extends Drawable {
  get points(): Point[];
  set points(points: Point[]);

  getPoint(index: number): Point;
  pushPoint(point: Point): void;
  removePoint(index: number): void;
  replacePoint(index: number, point: Point): void;
  isComplete(): boolean;
}
