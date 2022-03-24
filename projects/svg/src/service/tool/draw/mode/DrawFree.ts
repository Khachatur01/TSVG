import {Drawable} from "../Drawable";
import {FreeView} from "../../../../element/shape/pointed/polyline/FreeView";
import {TSVG} from "../../../../TSVG";
import {Point} from "../../../../model/Point";
import {Angle} from "../../../math/Angle";
import {Path} from "../../../../model/path/Path";
import {MoveTo} from "../../../../model/path/point/MoveTo";
import {Callback} from "../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {ElementView} from "../../../../element/ElementView";
import {DrawTool} from "../DrawTool";

export class DrawFree implements Drawable {
  private readonly container: TSVG;
  private _drawableElement: FreeView | null = null;
  public drawTool: DrawTool | null = null;

  private _drawStart = this.drawStart.bind(this);
  private _draw = this.draw.bind(this);
  private _drawEnd = this.drawEnd.bind(this);

  public constructor(container: TSVG) {
    this.container = container;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    position = this.container.grid.getSnapPoint(position);

    let pathObject = new Path();
    pathObject.add(new MoveTo(position));
    this._drawableElement = new FreeView(this.container, pathObject);

    this.container.add(this._drawableElement);

    if (call) {
      this.container.call(Callback.DRAW_MOUSE_DOWN, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true, additional?: any) {
    if (!this._drawableElement) return;

    if (additional) {
      this._drawableElement.setAttr({
        d: additional.path
      });
    } else {
      if (this.container.grid.isSnap()) {
        position = this.container.grid.getSnapPoint(position);
        this._drawableElement.pushPoint(position);
      } else if (this.drawTool?.perfect) {
        try {
          let lastPoint: Point = this._drawableElement.getPoint(-2);
          position = Angle.snapLineEnd(lastPoint, position) as Point;
          this._drawableElement.replacePoint(-1, position);
        } catch (typeError) {
          /* lastPoint may be undefined */
        }
      } else {
        this._drawableElement.pushPoint(position);
      }
    }

    if (call) {
      this.container.call(Callback.DRAW_MOUSE_MOVE, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true, additional?: any) {
    if (!this._drawableElement) return;
    if (additional) {
      this._drawableElement.path.fromString(additional.path);
      this._drawableElement.setAttr({
        d: additional.path
      });
    }
    if (this._drawableElement.getAttr("points").split(" ").length == 2) {
      this.container.remove(this._drawableElement);
    } else {
      this._drawableElement.refPoint = this._drawableElement.center;
    }

    if (call) {
      this.container.call(Callback.DRAW_MOUSE_UP, {position: position, element: this._drawableElement});
    }
  }

  public _new(): DrawFree {
    return new DrawFree(this.container);
  }
  public get type(): ElementType {
    return ElementType.FREE;
  }
  public get drawableElement(): ElementView | null {
    return this._drawableElement;
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

  public start(call: boolean = true): void {
    this.container.HTML.addEventListener('mousedown', this._drawStart);
    this.container.HTML.addEventListener('touchstart', this._drawStart);

    if (call) {
      this.container.call(Callback.FREE_HAND_TOOL_ON);
    }
  }
  public stop(call: boolean = true): void {
    this.container.HTML.removeEventListener('mousedown', this._drawStart);
    this.container.HTML.removeEventListener('touchstart', this._drawStart);

    if (call) {
      this.container.call(Callback.FREE_HAND_TOOL_OFF);
    }
  }
}
