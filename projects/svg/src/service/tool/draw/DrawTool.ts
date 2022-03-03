import {Drawable} from "./Drawable";
import {TSVG} from "../../../TSVG";
import {Tool} from "../Tool";
import {Point} from "../../../model/Point";

export class DrawTool extends Tool {
  private _lastDrawTool: Drawable | null = null;
  private _drawTool: Drawable | null = null;
  private _isDrawing: boolean = false;

  public constructor(container: TSVG) {
    super(container);
  }

  public makeMouseDown(position: Point) {
    this._drawTool?.makeMouseDown(position);
  }
  public makeMouseMove(position: Point) {
    this._drawTool?.makeMouseMove(position);
  }
  public makeMouseUp(position: Point) {
    this._drawTool?.makeMouseUp(position);
  }

  public set tool(drawTool: Drawable) {
    this._drawTool?.stop();
    this._drawTool = drawTool;
    this._lastDrawTool = drawTool;
  }

  protected _on() {
    this._isOn = true;
    this._drawTool?.start(this._container);
    this._container.HTML.style.cursor = "crosshair";
    this._container.blur();
  }

  public off() {
    this._isOn = false;
    this._drawTool?.stop();
    this._container.HTML.style.cursor = "default";
  }

  public drawing() {
    this._isDrawing = true;
  }

  public drawingEnd() {
    this._isDrawing = false;
  }
}
