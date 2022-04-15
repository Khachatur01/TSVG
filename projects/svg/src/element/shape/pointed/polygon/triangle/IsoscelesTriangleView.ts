import {TriangleView} from "./TriangleView";
import {Container} from "../../../../../Container";
import {Rect} from "../../../../../model/Rect";
import {MoveDrawable} from "../../../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementCursor} from "../../../../ElementView";

export class IsoscelesTriangleCursor extends ElementCursor {}

export class IsoscelesTriangleView extends TriangleView implements MoveDrawable {
  protected override _type: ElementType = ElementType.ISOSCELES_TRIANGLE;

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container,
      {x: rect.x, y: rect.y},
      {x: rect.x, y: rect.y + rect.width},
      {x: rect.x, y: rect.y},
      ownerId, index);
  }

  public override get copy(): IsoscelesTriangleView {
    return super.copy as IsoscelesTriangleView;
  }

  public drawSize(rect: Rect): void {
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
    this._rect = {
      x: rect.x - rect.width,
      y: rect.y,
      width: rect.width * 2,
      height: rect.height
    };

    this.updateView();
  }
}
