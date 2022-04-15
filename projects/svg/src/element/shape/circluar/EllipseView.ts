import {Point} from "../../../model/Point";
import {Rect} from "../../../model/Rect";
import {ElementCursor, ElementView} from "../../ElementView";
import {Container} from "../../../Container";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {PathView} from "../PathView";
import {Path} from "../../../model/path/Path";
import {Arc} from "../../../model/path/curve/arc/Arc";
import {MoveTo} from "../../../model/path/point/MoveTo";
import {ShapeView} from "../../type/ShapeView";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {CircularView} from "./CircularView";

export class EllipseCursor extends ElementCursor {}

export class EllipseView extends CircularView {
  protected override svgElement: SVGEllipseElement = document.createElementNS(ElementView.svgURI, "ellipse");
  protected override _type: ElementType = ElementType.ELLIPSE;

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.setRect(rect);

    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  // protected updateView(): void {
  //   this.setAttr({
  //     cx: this._rect.x + this._rect.width / 2,
  //     cy: this._rect.y + this._rect.height / 2,
  //     rx: this._rect.width / 2,
  //     ry: this._rect.height / 2
  //   });
  // }

  public get copy(): EllipseView {
    let ellipse: EllipseView = new EllipseView(this._container, this._rect);
    ellipse.refPoint = Object.assign({}, this.refPoint);
    ellipse.rotate(this._angle);

    ellipse.style.set = this.style;

    return ellipse;
  }

  // public override get points(): Point[] {
  //   return [
  //     {x: this._rect.x, y: this._rect.y + this._rect.height / 2},
  //     {x: this._rect.x + this._rect.width / 2, y: this._rect.y},
  //     {x: this._rect.x + this._rect.width, y: this._rect.y + this._rect.height / 2},
  //     {x: this._rect.x + this._rect.width / 2, y: this._rect.y + this._rect.height}
  //   ];
  // }

  // drag(delta: Point): void {
  //   this._rect.x = this._lastRect.x + delta.x;
  //   this._rect.y = this._lastRect.y + delta.y;
  //   this.updateView();
  // }
  // public override correct(refPoint: Point, lastRefPoint: Point) {
  //   let delta = this.getCorrectionDelta(refPoint, lastRefPoint);
  //   if (delta.x == 0 && delta.y == 0) return;
  //
  //   this._rect.x = this._lastRect.x + delta.x;
  //   this._rect.y = this._lastRect.y + delta.y;
  //
  //   this.updateView();
  // }
  // public drawSize(rect: Rect) {
  //   this.setRect(rect);
  // }
  // public setRect(rect: Rect, delta: Point | null = null): void {
  //   if (delta) {
  //     rect.width = this._lastRect.width * delta.x;
  //     rect.height = this._lastRect.height * delta.y;
  //   }
  //   /* calculate positive position and size if size is negative */
  //   if (rect.width < 0) {
  //     rect.x += rect.width;
  //     rect.width = -rect.width;
  //   }
  //   if (rect.height < 0) {
  //     rect.y += rect.height;
  //     rect.height = -rect.height;
  //   }
  //   this._rect = rect;
  //
  //   this.updateView();
  // }

  // public override getVisibleRect(): Rect {
  //   let containerRect: Rect = this._container.HTML.getBoundingClientRect();
  //   let stoke = parseInt(this.style.strokeWidth);
  //
  //   /* Google Chrome returns wrong bounding box for rotated elements */
  //   /* For that, convert ellipse to not rotated path */
  //   let pathEllipse: PathView = this.toPath();
  //   /* Ellipse's path will be transparent */
  //   pathEllipse.style.strokeColor = "transparent";
  //   pathEllipse.style.fillColor = "none";
  //   /* set it to screen */
  //   this._container.add(pathEllipse, false);
  //   /* get the bounding box */
  //   let rotatedBoundingRect: Rect = pathEllipse.SVG.getBoundingClientRect();
  //   /* and delete it from screen */
  //   this._container.remove(pathEllipse);
  //
  //   rotatedBoundingRect.x -= containerRect.x;
  //   rotatedBoundingRect.y -= containerRect.y;
  //   rotatedBoundingRect.width -= stoke / 2;
  //   rotatedBoundingRect.height -= stoke / 2;
  //
  //   return rotatedBoundingRect;
  // }

  // public isComplete(): boolean {
  //   return this._rect.width > 0 && this._rect.height > 0;
  // }

  // public override toPath(): PathView {
  //   let path: Path = new Path();
  //   let rx = this._lastRect.width / 2;
  //   let ry = this._lastRect.height / 2;
  //   let points = this.visiblePoints;
  //
  //   path.add(new MoveTo(points[0]));
  //   path.add(new Arc(rx, ry, this._angle, 0, 1, points[1]));
  //   path.add(new Arc(rx, ry, this._angle, 0, 1, points[2]));
  //   path.add(new Arc(rx, ry, this._angle, 0, 1, points[3]));
  //   path.add(new Arc(rx, ry, this._angle, 0, 1, points[0]));
  //
  //   return new PathView(this._container, path);
  // }
}
