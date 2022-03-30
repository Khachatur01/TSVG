import {PolygonView} from "../PolygonView";
import {TSVG} from "../../../../../TSVG";
import {Point} from "../../../../../model/Point";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementCursor} from "../../../../ElementView";

export class TriangleCursor extends ElementCursor {}

export class TriangleView extends PolygonView {
  public constructor(container: TSVG, pointA: Point | null = null, pointB: Point | null = null, pointC: Point | null = null, ownerId?: string, index?: number) {
    super(container, (pointA && pointB && pointC) ? [pointA, pointB, pointC] : [], ownerId, index);

    this.setOverEvent();
    this.style.setDefaultStyle();
    this._type = ElementType.TRIANGLE;
  }

  public override get copy(): TriangleView {
    return super.copy as TriangleView;
  }
}
