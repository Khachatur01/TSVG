import {Size} from "../../../../../model/Size";
import {PolygonView} from "../PolygonView";
import {Rect} from "../../../../../model/Rect";
import {Point} from "../../../../../model/Point";
import {TSVG} from "../../../../../TSVG";
import {MoveDrawable} from "../../../../../service/tool/draw/type/MoveDrawable";

/*
*  0_____1
*  |     |
* 3|_____|2
* */

export class RectangleView extends PolygonView implements MoveDrawable {
  public constructor(container: TSVG, position: Point = {x: 0, y: 0}, size: Size = {width: 0, height: 0}) {
    super(container, [
      /* 0 */                                                                                        /* 1 */
      {x: position.x, y: position.y},                            {x: size.width + position.x, y: position.y},
      {x: size.width + position.x, y: size.height + position.y}, {x: position.x, y: size.height + position.y}
      /* 2 */                                                                                        /* 3 */

    ]);

    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  public override get copy(): RectangleView {
    return super.copy as RectangleView;
  }

  public override get size(): Size {
    return super.size;
  }

  /*
      This function sets size on drawing.
      Elements, which draw by moving,
      that elements must set size different on drawing
  */
  public drawSize(rect: Rect) {
    let points: Point[] = [];
    points.push({ /* 0 */
      x: rect.x,
      y: rect.y
    });
    points.push({ /* 1 */
      x: rect.x + rect.width,
      y: rect.y
    });
    points.push({ /* 2 */
      x: rect.x + rect.width,
      y: rect.y + rect.height
    });
    points.push({ /* 3 */
      x: rect.x,
      y: rect.y + rect.height
    });

    this.points = points;
  }

  public override isComplete(): boolean {
    let size = this.size;
    return size.width != 0 && size.height != 0;
  }
}
