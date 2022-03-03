import {ElementView} from "../../ElementView";
import {PointedView} from "./PointedView";
import {Point} from "../../../model/Point";
import {TSVG} from "../../../TSVG";

export class LineView extends PointedView {
  public constructor(container: TSVG, startPoint: Point = {x: 0, y: 0}, endPoint: Point = {x: 0, y: 0}) {
    super(container);
    this.svgElement = document.createElementNS(ElementView.svgURI, "line");
    this.svgElement.id = this.id;

    this.setAttr({
      x1: startPoint.x,
      y1: startPoint.y,
      x2: endPoint.x,
      y2: endPoint.y
    });
    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  public get copy(): LineView {
    let line: LineView = new LineView(this._container);
    line.points = this.points;

    line.refPoint = Object.assign({}, this.refPoint);
    line.rotate(this._angle);

    line.style.set = this.style;

    return line;
  }

  public override get points(): Point[] {
    return [
      {x: parseFloat(this.getAttr("x1")), y: parseFloat(this.getAttr("y1"))},
      {x: parseFloat(this.getAttr("x2")), y: parseFloat(this.getAttr("y2"))}
    ];
  }
  public override set points(points: Point[]) {
    this.setAttr({
      x1: points[0].x,
      y1: points[0].y,
      x2: points[1].x,
      y2: points[1].y
    });
  }

  public override getPoint(index: number): Point {
    return {
      x: parseFloat(this.getAttr("x2")),
      y: parseFloat(this.getAttr("y2"))
    };
  }
  public override pushPoint(point: Point): void {
  }
  public override replacePoint(index: number, point: Point) {
    if (index == 0) {
      this.setAttr({x1: point.x});
      this.setAttr({y1: point.y});
    }
    if (index == 1) {
      this.setAttr({x2: point.x});
      this.setAttr({y2: point.y});
    }
  }
  public override removePoint(index: number): void {
  }

  public override isComplete(): boolean {
    return this.getAttr("x1") != this.getAttr("x2") ||
      this.getAttr("y1") != this.getAttr("y2")
  }
}
