import {Point} from "../../../model/Point";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementView} from "../../../element/ElementView";
import {DrawTool} from "./DrawTool";

export interface Drawable {
  drawTool: DrawTool | null;
  _new(): Drawable;
  start(call?: boolean): void;
  stop(call?: boolean): void;

  makeMouseDown(position: Point, call?: boolean, parameter?: any): void;
  makeMouseMove(position: Point, call?: boolean, parameter?: any): void;
  makeMouseUp(position: Point, call?: boolean, parameter?: any): void;

  get type(): ElementType;
  get drawableElement(): ElementView | null;
}
