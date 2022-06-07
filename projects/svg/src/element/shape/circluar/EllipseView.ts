import {Rect} from "../../../model/Rect";
import {ElementCursor, ElementView} from "../../ElementView";
import {Container} from "../../../Container";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {CircularView} from "./CircularView";
import {Point} from "../../../model/Point";
import {Matrix} from "../../../service/math/Matrix";
import {Ellipse} from "../../../model/Ellipse";
import {ElementProperties} from "../../../model/ElementProperties";

export class EllipseCursor extends ElementCursor {
  constructor() {
    super();
  }
}

export class EllipseView extends CircularView {
  protected override svgElement: SVGEllipseElement = document.createElementNS(ElementView.svgURI, "ellipse");
  protected override _type: ElementType = ElementType.ELLIPSE;

  public constructor(container: Container, properties: ElementProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, {}, ownerId, index);
    this.svgElement.id = this.id;

    this.__setRect__(rect);

    this.setProperties(properties);
  }

  public get copy(): EllipseView {
    let ellipse: EllipseView = new EllipseView(this._container, this._properties, Object.assign({}, this._rect));
    ellipse.refPoint = Object.assign({}, this.refPoint);
    ellipse.__rotate__(this._angle);

    ellipse.style.set = this.style;

    return ellipse;
  }

  private getEllipseModel(): Ellipse {
    return {
      cx: this._rect.x + this._rect.width / 2,
      cy: this._rect.y + this._rect.height / 2,
      rx: this._rect.width / 2,
      ry: this._rect.height / 2,
    }
  }

  public getEllipticPoints(ellipse: Ellipse, count = 48): Point[] {
    const stepAngle = 2 * Math.PI / count;

    let points: Point[] = [];
    for (let ang = 0; ang < 2 * Math.PI; ang += stepAngle) {
      const x = ellipse.cx + ellipse.rx * Math.cos(ang);
      const y = ellipse.cy + ellipse.ry * Math.sin(ang);
      points.push({x, y});
    }
    return points;
  }

  public override intersectsRect(rect: Rect): boolean {
    let points = Matrix.rotate(
      this.getEllipticPoints(this.getEllipseModel()),
      this._refPoint,
      -this._angle
    );

    return ElementView.pointsIntersectingRect(points, rect);
  }
}
