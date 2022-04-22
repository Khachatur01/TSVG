import {PolygonView} from "../PolygonView";
import {Rect} from "../../../../../model/Rect";
import {Container} from "../../../../../Container";
import {MoveDrawable} from "../../../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementCursor, ElementView} from "../../../../ElementView";

export class RectangleCursor extends ElementCursor {}

/*
*  0_____1
*  |     |
* 3|_____|2
* */

export class RectangleView extends PolygonView implements MoveDrawable {
  protected override _type: ElementType = ElementType.RECTANGLE;

  public constructor(container: Container, rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, [
      /* 0 */                                                                                        /* 1 */
      {x: rect.x, y: rect.y},                            {x: rect.width + rect.x, y: rect.y},
      {x: rect.width + rect.x, y: rect.height + rect.y}, {x: rect.x, y: rect.height + rect.y}
      /* 2 */                                                                                        /* 3 */
    ], ownerId, index);

    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  public override get copy(): RectangleView {
    return super.copy as RectangleView;
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
    return this._rect.width != 0 && this._rect.height != 0;
  }
}
