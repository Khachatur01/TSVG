import {Point} from "../../../model/Point";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementView} from "../../../element/ElementView";

export interface Drawable {
  turnOnSelectToolOnDrawEnd: boolean;
  _new(): Drawable;
  start(call?: boolean): void;
  stop(call?: boolean): void;

  makeMouseDown(position: Point, call?: boolean, parameter?: any): void;
  makeMouseMove(position: Point, call?: boolean, parameter?: any): void;
  makeMouseUp(position: Point, call?: boolean, parameter?: any): void;

  get type(): ElementType;
  get drawableElement(): ElementView | null;
}
