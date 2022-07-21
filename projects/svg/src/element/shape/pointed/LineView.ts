import {ElementCursor, ElementProperties, ElementView} from "../../ElementView";
import {PointedView} from "./PointedView";
import {Point} from "../../../model/Point";
import {Container} from "../../../Container";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {Rect} from "../../../model/Rect";

export class LineCursor extends ElementCursor {}

export class LineView extends PointedView implements MoveDrawable {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "line");
  protected override _type: ElementType = ElementType.LINE;

  public constructor(container: Container, properties: ElementProperties = {}, startPoint: Point = {x: 0, y: 0}, endPoint: Point = {x: 0, y: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.points = [startPoint, endPoint];

    this.setProperties(properties);
  }

  public __updateView__(): void {
    this.setAttr({
      x1: this._points[0].x,
      y1: this._points[0].y,
      x2: this._points[1].x,
      y2: this._points[1].y
    });
  }

  public __drawSize__(rect: Rect) {
    this.__setRect__(rect);
  }

  public override pushPoint(point: Point): void {}
  public override removePoint(index: number): void {}

  public override isComplete(): boolean {
    return this._points[0].x !== this._points[1].x ||
      this._points[0].y !== this._points[1].y;
  }
}
