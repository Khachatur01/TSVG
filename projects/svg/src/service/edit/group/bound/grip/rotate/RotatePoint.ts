import {Point} from "../../../../../../model/Point";
import {Container} from "../../../../../../Container";
import {Angle} from "../../../../../math/Angle";
import {PathView} from "../../../../../../element/shape/PathView";
import {MoveTo} from "../../../../../../model/path/point/MoveTo";
import {Arc} from "../../../../../../model/path/curve/arc/Arc";
import {LineTo} from "../../../../../../model/path/line/LineTo";
import {ElementView} from "../../../../../../element/ElementView";
import {Callback} from "../../../../../../dataSource/constant/Callback";
import {Focus} from "../../../Focus";
import {Cursor} from "../../../../../../dataSource/constant/Cursor";
import {Path} from "../../../../../../model/path/Path";

export class RotatePoint extends PathView {
  private _start = this.start.bind(this);
  private _move = this.move.bind(this);
  private _end = this.end.bind(this);

  private readonly SNAP_ANGLE: number = 15;
  private _r: number = 8;
  private _lineLength: number = 15;
  private _position: Point = {x: 0, y: 0};
  private dAngle: number = 0; /* delta angle */
  private focus: Focus;

  public constructor(container: Container, focus: Focus, x: number = 0, y: number = 0) {
    super(container);
    this.removeOverEvent();
    this.style.fillColor = "transparent";
    this.style.strokeColor = "#002fff";
    this.style.strokeWidth = "1";

    this._position = {x: x, y: y};
    this.focus = focus;

    this.drawPoint(this._position);
    this.svgElement.style.display = "none";
    this.svgElement.style.cursor = this._container.style.cursor[Cursor.ROTATE_POINT];
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    this.dAngle = Angle.fromPoints(
      {x: 0, y: this.focus.refPoint.y},
      this.focus.refPoint,
      position
    ) - this.focus.angle;

    this.focus.children.forEach((child: ElementView) => {
      child.fixAngle();
    });
    this.focus.lastAngle = this.getAngle(position);

    if (call) {
      this._container.call(Callback.ROTATE_MOUSE_DOWN, {position: position, refPoint: this.focus.refPoint, elements: this.focus.children});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    let angle = this.getAngle(position);
    if (this._container.perfect)
      angle = Math.round(angle / this.SNAP_ANGLE) * this.SNAP_ANGLE;
    this.focus.rotate(angle);

    if (call) {
      this._container.call(Callback.ROTATE_MOUSE_MOVE, {angle: angle, position: position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.makeMouseMove(position, false);
    let angle = this.getAngle(position);
    if (this._container.perfect)
      angle = Math.round(angle / this.SNAP_ANGLE) * this.SNAP_ANGLE;

    if (call) {
      this._container.call(Callback.ROTATE_MOUSE_UP, {position: position});
      this._container.call(Callback.ELEMENTS_ROTATED, {newAngle: angle, oldAngle: this.focus.lastAngle, refPoint: this.focus.refPoint, elements: this.focus.children});
    }
  }

  public setPosition(position: Point): void {
    this.fixRect();
    super.drag({
      x: position.x - this._position.x,
      y: position.y - this._position.y
    });
    this._position = position;
  }

  private drawPoint(point: Point): void {
    let x = point.x;
    let y = point.y;
    let path = new Path();
    path.setAll([
      new MoveTo({x: x, y: y}),
      new LineTo({x: x, y: y - this._lineLength}),
      new Arc(this._r, this._r, 0, 0, 1, {x: x, y: y - this._lineLength - this._r * 2}),
      new Arc(this._r, this._r, 0, 0, 1, {x: x, y: y - this._lineLength}),
    ]);
    this.path = path;
  }

  public show() {
    this.svgElement.style.display = "block";
  }
  public hide() {
    this.svgElement.style.display = "none";
  }

  public getAngle(position: Point): number {
    let angle = Angle.fromPoints(
      {x: 0, y: this.focus.refPoint.y},
      this.focus.refPoint,
      position
    );

    angle -= this.dAngle;

    if (angle < 0)
      angle += 360;

    return angle;
  }

  private start(event: MouseEvent | TouchEvent) {
    this._container.activeTool.off();
    this._container.HTML.addEventListener("mousemove", this._move);
    this._container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);

    let eventPosition = Container.eventToPosition(event);
    event.preventDefault();
    let containerRect = this._container.HTML.getBoundingClientRect();
    let position = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseDown(position);
  }
  private move(event: MouseEvent | TouchEvent) {
    let eventPosition = Container.eventToPosition(event);
    event.preventDefault();
    let containerRect = this._container.HTML.getBoundingClientRect();
    let position = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseMove(position);
  }
  private end(event: MouseEvent | TouchEvent) {
    this._container.selectTool.on();
    this._container.HTML.removeEventListener("mousemove", this._move);
    this._container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);

    let eventPosition = Container.eventToPosition(event);
    event.preventDefault();
    let containerRect = this._container.HTML.getBoundingClientRect();
    let position = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseUp(position);
  }

  public on() {
    this.svgElement.addEventListener("mousedown", this._start);
    this.svgElement.addEventListener("touchstart", this._start);
  }
  public off() {
    this.svgElement.removeEventListener("mousedown", this._start);
    this.svgElement.removeEventListener("touchstart", this._start);
  }
}
