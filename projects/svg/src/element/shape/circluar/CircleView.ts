import {Rect} from '../../../model/Rect';
import {ElementCursor, ElementProperties, ElementView} from '../../ElementView';
import {Container} from '../../../Container';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {CircularView} from './CircularView';
import {Cursor} from '../../../dataSource/constant/Cursor';
import {Line} from '../../../model/Line';
import {Point} from '../../../model/Point';

export class CircleCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT_NODE] = 'auto';
  }
}

export class CircleView extends CircularView {
  protected override svgElement: SVGGElement = document.createElementNS(ElementView.svgURI, 'g');
  private svgCircleElement: SVGCircleElement = document.createElementNS(ElementView.svgURI, 'circle');
  private svgCircleCenterElement: SVGCircleElement = document.createElementNS(ElementView.svgURI, 'circle');
  protected override _type: ElementType = ElementType.CIRCLE;

  public constructor(container: Container, properties: ElementProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.svgElement.appendChild(this.svgCircleElement);
    this.svgElement.appendChild(this.svgCircleCenterElement);

    this.setAttr({
      'stroke-width': 0,
      fill: '#000',
      r: CircularView.CENTER_POINT_RADIUS
    }, this.svgCircleCenterElement);

    this.__setRect__(rect);

    this.setProperties(properties);
  }

  public override __updateView__(): void {
    this.setAttr({
      cx: this._rect.x + this._rect.width / 2,
      cy: this._rect.y + this._rect.height / 2,
      r: this._rect.width / 2
    }, this.svgCircleElement);

    this.setAttr({
      cx: this._rect.x + this._rect.width / 2,
      cy: this._rect.y + this._rect.height / 2
    }, this.svgCircleCenterElement);
  }

  public override intersectsRect(rect: Rect): boolean {
    const circleRect: Rect = this.getVisibleRect();
    const cx: number = circleRect.x + circleRect.width / 2;
    const cy: number = circleRect.y + circleRect.height / 2;
    const r: number = circleRect.width / 2;
    let intersects: boolean;

    const distX: number = Math.abs(cx - rect.x - rect.width / 2);
    const distY: number = Math.abs(cy - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + r)) {
      intersects = false;
    } else if (distY > (rect.height / 2 + r)) {
      intersects = false;
    } else if (distX <= (rect.width / 2)) {
      intersects = true;
    } else if (distY <= (rect.height / 2)) {
      intersects = true;
    } else {
      const dx: number = distX - rect.width / 2;
      const dy: number = distY - rect.height / 2;
      intersects = dx * dx + dy * dy <= r * r;
    }

    if (intersects) {
      const inscribedSquareSide: number = Math.sqrt(Math.pow(2 * r, 2) / 2);
      const inscribedSquareRect: Rect = {
        x: cx - inscribedSquareSide / 2,
        y: cy - inscribedSquareSide / 2,
        width: inscribedSquareSide,
        height: inscribedSquareSide
      };

      /* if rect is inside inscribedSquareRect, then there is no intersection */
      intersects = !ElementView.rectInRect(rect, inscribedSquareRect);
    }
    return intersects;
  }

  public override intersectsLine(line: Line): boolean {
    line = JSON.parse(JSON.stringify(line));
    const circleRect: Rect = this.getVisibleRect();
    const cx: number = circleRect.x + circleRect.width / 2;
    const cy: number = circleRect.y + circleRect.height / 2;
    const r: number = circleRect.width / 2;

    line.p0.x -= cx;
    line.p1.x -= cx;
    line.p0.y -= cy;
    line.p1.y -= cy;

    const dx: number = line.p1.x - line.p0.x;
    const dy: number = line.p1.y - line.p0.y;
    const dr: number = Math.sqrt(dx*dx + dy*dy);

    /*
    * |x1  x2|
    * |y1  y2|
    */
    /* matrix determinant */
    const D: number = line.p0.x * line.p1.y - line.p1.x * line.p0.y;

    const firstPoint: Point = {
      x: (D*dy + CircleView.sign(dy) * dx * Math.sqrt(r*r * dr*dr - D*D)) / (dr*dr),
      y: (-D*dx + Math.abs(dy) * Math.sqrt(r*r * dr*dr - D*D)) / (dr*dr)
    };
    const secondPoint: Point = {
      x: (D*dy - CircleView.sign(dy) * dx * Math.sqrt(r*r * dr*dr - D*D)) / (dr*dr),
      y: (-D*dx - Math.abs(dy) * Math.sqrt(r*r * dr*dr - D*D)) / (dr*dr)
    };

    if (firstPoint.x && firstPoint.y && secondPoint.x && secondPoint.y) {
      return ElementView.pointDistanceFromSegment(firstPoint, line) <= 5 ||
        ElementView.pointDistanceFromSegment(secondPoint, line) <= 5;
    }
    return false;
  }

  private static sign(num: number): number {
    return num < 0 ? -1 : 1;
  }
}
