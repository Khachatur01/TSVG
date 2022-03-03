import {ElementView} from "../../../ElementView";
import {Point} from "../../../../model/Point";
import {PointedView} from "../PointedView";
import {TSVG} from "../../../../TSVG";

export class PolylineView extends PointedView {
  public constructor(container: TSVG, points: Point[] = []) {
    super(container);
    this.svgElement = document.createElementNS(ElementView.svgURI, "polyline");
    this.svgElement.id = this.id;

    this.points = points;
    this.style.setDefaultStyle();

    this.setOverEvent();
  }

  public get copy(): PolylineView {
    let polyline: PolylineView = new PolylineView(this._container);
    polyline.points = this.points;
    polyline.fixRect();

    polyline.refPoint = Object.assign({}, this.refPoint);
    polyline.rotate(this._angle);

    polyline.style.set = this.style;

    return polyline;
  }

  // TODO fix coordinate fetching
  public override get points(): Point[] {
    let points: string[] = this.getAttr("points").split(" ");
    let pointsArray: Point[] = [];

    for (let i = 0; i < points.length; i += 2) {
      pointsArray.push({
        x: parseInt(points[i]),
        y: parseInt(points[i + 1])
      });
    }

    return pointsArray;
  }
  public override set points(points: Point[]) {
    let pointsString: string = "";
    for (let point of points) {
      pointsString += point.x + " " + point.y + " "
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
      "points": this.getAttr("points") + " " + point.x + " " + point.y
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
      index = pointsArr.length / 2 + index;

    pointsArr.splice(index * 2, 2)

    this.setAttr({
      "points": pointsArr.join(" ")
    });
  }

  public override isComplete(): boolean {
    let pointsArr = this.getAttr("points").split(" ", 6);
    return pointsArr.length >= 6;
  }
}
