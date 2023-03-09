import {Container} from '../../Container';
import {Point} from '../../model/Point';
import {Cursor} from '../../dataSource/constant/Cursor';
import {SVGEvent} from '../../dataSource/constant/SVGEvent';

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

  public get container(): Container {
    return this._container;
  }

  public get cursor(): Cursor {
    return this._cursor;
  }

  public on(call: boolean = true, checkIfTheSameTool: boolean = true): boolean {
    /* don't turn on tool, if already turned on */
    if (checkIfTheSameTool && this === this._container.tools.activeTool) {
      return false;
    }
    this._container.tools.activeTool?.off(call);
    this._container.tools.activeTool = this;
    this._isOn = true;
    if (call) {
      this._container.__call__(SVGEvent.TOOL_ON, {tool: this});
    }
    return true;
  }
  public off(call: boolean = true): boolean {
    /* if this is the active tool, make active tool null */
    if (this === this._container.tools.activeTool) {
      this._container.tools.activeTool = null;
    }
    this._container.style.changeCursor(Cursor.NO_TOOL);
    this._isOn = false;
    if (call) {
      this._container.__call__(SVGEvent.TOOL_OFF, {tool: this});
    }
    return true;
  }

  public isOn(): boolean {
    return this._isOn;
  }

  public get mouseCurrentPos(): Point {
    return this._mouseCurrentPos;
  }
  public set __mouseCurrentPos__(position: Point) {
    this._mouseCurrentPos = position;
  }
}
