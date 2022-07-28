import {ShapeView} from "../../type/ShapeView";
import {Point} from "../../../model/Point";
import {Rect} from "../../../model/Rect";
import {PathView} from "../PathView";
import {Path} from "../../../model/path/Path";
import {MoveTo} from "../../../model/path/point/MoveTo";
import {Arc} from "../../../model/path/curve/arc/Arc";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";

export abstract class CircularView extends ShapeView implements MoveDrawable {
  protected abstract override svgElement: SVGGeometryElement;

  public __updateView__(): void {
    this.setAttr({
      cx: this._rect.x + this._rect.width / 2,
      cy: this._rect.y + this._rect.height / 2,
      rx: this._rect.width / 2,
      ry: this._rect.height / 2
    });
  }

  public override get points(): Point[] {
    return [
      {x: this._rect.x, y: this._rect.y + this._rect.height / 2},
      {x: this._rect.x + this._rect.width / 2, y: this._rect.y},
      {x: this._rect.x + this._rect.width, y: this._rect.y + this._rect.height / 2},
      {x: this._rect.x + this._rect.width / 2, y: this._rect.y + this._rect.height}
    ];
  }

  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__updateView__();
  }
  public override __correct__(refPoint: Point, lastRefPoint: Point) {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;

    this.__fixRect__();
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;

    this.__updateView__();
  }
  public __drawSize__(rect: Rect) {
    this.__setRect__(rect);
  }
  public __setRect__(rect: Rect, delta: Point | null = null): void {
    if (delta) {
      rect.width = this._lastRect.width * delta.x;
      rect.height = this._lastRect.height * delta.y;
    }
    /* calculate positive position and size if size is negative */
    if (rect.width < 0) {
      rect.x += rect.width;
      rect.width = -rect.width;
    }
    if (rect.height < 0) {
      rect.y += rect.height;
      rect.height = -rect.height;
    }
    this._rect = rect;

    this.__updateView__();
  }

  public override getVisibleRect(): Rect {
    let containerRect: Rect = this._container.HTML.getBoundingClientRect();
    let stoke = parseInt(this.style.strokeWidth);

    /* Google Chrome returns wrong bounding box for rotated elements */
    /* For that, convert ellipse to not rotated path */
    let pathEllipse: PathView = this.toPath();
    /* Ellipse's path will be transparent */
    pathEllipse.style.strokeColor = "transparent";
    pathEllipse.style.fillColor = "none";
    /* set it to screen */
    this._container.add(pathEllipse, false);
    /* get the bounding box */
    let rotatedBoundingRect: Rect = pathEllipse.SVG.getBoundingClientRect();
    /* and delete it from screen */
    this._container.remove(pathEllipse, true, false);

    rotatedBoundingRect.x -= containerRect.x;
    rotatedBoundingRect.y -= containerRect.y;
    rotatedBoundingRect.width -= stoke / 2;
    rotatedBoundingRect.height -= stoke / 2;

    return rotatedBoundingRect;
  }

  public isComplete(): boolean {
    return this._rect.width > 0 && this._rect.height > 0;
  }

  public override toPath(): PathView {
    let path: Path = new Path();
    let rx = this._lastRect.width / 2;
    let ry = this._lastRect.height / 2;
    let points = this.visiblePoints;

    path.add(new MoveTo(points[0]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[1]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[2]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[3]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[0]));

    return new PathView(this._container, this._properties, path);
  }
}
