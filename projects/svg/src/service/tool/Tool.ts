import {Container} from "../../Container";
import {Point} from "../../model/Point";
import {Cursor} from "../../dataSource/constant/Cursor";

export abstract class Tool {
  protected _cursor: Cursor = Cursor.NO_TOOL;
  protected readonly _container: Container;
  protected _isOn: boolean = false;
  protected _mouseCurrentPos: Point = {x: 0, y: 0}; /* current position needed for touch end event, because touch end event can't catch end position */

  protected constructor(container: Container) {
    this._container = container;
  }

  abstract makeMouseDown(position: Point, call?: boolean, additional?: any): void;
  abstract makeMouseMove(position: Point, call?: boolean, additional?: any): void;
  abstract makeMouseUp(position: Point, call?: boolean, additional?: any): void;

  public get container() {
    return this._container;
  }

  public get cursor(): Cursor {
    return this._cursor;
  }

  public on(call: boolean = true): void {
    this._container.tools.activeTool?.off(call);
    this._container.tools.activeTool = this;
    this._isOn = true;
  }
  public off(call: boolean = true): void {
    this._container.tools.activeTool = null;
    this._container.style.changeCursor(Cursor.NO_TOOL);
    this._isOn = false;
  }

  public isOn(): boolean {
    return this._isOn;
  }

  get mouseCurrentPos(): Point {
    return this._mouseCurrentPos;
  }
  set __mouseCurrentPos__(position: Point) {
    this._mouseCurrentPos = position;
  }
}
