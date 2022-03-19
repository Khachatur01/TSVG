import {Drawable} from "./Drawable";
import {TSVG} from "../../../TSVG";
import {Tool} from "../Tool";
import {Point} from "../../../model/Point";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementView} from "../../../element/ElementView";

export class DrawTool extends Tool {
  private _drawTool: Drawable | null = null;
  private _isDrawing: boolean = false;
  public turnOnSelectToolOnDrawEnd: boolean = true;

  public constructor(container: TSVG) {
    super(container);
  }

  public makeMouseDown(position: Point, call: boolean = true, parameter?: any) {
    this._drawTool?.makeMouseDown(position, call, parameter);
  }
  public makeMouseMove(position: Point, call: boolean = true, parameter?: any) {
    this._drawTool?.makeMouseMove(position, call, parameter);
  }
  public makeMouseUp(position: Point, call: boolean = true, parameter?: any) {
    this._drawTool?.makeMouseUp(position, call, parameter);
  }

  public get tool(): Drawable | null {
    return this._drawTool;
  }
  public set tool(drawTool: Drawable | null) {
    if (!drawTool) return;
    this._drawTool?.stop();
    this._drawTool = drawTool;
    this._drawTool.turnOnSelectToolOnDrawEnd = this.turnOnSelectToolOnDrawEnd;
  }

  protected _on(call: boolean = true) {
    this._isOn = true;
    this._drawTool?.start(call);

    this._container.HTML.style.cursor = "crosshair";
    this._container.blur();
  }
  public off(call: boolean = true) {
    this._isOn = false;
    this._drawTool?.stop(call);

    this._container.HTML.style.cursor = "default";
  }

  public drawing() {
    this._isDrawing = true;
  }
  public drawingEnd() {
    this._isDrawing = false;
  }

  public get type(): ElementType | undefined {
    return this._drawTool?.type;
  }
  public get drawableElement(): ElementView | undefined {
    let drawableElement = this._drawTool?.drawableElement; /* drawableElement may be null */
    if (drawableElement) {
      return drawableElement;
    } else {
      return undefined;
    }
  }
}
