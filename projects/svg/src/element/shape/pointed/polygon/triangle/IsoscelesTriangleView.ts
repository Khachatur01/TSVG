import {TriangleView} from "./TriangleView";
import {TSVG} from "../../../../../TSVG";
import {Rect} from "../../../../../model/Rect";
import {Point} from "../../../../../model/Point";
import {MoveDrawable} from "../../../../../service/tool/draw/type/MoveDrawable";

export class IsoscelesTriangleView extends TriangleView implements MoveDrawable {
  public constructor(container: TSVG, rect: Rect | null = null) {
    if (rect) {
      let pointA: Point = {x: rect.x, y: rect.y};
      let pointB: Point = {x: rect.x, y: rect.y + rect.width};
      let pointC: Point = {x: rect.x, y: rect.y};
      super(container, pointA, pointB, pointC);
    } else {
      super(container);
    }
  }

  public override get copy(): IsoscelesTriangleView {
    return super.copy as IsoscelesTriangleView;
  }

  public drawSize(rect: Rect): void {
    let points: Point[] = [];
    points.push({ /* A */
      x: rect.x,
      y: rect.y
    });
    points.push({ /* B */
      x: rect.x - rect.width,
      y: rect.y + rect.height
    });
    points.push({ /* C */
      x: rect.x + rect.width,
      y: rect.y + rect.height
    });

    this.points = points;
  }
}
