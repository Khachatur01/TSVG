import {ElementCursor, ElementProperties, ElementView} from "../../../ElementView";
import {Point} from "../../../../model/Point";
import {PointedView} from "../PointedView";
import {Container} from "../../../../Container";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {Rect} from "../../../../model/Rect";

export class PolylineCursor extends ElementCursor {}

export class PolylineView extends PointedView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "polyline");
  protected override _type: ElementType = ElementType.POLYLINE;

  public constructor(container: Container, properties: ElementProperties = {}, points: Point[] = [], ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.points = points;

    this.setProperties(properties);
  }

  public override __updateView__() {
    let string = "";
    this._points.forEach((point: Point) => {
      string += point.x + " " + point.y + " ";
    });
    string.trimEnd();
    this.setAttr({points: string});
  }

  public get copy(): PolylineView {
    let polyline: PolylineView = new PolylineView(this._container, this._properties);
    polyline.points = this._points.map(point => Object.assign({}, point)); /* copy points array */
    polyline.__fixRect__();

    polyline.refPoint = Object.assign({}, this.refPoint);
    polyline.__rotate__(this._angle);

    polyline.style.set = this.style;

    return polyline;
  }

  public override intersectsRect(rect: Rect): boolean {
    let points = this.visiblePoints;
    return ElementView.pointsIntersectingRect(points, rect, false);
  }

  public override isComplete(): boolean {
    return this._points.length >= 3;
  }
}
