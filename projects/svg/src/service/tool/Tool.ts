import {Container} from "../../Container";
import {Point} from "../../model/Point";

export abstract class Tool {
  protected readonly _container: Container;
  protected _isOn: boolean = false;

  protected constructor(container: Container) {
    this._container = container;
  }

  public get container() {
    return this._container;
  }

  protected abstract _on(call?: boolean): void; /* setMouseEvents: boolean = true */
  public on(call: boolean = true): void {
    this._container.activeTool.off(call);
    this._container.activeTool = this;
    this._on(call);
  }

  abstract off(call?: boolean): void;

  public isOn(): boolean {
    return this._isOn;
  }

  abstract makeMouseDown(position: Point, call?: boolean, parameter?: any): void;
  abstract makeMouseMove(position: Point, call?: boolean, parameter?: any): void;
  abstract makeMouseUp(position: Point, call?: boolean, parameter?: any): void;
}
