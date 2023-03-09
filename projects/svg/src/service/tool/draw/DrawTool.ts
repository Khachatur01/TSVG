import {Drawer} from './Drawer';
import {Container} from '../../../Container';
import {Tool} from '../Tool';
import {Point} from '../../../model/Point';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {ElementView} from '../../../element/ElementView';
import {Cursor} from '../../../dataSource/constant/Cursor';
import {FreeDrawer} from './mode/FreeDrawer';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';
import {Drawable} from './type/Drawable';

export class DrawTool extends Tool {
  private _drawer: Drawer;
  private _isDrawing: boolean = false;
  public perfect: boolean = false;

  public constructor(container: Container) {
    super(container);
    this._drawer = new FreeDrawer(this);
  }

  public makeMouseDown(position: Point, call: boolean = true, parameter?: any): void {
    this._drawer?.makeMouseDown(position, call, parameter);
  }
  public makeMouseMove(position: Point, call: boolean = true, parameter?: any): void {
    this._drawer?.makeMouseMove(position, call, parameter);
  }
  public makeMouseUp(position: Point, call: boolean = true, parameter?: any): void {
    this._drawer?.makeMouseUp(position, call, parameter);
  }

  public override get cursor(): Cursor {
    return this._drawer.cursor;
  }

  public getDrawer(): Drawer {
    return this._drawer;
  }
  public setDrawer(drawer: Drawer, call: boolean = true): void {
    if (!drawer) {
      return;
    }
    this._drawer.stop();
    drawer.drawTool = this;
    const oldDrawer: Drawer = this._drawer;
    this._drawer = drawer;
    if (call) {
      this._container.__call__(SVGEvent.DRAWER_CHANGED, {oldDrawer, newDrawer: drawer});
    }
  }

  public override on(call: boolean = true): boolean {
    if (!this._drawer) {
      return false;
    }
    super.on(call, false);
    this._drawer.start(call);
    this._container.style.changeCursor(this.cursor /* use getter */);

    this._container.blur();
    return true;
  }
  public override off(call: boolean = true): boolean {
    if (!super.off(call)) {
      return false;
    }
    this._drawer?.stop(call);

    this._container.blur();
    return true;
  }

  public get isDrawing(): boolean {
    return this._isDrawing;
  }
  public __drawing__(): void {
    this._isDrawing = true;
  }
  public __drawingEnd__(): void {
    this._isDrawing = false;
  }
  public stopDrawing(call: boolean = true): void { /* for click drawing */
    if (this._isDrawing) {
      this._drawer?.stopDrawing(call);
    }
  }

  public get type(): ElementType | undefined {
    return this._drawer?.type;
  }
  public get drawableElement(): ElementView | undefined {
    const drawableElement: Drawable | undefined = this._drawer?.drawableElement;
    if (drawableElement) {
      return drawableElement as ElementView;
    } else {
      return undefined;
    }
  }
}
