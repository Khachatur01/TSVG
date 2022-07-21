import {PolygonView} from "../PolygonView";
import {Container} from "../../../../../Container";
import {Point} from "../../../../../model/Point";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementCursor, ElementProperties} from "../../../../ElementView";

export class TriangleCursor extends ElementCursor {}

export class TriangleView extends PolygonView {
  protected override _type: ElementType = ElementType.TRIANGLE;

  public constructor(container: Container, properties: ElementProperties = {}, pointA: Point | null = null, pointB: Point | null = null, pointC: Point | null = null, ownerId?: string, index?: number) {
    super(container, {}, (pointA && pointB && pointC) ? [pointA, pointB, pointC] : [], ownerId, index);

    this.setProperties(properties);
  }
}
