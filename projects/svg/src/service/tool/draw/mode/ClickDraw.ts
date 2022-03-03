import {Drawable} from "../Drawable";
import {TSVG} from "../../../../TSVG";
import {PointedView} from "../../../../element/shape/pointed/PointedView";
import {Point} from "../../../../model/Point";
import {Angle} from "../../../math/Angle";
import {Callback} from "../../../../dataSource/Callback";

export abstract class ClickDraw implements Drawable {
  protected container: TSVG;
  protected drawableElement: PointedView | null = null;
  private _click = this.click.bind(this);
  private _move = this.move.bind(this);

  public constructor(container: TSVG) {
    this.container = container;
  }

  public makeMouseDown(position: Point) {

    position = this.container.grid.getSnapPoint(position);

    if (!this.drawableElement) {
      this.drawableElement = this.createDrawableElement(position);
      this.container.add(this.drawableElement);
    } else {
      this.drawableElement?.pushPoint(position);
    }
    this.container.call(Callback.DRAW_CLICK, {position: position});
  }
  public makeMouseMove(position: Point) {
    if (!this.drawableElement) return;

    if (this.container.grid.isSnap())
      position = this.container.grid.getSnapPoint(position);
    else if (this.container.perfect) {
      let lastPoint: Point = this.drawableElement.getPoint(-2);
      position = Angle.snapLineEnd(lastPoint, position) as Point;
    }

    this.drawableElement.replacePoint(-1, position);
    this.container.call(Callback.DRAW_MOVE, {position: position});
  }
  public makeMouseUp(position: Point) {}

  public abstract _new(): ClickDraw;
  protected abstract createDrawableElement(position: Point): PointedView;

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

  public start(container: TSVG): void {
    this.container = container;
    if (container.mouseEventSwitches.draw) {
      this.container.HTML.addEventListener('mousedown', this._click);
      this.container.HTML.addEventListener('touchstart', this._click);
      document.addEventListener("mousemove", this._move);
      document.addEventListener("touchmove", this._move);
    }
  }
  public stop(): void {
    this.container?.HTML.removeEventListener('mousedown', this._click);
    this.container?.HTML.removeEventListener('touchstart', this._click);
    document.removeEventListener('mousemove', this._move);
    document.removeEventListener('touchmove', this._move);
    if (!this.drawableElement || !this.container) return;

    if (this.drawableElement.isComplete()) {
      this.drawableElement.removePoint(-1);
      this.container.drawTool.drawingEnd();

      this.drawableElement.refPoint = this.drawableElement.center;

      this.container.focus(this.drawableElement);
      this.container.focused.fixRect();
    } else {
      this.container.remove(this.drawableElement);
    }
    this.drawableElement = null;
  }
}
