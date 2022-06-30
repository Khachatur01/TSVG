import {Point} from "../../../model/Point";
import {Rect} from "../../../model/Rect";
import {PathView} from "../PathView";
import {Path} from "../../../model/path/Path";
import {MoveTo} from "../../../model/path/point/MoveTo";
import {LineTo} from "../../../model/path/line/LineTo";
import {ShapeView} from "../../type/ShapeView";
import {ElementView} from "../../ElementView";

export abstract class PointedView extends ShapeView {
  /* Model */
  protected _points: Point[] = [];
  protected _lastPoints: Point[] = [];
  /* Model */

  public override get points(): Point[] {
    return this._points;
  };
  public override set points(points: Point[]) {
    this._points = points;

    this._rect = ElementView.calculateRect(points);

    this.__updateView__();
  };
  public getPoint(index: number): Point {
    if (index < 0)
      index = this._points.length + index;
    return this._points[index];
  };
  public pushPoint(point: Point): void {
    this._points.push(point);
    this._rect = this.calculateRectByNewPoint(point);
    this.__updateView__();
  };
  public removePoint(index: number): void {
    if (index < 0)
      index = this._points.length + index;
    this._points.splice(index, 1);

    this._rect = ElementView.calculateRect(this._points);

    this.__updateView__();
  };
  public replacePoint(index: number, point: Point): void {
    if (index < 0)
      index = this._points.length + index;

    this._points[index] = point;
    this._rect = ElementView.calculateRect(this._points);
    this.__updateView__();
  };
  public override __fixRect__() {
    super.__fixRect__();
    this._lastPoints = [];
    this._points.forEach((point: Point) => {
      this._lastPoints.push(Object.assign({}, point));
    });
  }

  public override __drag__(delta: Point) {
    for (let i = 0; i < this._points.length; i++) {
      if (!this._lastPoints[i])
        this._lastPoints[i] = {x: this._points[i].x, y: this._points[i].y};

      this._points[i].x = (delta.x + this._lastPoints[i].x);
      this._points[i].y = (delta.y + this._lastPoints[i].y);
    }

    this._rect = ElementView.calculateRect(this._points);

    this.__updateView__();
  }
  public override __correct__(refPoint: Point, lastRefPoint: Point) {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;

    for (let i = 0; i < this._points.length; i++) {
      this._lastPoints[i] = {x: this._points[i].x, y: this._points[i].y};

      this._points[i].x = (delta.x + this._lastPoints[i].x);
      this._points[i].y = (delta.y + this._lastPoints[i].y);
    }
    this._rect = ElementView.calculateRect(this._points);
    this.__updateView__();
  }
  public override __setRect__(rect: Rect, delta?: Point): void {
    let dw = 1;
    let dh = 1;

    if (delta) {
      dw = delta.x;
      dh = delta.y;
    } else {
      if (this._lastRect.width != 0)
        dw = rect.width / (/*this._lastRect.x - rect.x + */this._lastRect.width);
      if (this._lastRect.height != 0)
        dh = rect.height / (/*this._lastRect.y - rect.y + */this._lastRect.height);
    }

    for (let i = 0; i < this._points.length; i++) {
      /* points may not be fixed, and this._lastPoints[i] may be undefined */
      if (!this._lastPoints[i]) this._lastPoints[i] = {x: 0, y: 0};

      this._points[i].x = rect.x + Math.abs(this._lastPoints[i].x - rect.x) * dw;
      this._points[i].y = rect.y + Math.abs(this._lastPoints[i].y - rect.y) * dh;
    }

    this._rect = ElementView.calculateRect(this._points);

    this.__updateView__();
  }

  public override toPath(): PathView {
    let visiblePoints = this.visiblePoints;
    let path = new Path();

    path.add(new MoveTo(visiblePoints[0]));
    for (let i = 1; i < visiblePoints.length; i++)
      path.add(new LineTo(visiblePoints[i]));

    return new PathView(this._container, this._properties, path);
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["points"] = this._points;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.points = json.points;
  };
}
