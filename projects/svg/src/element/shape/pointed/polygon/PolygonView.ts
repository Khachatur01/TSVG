import {ElementCursor, ElementProperties, ElementView} from "../../../ElementView";
import {Point} from "../../../../model/Point";
import {PointedView} from "../PointedView";
import {Container} from "../../../../Container";
import {PathView} from "../../PathView";
import {ElementType} from "../../../../dataSource/constant/ElementType";

export class PolygonCursor extends ElementCursor {}

export class PolygonView extends PointedView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "polygon");
  protected override _type: ElementType = ElementType.POLYGON;

  public constructor(container: Container, properties: ElementProperties = {}, points: Point[] = [], ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.points = points;

    this.setProperties(properties);
  }

  public override __updateView__() {
    let string = "";

    this._points.forEach((point: Point) => {
      string += point.x + "," + point.y + " ";
    });
    string.trimEnd();
    this.setAttr({points: string});
  }

  public get copy(): PolygonView {
    let polygon: PolygonView = new PolygonView(this._container, this._properties);
    polygon.points = this._points.map(point => Object.assign({}, point)); /* copy points array */
    polygon.__fixRect__();

    polygon.refPoint = Object.assign({}, this.refPoint);
    polygon.__rotate__(this._angle);

    polygon.style.set = this.style;

    return polygon;
  }

  public override isComplete(): boolean {
    return this._points.length >= 3;
  }

  public override toPath(): PathView {
    let path = super.toPath();
    path.commands[path.commands.length - 1].close = true;
    return path;
  }
}
