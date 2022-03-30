import {Drawer} from "./Drawer";
import {TSVG} from "../../../TSVG";
import {Tool} from "../Tool";
import {Point} from "../../../model/Point";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementView} from "../../../element/ElementView";

export class DrawTool extends Tool {
  private _drawer: Drawer;
  private _isDrawing: boolean = false;
  public turnOnSelectToolOnDrawEnd: boolean = true;
  public perfect: boolean = false;

  public constructor(container: TSVG) {
    super(container);
    this._drawer = container.drawTools.free; /* set default drawer */
  }

  public makeMouseDown(position: Point, call: boolean = true, parameter?: any) {
    this._drawer?.makeMouseDown(position, call, parameter);
  }
  public makeMouseMove(position: Point, call: boolean = true, parameter?: any) {
    this._drawer?.makeMouseMove(position, call, parameter);
  }
  public makeMouseUp(position: Point, call: boolean = true, parameter?: any) {
    this._drawer?.makeMouseUp(position, call, parameter);
  }

  public get tool(): Drawer | null {
    return this._drawer;
  }
  public set tool(drawer: Drawer | null) {
    if (!drawer) return;
    this._drawer?.stop();
    drawer.drawTool = this;
    this._drawer = drawer;
  }

  protected _on(call: boolean = true) {
    this._isOn = true;
    this._drawer?.start(call);

    this._container.blur();

    this._container.style.changeCursor(this._drawer.cursor);
  }
  public off(call: boolean = true) {
    this._isOn = false;
    this._drawer?.stop(call);
  }

  public drawing() {
    this._isDrawing = true;
  }
  public drawingEnd() {
    this._isDrawing = false;
  }

  public get type(): ElementType | undefined {
    return this._drawer?.type;
  }
  public get drawableElement(): ElementView | undefined {
    let drawableElement = this._drawer?.drawableElement; /* drawableElement may be null */
    if (drawableElement) {
      return drawableElement;
    } else {
      return undefined;
    }
  }
}
