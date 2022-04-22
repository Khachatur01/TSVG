import {ElementCursor, ElementView} from "../../../ElementView";
import {Point} from "../../../../model/Point";
import {PointedView} from "../PointedView";
import {Container} from "../../../../Container";
import {ElementType} from "../../../../dataSource/constant/ElementType";

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
    polyline.points = this.points;
    polyline.__fixRect__();

    polyline.__refPoint__ = Object.assign({}, this.__refPoint__);
    polyline.__rotate__(this._angle);

    polyline.style.set = this.style;

    return polyline;
  }

  public override isComplete(): boolean {
    return this._points.length >= 3;
  }

}
