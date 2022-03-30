import {Size} from "../../model/Size";
import {Point} from "../../model/Point";
import {Rect} from "../../model/Rect";
import {ElementCursor, ElementView} from "../ElementView";
import {TSVG} from "../../TSVG";
import {MoveDrawable} from "../../service/tool/draw/type/MoveDrawable";
import {PathView} from "./pointed/PathView";
import {Path} from "../../model/path/Path";
import {Arc} from "../../model/path/curve/arc/Arc";
import {MoveTo} from "../../model/path/point/MoveTo";
import {ShapeView} from "../type/ShapeView";
import {ElementType} from "../../dataSource/constant/ElementType";

export class EllipseCursor extends ElementCursor {}

export class EllipseView extends ShapeView implements MoveDrawable {
  public constructor(container: TSVG, position: Point = {x: 0, y: 0}, rx: number = 0, ry: number = 0, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement = document.createElementNS(ElementView.svgURI, "ellipse");
    this._type = ElementType.ELLIPSE;
    this.svgElement.id = this.id;

    this.position = position;
    this.setSize({x: position.x, y: position.y, width: rx * 2, height: ry * 2});

    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  public get copy(): EllipseView {
    let position = this.position;
    let size = this.size;
    let ellipse: EllipseView = new EllipseView(this._container, position, size.width / 2, size.height / 2);
    ellipse.refPoint = Object.assign({}, this.refPoint);
    ellipse.rotate(this._angle);

    ellipse.style.set = this.style;

    return ellipse;
  }

  public get points(): Point[] {
    let position: Point = this.position;
    let size: Size = this.size;
    return [
      {x: position.x, y: position.y + size.height / 2},
      {x: position.x + size.width / 2, y: position.y},
      {x: position.x + size.width, y: position.y + size.height / 2},
      {x: position.x + size.width / 2, y: position.y + size.height}
    ];
  }

  public get position(): Point {
    let centerPos: Point = {
      x: parseInt(this.getAttr("cx")),
      y: parseInt(this.getAttr("cy"))
    }
    let radius: Size = {
      width: parseInt(this.getAttr("rx")),
      height: parseInt(this.getAttr("ry"))
    }

    return {
      x: centerPos.x - radius.width,
      y: centerPos.y - radius.height
    };
  }
  public set position(delta: Point) {
    this.setAttr({
      cx: this._lastPosition.x + this._lastSize.width / 2 + delta.x,
      cy: this._lastPosition.y + this._lastSize.height / 2 + delta.y
    });
  }
  public override correct(refPoint: Point, lastRefPoint: Point) {
    let delta = this.getCorrectionDelta(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;

    let position = this.position;
    let size = this.size;

    this.setAttr({
      cx: position.x + size.width / 2 + delta.x,
      cy: position.y + size.height / 2 + delta.y
    });
  }

  public get size(): Size {
    return {
      width: parseInt(this.getAttr("rx")) * 2,
      height: parseInt(this.getAttr("ry")) * 2
    };
  }
  public drawSize(rect: Rect) {
    this.setSize(rect);
  }
  public setSize(rect: Rect, delta: Point | null = null): void {
    if (delta) {
      rect.width = this._lastSize.width * delta.x;
      rect.height = this._lastSize.height * delta.y;
    }

    let rx = rect.width / 2;
    let ry = rect.height / 2;

    /* calculate positive position and size if size is negative */
    if (rect.width < 0) {
      rx = -rx;
      rect.x += rect.width;
    }
    if (rect.height < 0) {
      ry = -ry;
      rect.y += rect.height;
    }

    rect.x += rx;
    rect.y += ry;
    this.setAttr({
      cx: rect.x,
      cy: rect.y,
      rx: rx,
      ry: ry
    });

  }

  public get boundingRect(): Rect {
    let points = this.points;
    return this.calculateBoundingBox(points);
  }
  public get visibleBoundingRect(): Rect {
    let containerRect: Rect = this._container.HTML.getBoundingClientRect();
    let stoke = parseInt(this.style.strokeWidth);
    let rotatedBoundingRect: Rect = this.svgElement.getBoundingClientRect();

    rotatedBoundingRect.x += stoke / 2 - containerRect.x;
    rotatedBoundingRect.y += stoke / 2 - containerRect.y;
    rotatedBoundingRect.width -= stoke;
    rotatedBoundingRect.height -= stoke

    return rotatedBoundingRect;
  }

  public isComplete(): boolean {
    let size: Size = this.size;
    return size.width > 0 && size.height > 0;
  }

  public override toPath(): PathView {
    let path: Path = new Path();
    let size = this.size;
    let rx = size.width / 2;
    let ry = size.height / 2;
    let points = this.visiblePoints;

    path.add(new MoveTo(points[0]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[1]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[2]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[3]));
    path.add(new Arc(rx, ry, this._angle, 0, 1, points[0]));

    this.setAttr({
      d: path.toString()
    })

    return new PathView(this._container, path);
  }
}
