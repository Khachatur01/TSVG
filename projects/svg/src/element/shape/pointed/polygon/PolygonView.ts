import {ElementCursor, ElementView} from "../../../ElementView";
import {Point} from "../../../../model/Point";
import {PointedView} from "../PointedView";
import {Container} from "../../../../Container";
import {PathView} from "../../PathView";
import {ElementType} from "../../../../dataSource/constant/ElementType";

export class PolygonCursor extends ElementCursor {}

export class PolygonView extends PointedView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "polygon");
  protected override _type: ElementType = ElementType.POLYGON;

  public constructor(container: Container, points: Point[] = [], ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.points = points;

    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  protected override updateView() {
    let string = "";
    this._points.forEach((point: Point) => {
      string += point.x + "," + point.y + " ";
    });
    string.trimEnd();
    this.setAttr({points: string});
  }

  public get copy(): PolygonView {
    let polygon: PolygonView = new PolygonView(this._container);
    polygon.points = this.points;
    polygon.fixRect();

    polygon.refPoint = Object.assign({}, this.refPoint);
    polygon.rotate(this._angle);

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
