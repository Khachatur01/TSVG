/* eslint-disable @typescript-eslint/naming-convention */
import {PolygonProperties, PolygonView} from '../PolygonView';
import {Rect} from '../../../../../model/Rect';
import {Container} from '../../../../../Container';
import {MoveDrawable} from '../../../../../service/tool/draw/type/MoveDrawable';
import {ElementType} from '../../../../../dataSource/constant/ElementType';
import {ElementCursor, ElementView} from '../../../../ElementView';

export class RectangleCursor extends ElementCursor {}

export interface RectangleProperties extends PolygonProperties {}

/*
*  0_____1
*  |     |
*  |_____|
*  3     2
* */

export class RectangleView extends PolygonView implements MoveDrawable {
  protected override _type: ElementType = ElementType.RECTANGLE;

  public constructor(container: Container, properties: RectangleProperties = {}, rect = {x: 0, y: 0, width: 1, height: 1}, ownerId?: string, index?: number) {
    super(container, {}, [
      /* 0 */                                                                         /* 1 */
      {x: rect.x, y: rect.y},                             {x: rect.width + rect.x, y: rect.y},
      {x: rect.width + rect.x, y: rect.height + rect.y}, {x: rect.x, y: rect.height + rect.y}
      /* 2 */                                                                         /* 3 */
    ], ownerId, index);

    this.setProperties(properties);
  }

  public __drawSize__(rect: Rect) {
    this._points = [];
    this._points.push({ /* 0 */
      x: rect.x,
      y: rect.y
    });
    this._points.push({ /* 1 */
      x: rect.x + rect.width,
      y: rect.y
    });
    this._points.push({ /* 2 */
      x: rect.x + rect.width,
      y: rect.y + rect.height
    });
    this._points.push({ /* 3 */
      x: rect.x,
      y: rect.y + rect.height
    });

    this._rect = ElementView.calculateRect(this._points);

    this.__updateView__();
  }

  public override isComplete(): boolean {
    return this._rect.width !== 0 && this._rect.height !== 0;
  }
}
