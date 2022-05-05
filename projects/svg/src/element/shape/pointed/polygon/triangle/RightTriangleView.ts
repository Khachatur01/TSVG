import {TriangleView} from "./TriangleView";
import {Container} from "../../../../../Container";
import {Rect} from "../../../../../model/Rect";
import {MoveDrawable} from "../../../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementCursor} from "../../../../ElementView";

export class RightTriangleCursor extends ElementCursor {}

export class RightTriangleView extends TriangleView implements MoveDrawable {
  protected override _type: ElementType = ElementType.RIGHT_TRIANGLE;

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container,
      {x: rect.x, y: rect.y}, /* PointA */
      {x: rect.x, y: rect.y + rect.width},  /* PointB */
      {x: rect.x, y: rect.y},  /* PointC */
      ownerId, index);
  }

  public override get copy(): RightTriangleView {
    let copy: RightTriangleView = Object.assign(new RightTriangleView(this._container), super.copy);
    copy._type = ElementType.RIGHT_TRIANGLE;
    return copy;
  }

  public __drawSize__(rect: Rect) {
    this._points = [];
    this._points.push({ /* A */
      x: rect.x,
      y: rect.y
    });
    this._points.push({ /* B */
      x: rect.x,
      y: rect.y + rect.height
    });
    this._points.push({ /* C */
      x: rect.x + rect.width,
      y: rect.y + rect.height
    });
    this._rect = rect;

    this.__updateView__();
  }
}
