import {ShapeView} from '../../type/ShapeView';
import {Point} from '../../../model/Point';
import {Rect} from '../../../model/Rect';
import {PathView} from '../path/PathView';
import {Path} from '../../../model/path/Path';
import {MoveTo} from '../../../model/path/point/MoveTo';
import {Arc} from '../../../model/path/curve/arc/Arc';
import {MoveDrawable} from '../../../service/tool/draw/type/MoveDrawable';
import {ElementView} from '../../ElementView';

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
  public override __correct__(refPoint: Point, lastRefPoint: Point): void {
    const delta: Point = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x === 0 && delta.y === 0) {return;}

    this.__fixRect__();
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;

    this.__updateView__();
  }
  public __drawSize__(rect: Rect): void {
    this.__setRect__(rect);
  }
  public override __setRect__(rect: Rect): void {
    rect = ElementView.normalizeRect(rect);

    this._rect = rect;
    this.__updateView__();
  }

  public override getVisibleRect(): Rect {
    const containerRect: Rect = this._container.HTML.getBoundingClientRect();
    const stoke: number = parseInt(this.style.strokeWidth);

    /* Google Chrome returns wrong bounding box for rotated elements */
    /* For that, convert ellipse to not rotated path */
    const pathEllipse: PathView = this.toPath();
    /* Ellipse's path will be transparent */
    pathEllipse.style.strokeColor = 'transparent';
    pathEllipse.style.fillColor = 'none';
    /* set it to screen */
    this._container.add(pathEllipse);
    /* get the bounding box */
    const rotatedBoundingRect: Rect = pathEllipse.SVG.getBoundingClientRect();
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
    const path: Path = new Path();
    const rx: number = this._lastRect.width / 2;
    const ry: number = this._lastRect.height / 2;
    const points: Point[] = this.visiblePoints;

    path.add(new MoveTo(points[0]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[1]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[2]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[3]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[0]));

    return new PathView(this._container, this._properties, path);
  }
}
