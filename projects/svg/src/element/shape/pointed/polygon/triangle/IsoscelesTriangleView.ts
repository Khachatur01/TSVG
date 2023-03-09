import {TriangleProperties, TriangleView} from './TriangleView';
import {Container} from '../../../../../Container';
import {Rect} from '../../../../../model/Rect';
import {MoveDrawable} from '../../../../../service/tool/draw/type/MoveDrawable';
import {ElementType} from '../../../../../dataSource/constant/ElementType';
import {ElementCursor, ElementView} from '../../../../ElementView';

export class IsoscelesTriangleCursor extends ElementCursor {}

export interface IsoscelesTriangleProperties extends TriangleProperties {}

export class IsoscelesTriangleView extends TriangleView implements MoveDrawable {
  protected override _type: ElementType = ElementType.ISOSCELES_TRIANGLE;

  public constructor(container: Container, properties: IsoscelesTriangleProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, {},
      {x: rect.x, y: rect.y},
      {x: rect.x, y: rect.y + rect.width},
      {x: rect.x, y: rect.y},
      ownerId, index);

    this.setProperties(properties);
  }

  public __drawSize__(rect: Rect): void {
    this._points = [];
    this._points.push({ /* A */
      x: rect.x,
      y: rect.y
    });
    this._points.push({ /* B */
      x: rect.x - rect.width,
      y: rect.y + rect.height
    });
    this._points.push({ /* C */
      x: rect.x + rect.width,
      y: rect.y + rect.height
    });
    this._rect = ElementView.calculateRect(this._points);

    this.__updateView__();
  }
}
