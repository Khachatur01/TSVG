import {Drawable} from "../Drawable";
import {FreeView} from "../../../../element/shape/pointed/polyline/FreeView";
import {TSVG} from "../../../../TSVG";
import {Point} from "../../../../model/Point";
import {Angle} from "../../../math/Angle";
import {Path} from "../../../../model/path/Path";
import {MoveTo} from "../../../../model/path/point/MoveTo";
import {Callback} from "../../../../dataSource/Callback";

export class DrawFree implements Drawable {
  private container: TSVG;
  private drawableElement: FreeView | null = null;

  private _drawStart = this.drawStart.bind(this);
  private _draw = this.draw.bind(this);
  private _drawEnd = this.drawEnd.bind(this);

  public constructor(container: TSVG) {
    this.container = container;
  }

  public makeMouseDown(position: Point) {
    position = this.container.grid.getSnapPoint(position);

    let pathObject = new Path();
    pathObject.add(new MoveTo(position));
    this.drawableElement = new FreeView(this.container, pathObject);

    this.container.add(this.drawableElement);
    this.container.call(Callback.DRAW_CLICK, {position: position});
  }
  public makeMouseMove(position: Point) {
    if (!this.drawableElement) return;

    if (this.container.grid.isSnap()) {
      position = this.container.grid.getSnapPoint(position);
      this.drawableElement.pushPoint(position);
    } else if (this.container.perfect) {
      try {
        let lastPoint: Point = this.drawableElement.getPoint(-2);
        position = Angle.snapLineEnd(lastPoint, position) as Point;
        this.drawableElement.replacePoint(-1, position);
      } catch (typeError) {
        /* lastPoint may be undefined */
      }
    } else {
      this.drawableElement.pushPoint(position);
    }
    this.container.call(Callback.DRAW_MOVE, {position: position});
  }
  public makeMouseUp(position: Point) {
    if (!this.drawableElement) return;
    if (this.drawableElement.getAttr("points").split(" ").length == 2) {
      this.container.remove(this.drawableElement);
    } else {
      this.drawableElement.refPoint = this.drawableElement.center;
    }
    this.container.call(Callback.DRAW_END);
  }

  public _new(): DrawFree {
    return new DrawFree(this.container);
  }

  private drawStart(event: MouseEvent | TouchEvent) {
    this.container.HTML.addEventListener('mousemove', this._draw);
    this.container.HTML.addEventListener('touchmove', this._draw);
    document.addEventListener('mouseup', this._drawEnd);
    document.addEventListener('touchend', this._drawEnd);

    let containerRect = this.container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    this.makeMouseDown({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }
  private draw(event: MouseEvent | TouchEvent): void {
    let containerRect = this.container.HTML.getBoundingClientRect();

    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    this.makeMouseMove({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }
  private drawEnd() {
    this.container.HTML.removeEventListener('mousemove', this._draw);
    this.container.HTML.removeEventListener('touchmove', this._draw);
    document.removeEventListener('mouseup', this._drawEnd);
    document.removeEventListener('touchend', this._drawEnd);

    this.makeMouseUp({x: 0, y: 0});
  }

  public start(container: TSVG): void {
    this.container = container;
    if (container.mouseEventSwitches.draw) {
      this.container.HTML.addEventListener('mousedown', this._drawStart);
      this.container.HTML.addEventListener('touchstart', this._drawStart);
    }
    container.call(Callback.FREE_HAND_TOOL_ON);
  }
  public stop(): void {
    this.container.HTML.removeEventListener('mousedown', this._drawStart);
    this.container.HTML.removeEventListener('touchstart', this._drawStart);
    this.container.call(Callback.FREE_HAND_TOOL_OFF);
  }
}
