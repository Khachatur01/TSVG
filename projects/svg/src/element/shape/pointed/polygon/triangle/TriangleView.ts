import {PolygonView} from "../PolygonView";
import {Container} from "../../../../../Container";
import {Point} from "../../../../../model/Point";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementCursor} from "../../../../ElementView";
import {ElementProperties} from "../../../../../model/ElementProperties";

export class TriangleCursor extends ElementCursor {}

export class TriangleView extends PolygonView {
  protected override _type: ElementType = ElementType.TRIANGLE;

  public constructor(container: Container, properties: ElementProperties = {}, pointA: Point | null = null, pointB: Point | null = null, pointC: Point | null = null, ownerId?: string, index?: number) {
    super(container, {}, (pointA && pointB && pointC) ? [pointA, pointB, pointC] : [], ownerId, index);

    this.setProperties(properties);
  }

  public override get copy(): TriangleView {
    let copy: TriangleView = Object.assign(new TriangleView(this._container, this._properties), super.copy);
    copy._type = ElementType.TRIANGLE;
    return copy;
  }
}
