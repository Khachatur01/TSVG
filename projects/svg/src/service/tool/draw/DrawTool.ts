import {Drawer} from "./Drawer";
import {Container} from "../../../Container";
import {Tool} from "../Tool";
import {Point} from "../../../model/Point";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementView} from "../../../element/ElementView";

export class DrawTool extends Tool {
  private _drawer: Drawer | null = null;
  private _isDrawing: boolean = false;
  public toolAfterDrawing: Tool | null;
  public perfect: boolean = false;

  public constructor(container: Container) {
    super(container);
    this.toolAfterDrawing = this;
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

  public override on(call: boolean = true): void {
    if (!this._drawer) return;
    super.on(call);
    this._isOn = true;
    this._drawer.start(call);
    this._container.style.changeCursor(this._drawer.cursor);

    this._container.blur();
  }
  public override off(call: boolean = true) {
    super.off(call);
    this._isOn = false;
    this._drawer?.stop(call);
  }

  public __drawing__() {
    this._isDrawing = true;
  }
  public __drawingEnd__() {
    this._isDrawing = false;
  }
  public stopDrawing(call: boolean = true) { /* for click drawing */
    this._drawer?.stopDrawing(call);
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
