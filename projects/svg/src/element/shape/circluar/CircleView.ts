import {Point} from "../../../model/Point";
import {Rect} from "../../../model/Rect";
import {ElementCursor, ElementView} from "../../ElementView";
import {Container} from "../../../Container";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {CircularView} from "./CircularView";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class CircleCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "auto";
  }
}

export class CircleView extends CircularView {
  protected override svgElement: SVGCircleElement = document.createElementNS(ElementView.svgURI, "circle");
  protected override _type: ElementType = ElementType.CIRCLE;

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.__setRect__(rect);

    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  protected override __updateView__(): void {
    this.setAttr({
      cx: this._rect.x + this._rect.width / 2,
      cy: this._rect.y + this._rect.height / 2,
      r: this._rect.width / 2
    });
  }

  public override get copy(): CircleView {
    let ellipse: CircleView = new CircleView(this._container, Object.assign({}, this._rect));
    ellipse.refPoint = Object.assign({}, this.refPoint);
    ellipse.__rotate__(this._angle);

    ellipse.style.set = this.style;

    return ellipse;
  }

  public override __setRect__(rect: Rect, delta: Point | null = null): void {
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

    super.__setRect__(rect, delta);
  }
}
