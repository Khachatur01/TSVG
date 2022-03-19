import {ElementView} from "../../../ElementView";
import {Point} from "../../../../model/Point";
import {PointedView} from "../PointedView";
import {TSVG} from "../../../../TSVG";
import {PathView} from "../polyline/PathView";
import {Close} from "../../../../model/path/close/Close";
import {ElementType} from "../../../../dataSource/constant/ElementType";

export class PolygonView extends PointedView {
  public constructor(container: TSVG, points: Point[] = [], ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement = document.createElementNS(ElementView.svgURI, "polygon");
    this.type = ElementType.POLYGON;
    this.svgElement.id = this.id;

    this.points = points;

    this.setOverEvent();
    this.style.setDefaultStyle();
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

  /* TODO fix coordinate fetching */
  public override get points(): Point[] {
    let points: string[] = this.getAttr("points").split(" ");
    let pointsArray: Point[] = [];
    for (let point of points) {
      let pointSplit = point.split(",");
      pointsArray.push({
        x: parseInt(pointSplit[0]),
        y: parseInt(pointSplit[1])
      });
    }
    return pointsArray;
  }
  public override set points(points: Point[]) {
    let pointsString = "";
    for (let point of points) {
      pointsString += point.x + "," + point.y + " "
    }
    pointsString = pointsString.trimEnd();
    this.setAttr({points: pointsString})
  }

  public override getPoint(index: number): Point {
    let points = this.points;
    if (index < 0)
      index = points.length + index;
    return points[index];
  }
  public override pushPoint(point: Point) {
    this.setAttr({
      "points": this.getAttr("points") + " " + point.x + "," + point.y
    });
  }
  public override replacePoint(index: number, point: Point) {
    let points = this.points;
    if (index < 0)
      index = points.length + index;
    points[index] = point;

    this.points = points;
  }
  public override removePoint(index: number): void {
    let pointsArr = this.getAttr("points").split(" ");
    if (index < 0)
      index = pointsArr.length + index;
    pointsArr.splice(index, 1)

    this.setAttr({
      "points": pointsArr.join(" ")
    });
  }

  public override isComplete(): boolean {
    let pointsArr = this.getAttr("points").split(" ", 3);
    return pointsArr.length >= 3;
  }

  public override toPath(): PathView {
    let path = super.toPath();
    path.addCommand(new Close());
    return path;
  }
}
