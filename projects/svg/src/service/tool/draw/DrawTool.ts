import {Drawable} from "./Drawable";
import {TSVG} from "../../../TSVG";
import {Tool} from "../Tool";
import {Point} from "../../../model/Point";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementView} from "../../../element/ElementView";

export class DrawTool extends Tool {
  private _drawable: Drawable | null = null;
  private _isDrawing: boolean = false;
  public turnOnSelectToolOnDrawEnd: boolean = true;
  public perfect: boolean = false;

  public constructor(container: TSVG) {
    super(container);
  }

  public makeMouseDown(position: Point, call: boolean = true, parameter?: any) {
    this._drawable?.makeMouseDown(position, call, parameter);
  }
  public makeMouseMove(position: Point, call: boolean = true, parameter?: any) {
    this._drawable?.makeMouseMove(position, call, parameter);
  }
  public makeMouseUp(position: Point, call: boolean = true, parameter?: any) {
    this._drawable?.makeMouseUp(position, call, parameter);
  }

  public get tool(): Drawable | null {
    return this._drawable;
  }
  public set tool(drawTool: Drawable | null) {
    if (!drawTool) return;
    this._drawable?.stop();
    drawTool.drawTool = this;
    this._drawable = drawTool;
  }

  protected _on(call: boolean = true) {
    this._isOn = true;
    this._drawable?.start(call);

    this._container.HTML.style.cursor = "crosshair";
    this._container.blur();
  }
  public off(call: boolean = true) {
    this._isOn = false;
    this._drawable?.stop(call);

    this._container.HTML.style.cursor = "default";
  }

  public drawing() {
    this._isDrawing = true;
  }
  public drawingEnd() {
    this._isDrawing = false;
  }

  public get type(): ElementType | undefined {
    return this._drawable?.type;
  }
  public get drawableElement(): ElementView | undefined {
    let drawableElement = this._drawable?.drawableElement; /* drawableElement may be null */
    if (drawableElement) {
      return drawableElement;
    } else {
      return undefined;
    }
  }
}
