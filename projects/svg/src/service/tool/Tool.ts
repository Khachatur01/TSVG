import {Container} from "../../Container";
import {Point} from "../../model/Point";
import {Cursor} from "../../dataSource/constant/Cursor";

export abstract class Tool {
  protected _cursor: Cursor = Cursor.NO_TOOL;
  protected readonly _container: Container;
  protected _isOn: boolean = false;

  protected constructor(container: Container) {
    this._container = container;
  }

  abstract makeMouseDown(position: Point, call?: boolean, parameter?: any): void;
  abstract makeMouseMove(position: Point, call?: boolean, parameter?: any): void;
  abstract makeMouseUp(position: Point, call?: boolean, parameter?: any): void;

  public get container() {
    return this._container;
  }

  public get cursor(): Cursor {
    return this._cursor;
  }

  public on(call: boolean = true): void {
    this._container.activeTool?.off(call);
    this._container.activeTool = this;
  }
  public off(call: boolean = true): void {
    this._container.style.changeCursor(Cursor.NO_TOOL);
  }

  public isOn(): boolean {
    return this._isOn;
  }
}
