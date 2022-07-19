import {TriangleView} from "./TriangleView";
import {Container} from "../../../../../Container";
import {Rect} from "../../../../../model/Rect";
import {MoveDrawable} from "../../../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementCursor, ElementProperties} from "../../../../ElementView";

export class IsoscelesTriangleCursor extends ElementCursor {}

export class IsoscelesTriangleView extends TriangleView implements MoveDrawable {
  protected override _type: ElementType = ElementType.ISOSCELES_TRIANGLE;

  public constructor(container: Container, properties: ElementProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, {},
      {x: rect.x, y: rect.y},
      {x: rect.x, y: rect.y + rect.width},
      {x: rect.x, y: rect.y},
      ownerId, index);

    this.setProperties(properties);
  }

  public override get copy(): IsoscelesTriangleView {
    let copy: IsoscelesTriangleView = Object.assign(
      new IsoscelesTriangleView(this._container, this._properties),
      super.copy
    );
    copy._type = ElementType.ISOSCELES_TRIANGLE;
    return copy;
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
    this._rect = {
      x: rect.x - rect.width,
      y: rect.y,
      width: rect.width * 2,
      height: rect.height
    };

    this.__updateView__();
  }
}
