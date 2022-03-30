import {Drawer} from "../Drawer";
import {TSVG} from "../../../../TSVG";
import {PointedView} from "../../../../element/shape/pointed/PointedView";
import {Point} from "../../../../model/Point";
import {Angle} from "../../../math/Angle";
import {Callback} from "../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {ElementView} from "../../../../element/ElementView";

export abstract class ClickDraw extends Drawer {
  protected container: TSVG;
  protected _drawableElement: PointedView | null = null;

  private _click = this.click.bind(this);
  private _move = this.move.bind(this);

  public constructor(container: TSVG) {
    super();
    this.container = container;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    position = this.container.grid.getSnapPoint(position);

    if (!this._drawableElement) {
      this._drawableElement = this.createDrawableElement(position);
      this.container.add(this._drawableElement);
    } else {
      this._drawableElement?.pushPoint(position);
    }
    if (call) {
      this.container.call(Callback.DRAW_MOUSE_DOWN, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    if (!this._drawableElement) return;

    if (this.container.grid.isSnap())
      position = this.container.grid.getSnapPoint(position);
    else if (this.drawTool?.perfect) {
      let lastPoint: Point = this._drawableElement.getPoint(-2);
      position = Angle.snapLineEnd(lastPoint, position) as Point;
    }

    this._drawableElement.replacePoint(-1, position);

    if (call) {
      this.container.call(Callback.DRAW_MOUSE_MOVE, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point) {}

  public abstract override _new(): ClickDraw;
  public abstract override get type(): ElementType;
  public get drawableElement(): ElementView | null {
    return this._drawableElement;
  }

  protected abstract createDrawableElement(position: Point, ownerId?: string, index?: number): PointedView;

  protected click(event: MouseEvent | TouchEvent) {
    this.container.drawTool.drawing();
    let containerRect = this.container?.HTML.getBoundingClientRect();

    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    this.makeMouseDown({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }
  protected move(event: MouseEvent | TouchEvent) {
    let containerRect = this.container?.HTML.getBoundingClientRect();
    if (!containerRect) return;

    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();
    this.makeMouseMove({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }

  public start(call: boolean = true): void {
    this.container.HTML.addEventListener('mousedown', this._click);
    this.container.HTML.addEventListener('touchstart', this._click);
    document.addEventListener("mousemove", this._move);
    document.addEventListener("touchmove", this._move);
  }
  public stop(call: boolean = true): void {
    this.container?.HTML.removeEventListener('mousedown', this._click);
    this.container?.HTML.removeEventListener('touchstart', this._click);
    document.removeEventListener('mousemove', this._move);
    document.removeEventListener('touchmove', this._move);
    if (!this._drawableElement || !this.container) return;

    if (this._drawableElement.isComplete()) {
      this._drawableElement.removePoint(-1);
      this.container.drawTool.drawingEnd();
      this._drawableElement.refPoint = this._drawableElement.center;

      if (this.drawTool?.turnOnSelectToolOnDrawEnd) {
        this.container.blur();
        this.container.focus(this._drawableElement);
        this.container.focused.fixRect();
      }
    } else {
      this.container.remove(this._drawableElement);
    }
    this._drawableElement = null;
    if (call) {
      this.container.call(Callback.STOP_CLICK_DRAWING);
    }
  }
}
