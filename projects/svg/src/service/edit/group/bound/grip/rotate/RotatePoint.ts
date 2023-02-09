/* eslint-disable @typescript-eslint/naming-convention */

import {PathView} from "../../../../../../element/shape/path/PathView";
import {Point} from "../../../../../../model/Point";
import {Tool} from "../../../../../tool/Tool";
import {Focus} from "../../../Focus";
import {Container} from "../../../../../../Container";
import {Cursor} from "../../../../../../dataSource/constant/Cursor";
import {SVGEvent} from "../../../../../../dataSource/constant/SVGEvent";
import {Path} from "../../../../../../model/path/Path";
import {MoveTo} from "../../../../../../model/path/point/MoveTo";
import {LineTo} from "../../../../../../model/path/line/LineTo";
import {Arc} from "../../../../../../model/path/curve/arc/Arc";
import {Angle} from "../../../../../math/Angle";

export class RotatePoint extends PathView {
  private mouseCurrentPos: Point = {x: 0, y: 0};
  private _lastActiveTool: Tool | null = null;

  private readonly SNAP_ANGLE: number = 15;
  private _r = 8;
  private _lineLength = 15;
  private _position: Point = {x: 0, y: 0};
  private dAngle = 0; /* delta angle */
  private focus: Focus;

  public constructor(container: Container, focus: Focus, x: number = 0, y: number = 0) {
    super(container, {});
    this.style.fillColor = 'transparent';
    this.style.strokeColor = '#002fff';
    this.style.strokeWidth = '1';

    this._position = {x, y};
    this.focus = focus;

    this.drawPoint(this._position);
    this.svgElement.style.display = 'none';
    this.svgElement.style.cursor = this._container.style.cursor[Cursor.ROTATE_POINT];

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent) {
    this._lastActiveTool = this._container.tools.activeTool;
    this._container.tools.activeTool?.off();

    this._container.HTML.addEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);

    const containerRect = this._container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this.mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseDown(this.mouseCurrentPos);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent) {
    const containerRect = this._container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this.mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseMove(this.mouseCurrentPos);
  };
  private mouseUpEvent() {
    this._lastActiveTool?.on();
    this._container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);

    this.makeMouseUp(this.mouseCurrentPos);
  };

  public makeMouseDown(position: Point, call: boolean = true) {
    this.dAngle = Angle.fromThreePoints(
      {x: 0, y: this.focus.__refPoint__.y},
      this.focus.__refPoint__,
      position
    ) - this.focus.angle;

    this.focus.__fixAngle__();

    if (call) {
      this._container.__call__(SVGEvent.ROTATE_MOUSE_DOWN, {position, refPoint: this.focus.__refPoint__, elements: this.focus.children});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    let angle = this.getAngle(position);
    if (this.focus.boundingBox.perfect) {
      angle = Math.round(angle / this.SNAP_ANGLE) * this.SNAP_ANGLE;
    }
    this.focus.__rotate__(angle);

    if (call) {
      this._container.__call__(SVGEvent.ROTATE_MOUSE_MOVE, {angle, position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.makeMouseMove(position, false);
    let angle = this.getAngle(position);
    if (this.focus.boundingBox.perfect) {
      angle = Math.round(angle / this.SNAP_ANGLE) * this.SNAP_ANGLE;
    }

    if (call) {
      this._container.__call__(SVGEvent.ROTATE_MOUSE_UP, {position});
      this._container.__call__(SVGEvent.ELEMENTS_ROTATED, {newAngle: angle, oldAngle: this.focus.__lastAngle__, refPoint: this.focus.__refPoint__, elements: this.focus.children});
    }
  }

  public __setPosition__(position: Point): void {
    this.__fixRect__();
    super.__drag__({
      x: position.x - this._position.x,
      y: position.y - this._position.y
    });
    this._position = position;
  }

  private drawPoint(point: Point): void {
    const x = point.x;
    const y = point.y;
    const path = new Path();
    path.setAll([
      new MoveTo({x, y}),
      new LineTo({x, y: y - this._lineLength}),
      new Arc(this._r, this._r, 0, 0, 1, {x, y: y - this._lineLength - this._r * 2}),
      new Arc(this._r, this._r, 0, 0, 1, {x, y: y - this._lineLength}),
    ]);
    this.path = path;
  }

  public __show__() {
    this.svgElement.style.display = 'block';
  }
  public __hide__() {
    this.svgElement.style.display = 'none';
  }

  private getAngle(position: Point): number {
    let angle = Angle.fromThreePoints(
      {x: 0, y: this.focus.__refPoint__.y},
      this.focus.__refPoint__,
      position
    );

    angle -= this.dAngle;

    if (angle < 0) {
      angle += 360;
    }

    return angle;
  }

  public __on__() {
    this.svgElement.addEventListener('mousedown', this.mouseDownEvent);
    this.svgElement.addEventListener('touchstart', this.mouseDownEvent);
  }
  public __off__() {
    this.svgElement.removeEventListener('mousedown', this.mouseDownEvent);
    this.svgElement.removeEventListener('touchstart', this.mouseDownEvent);
  }
}
