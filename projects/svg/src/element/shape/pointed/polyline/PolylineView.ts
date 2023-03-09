import {ElementCursor, ElementProperties, ElementView} from '../../../ElementView';
import {Point} from '../../../../model/Point';
import {PointedView} from '../PointedView';
import {Container} from '../../../../Container';
import {ElementType} from '../../../../dataSource/constant/ElementType';
import {Rect} from '../../../../model/Rect';
import {Line} from '../../../../model/Line';

export class PolylineCursor extends ElementCursor {}

export interface PolylineProperties extends ElementProperties {}

export class PolylineView extends PointedView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'polyline');
  protected override _type: ElementType = ElementType.POLYLINE;

  public constructor(container: Container, properties: PolylineProperties = {}, points: Point[] = [], ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.points = points;

    this.setProperties(properties);
  }

  public override __updateView__(): void {
    let str: string = '';
    this._points.forEach((point: Point) => {
      str += point.x + ' ' + point.y + ' ';
    });
    str.trimEnd();
    this.setAttr({points: str});
  }

  public override intersectsRect(rect: Rect): boolean {
    const points: Point[] = this.visiblePoints;
    return ElementView.pointsIntersectingRect(points, rect, false);
  }
  public override intersectsLine(line: Line): boolean {
    const points: Point[] = this.visiblePoints;
    return ElementView.pointsIntersectingSides(points, [line], false);
  }

  public override isComplete(): boolean {
    return this._points.length >= 3;
  }
}
