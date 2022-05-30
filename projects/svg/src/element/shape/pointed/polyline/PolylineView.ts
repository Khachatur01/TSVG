import {ElementCursor, ElementView} from "../../../ElementView";
import {Point} from "../../../../model/Point";
import {PointedView} from "../PointedView";
import {Container} from "../../../../Container";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {Rect} from "../../../../model/Rect";

export class PolylineCursor extends ElementCursor {}

export class PolylineView extends PointedView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "polyline");
  protected override _type: ElementType = ElementType.POLYLINE;

  public constructor(container: Container, points: Point[] = [], ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.points = points;
    this.style.setDefaultStyle();

    this.setOverEvent();
  }

  protected override __updateView__() {
    let string = "";
    this._points.forEach((point: Point) => {
      string += point.x + " " + point.y + " ";
    });
    string.trimEnd();
    this.setAttr({points: string});
  }

  public get copy(): PolylineView {
    let polyline: PolylineView = new PolylineView(this._container);
    polyline.points = this._points.map(point => Object.assign({}, point)); /* copy points array */;
    polyline.__fixRect__();

    polyline.refPoint = Object.assign({}, this.refPoint);
    polyline.__rotate__(this._angle);

    polyline.style.set = this.style;

    return polyline;
  }

  public override intersectsRect(rect: Rect): boolean {
    let points = this.points;
    let rectSides = ElementView.getRectSides(rect);
    for (let i = 0; i < points.length; i++) {
      if (ElementView.pointInRect(points[i], rect)) {
        /* if some point in rect, then element is intersected with rect */
        return true;
      }
      if (i + 1 == points.length) { /* 'i' is last point index */
        /* if last point is not in rect, then element is not intersected with rect */
        break; /* ends loop to return false */
      }
      for (let side of rectSides) {
        let line = {p0: points[i], p1: points[i + 1]};
        if (ElementView.linesIntersect(line, side)) {
          return true;
        }
      }
    }

    return false;
  }

  public override isComplete(): boolean {
    return this._points.length >= 3;
  }
}
