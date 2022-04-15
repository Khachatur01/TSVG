import {Point} from "../../../model/Point";
import {Rect} from "../../../model/Rect";
import {ElementCursor, ElementView} from "../../ElementView";
import {Container} from "../../../Container";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {PathView} from "../PathView";
import {Path} from "../../../model/path/Path";
import {Arc} from "../../../model/path/curve/arc/Arc";
import {MoveTo} from "../../../model/path/point/MoveTo";
import {ShapeView} from "../../type/ShapeView";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {EllipseView} from "./EllipseView";
import {CircularView} from "./CircularView";

export class CircleCursor extends ElementCursor {}

export class CircleView extends CircularView {
  protected override svgElement: SVGCircleElement = document.createElementNS(ElementView.svgURI, "circle");
  protected override _type: ElementType = ElementType.CIRCLE;

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.setRect(rect);

    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  protected override updateView(): void {
    this.setAttr({
      cx: this._rect.x + this._rect.width / 2,
      cy: this._rect.y + this._rect.height / 2,
      r: this._rect.width / 2
    });
  }

  public override get copy(): CircleView {
    let ellipse: CircleView = new CircleView(this._container, this._rect);
    ellipse.refPoint = Object.assign({}, this.refPoint);
    ellipse.rotate(this._angle);

    ellipse.style.set = this.style;

    return ellipse;
  }

  public override setRect(rect: Rect, delta: Point | null = null): void {
    if (delta) {
      let deltaXSign = delta.x < 0 ? -1 : 1;
      let deltaYSign = delta.y < 0 ? -1 : 1;
      delta.x = delta.y = (Math.abs(delta.x) + Math.abs(delta.y)) / 2;
      delta.x *= deltaXSign;
      delta.y *= deltaYSign;
    }

    let widthSign = rect.width < 0 ? -1 : 1;
    let heightSign = rect.height < 0 ? -1 : 1;
    rect.width = rect.height = (Math.abs(rect.width) + Math.abs(rect.height)) / 2;
    rect.width *= widthSign;
    rect.height *= heightSign;

    super.setRect(rect, delta);
  }

  public override getVisibleRect(): Rect {
    let containerRect: Rect = this._container.HTML.getBoundingClientRect();
    let rotatedBoundingRect: Rect = this.svgElement.getBoundingClientRect();
    let stoke = parseInt(this.style.strokeWidth);

    rotatedBoundingRect.x -= containerRect.x;
    rotatedBoundingRect.y -= containerRect.y;
    rotatedBoundingRect.width -= stoke / 2;
    rotatedBoundingRect.height -= stoke / 2;

    return rotatedBoundingRect;
  }

}
