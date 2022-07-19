import {Point} from "../../../model/Point";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {DrawTool} from "./DrawTool";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {Drawable} from "./type/Drawable";

export abstract class Drawer {
  public drawTool: DrawTool | null = null;
  public cursor: Cursor = Cursor.DRAW;

  public abstract start(call?: boolean): void;
  public abstract stop(call?: boolean): void;
  public abstract stopDrawing(call?: boolean): void;

  public abstract makeMouseDown(position: Point, call?: boolean, parameter?: any): void;
  public abstract makeMouseMove(position: Point, call?: boolean, parameter?: any): void;
  public abstract makeMouseUp(position: Point, call?: boolean, parameter?: any): void;

  public abstract _new(): Drawer;
  public abstract get type(): ElementType;
  public abstract get drawableElement(): Drawable | null;
}
