import {TSVG} from "../../TSVG";
import {Point} from "../../model/Point";

export abstract class Tool {
  protected readonly _container: TSVG;
  protected _isOn: boolean = false;

  protected constructor(container: TSVG) {
    this._container = container;
  }

  public get container() {
    return this._container;
  }

  protected abstract _on(setMouseEvents?: boolean): void; /* setMouseEvents: boolean = true */
  public on(setMouseEvents: boolean = true): void {
    this._container.activeTool.off();
    this._container.activeTool = this;
    this._on(setMouseEvents);
  }

  abstract off(): void;

  public isOn(): boolean {
    return this._isOn;
  }

  abstract makeMouseDown(position: Point, parameter?: any): void;
  abstract makeMouseMove(position: Point, parameter?: any): void;
  abstract makeMouseUp(position: Point, parameter?: any): void;
}
