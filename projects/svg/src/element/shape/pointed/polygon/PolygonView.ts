import {ElementCursor, ElementProperties, ElementView} from '../../../ElementView';
import {Point} from '../../../../model/Point';
import {PointedView} from '../PointedView';
import {Container} from '../../../../Container';
import {PathView} from '../../path/PathView';
import {ElementType} from '../../../../dataSource/constant/ElementType';

export class PolygonCursor extends ElementCursor {}

export interface PolygonProperties extends ElementProperties {}

export class PolygonView extends PointedView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'polygon');
  protected override _type: ElementType = ElementType.POLYGON;

  public constructor(container: Container, properties: PolygonProperties = {}, points: Point[] = [], ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.points = points;

    this.setProperties(properties);
  }

  public override __updateView__(): void {
    let str: string = '';

    this._points.forEach((point: Point) => {
      str += point.x + ',' + point.y + ' ';
    });
    str.trimEnd();
    this.setAttr({points: str});
  }

  public override isComplete(): boolean {
    return this._points.length >= 3;
  }

  public override toPath(): PathView {
    const path: PathView = super.toPath();
    path.commands[path.commands.length - 1].close = true;
    return path;
  }
}
