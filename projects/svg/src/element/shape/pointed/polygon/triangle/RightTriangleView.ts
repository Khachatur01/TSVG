import {TriangleView} from "./TriangleView";
import {TSVG} from "../../../../../TSVG";
import {Rect} from "../../../../../model/Rect";
import {Point} from "../../../../../model/Point";
import {MoveDrawable} from "../../../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementCursor} from "../../../../ElementView";

export class RightTriangleCursor extends ElementCursor {}

export class RightTriangleView extends TriangleView implements MoveDrawable {
  public constructor(container: TSVG, rect: Rect | null = null, ownerId?: string, index?: number) {
    if (rect) {
      let pointA: Point = {x: rect.x, y: rect.y};
      let pointB: Point = {x: rect.x, y: rect.y + rect.width};
      let pointC: Point = {x: rect.x, y: rect.y};
      super(container, pointA, pointB, pointC, ownerId, index);
    } else {
      super(container, null, null, null, ownerId, index);
    }
    this._type = ElementType.RIGHT_TRIANGLE;
  }

  public override get copy(): RightTriangleView {
    return super.copy as RightTriangleView;
  }

  public drawSize(rect: Rect) {
    let points: Point[] = [];
    points.push({ /* A */
      x: rect.x,
      y: rect.y
    });
    points.push({ /* B */
      x: rect.x,
      y: rect.y + rect.height
    });
    points.push({ /* C */
      x: rect.x + rect.width,
      y: rect.y + rect.height
    });

    this.points = points;
  }
}
