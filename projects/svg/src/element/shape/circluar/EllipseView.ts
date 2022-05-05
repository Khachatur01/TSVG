import {Rect} from "../../../model/Rect";
import {ElementCursor, ElementView} from "../../ElementView";
import {Container} from "../../../Container";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {CircularView} from "./CircularView";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class EllipseCursor extends ElementCursor {
  constructor() {
    super();
  }
}

export class EllipseView extends CircularView {
  protected override svgElement: SVGEllipseElement = document.createElementNS(ElementView.svgURI, "ellipse");
  protected override _type: ElementType = ElementType.ELLIPSE;

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.__setRect__(rect);

    this.setOverEvent();
    this.style.setDefaultStyle();
  }

  public get copy(): EllipseView {
    let ellipse: EllipseView = new EllipseView(this._container, Object.assign({}, this._rect));
    ellipse.refPoint = Object.assign({}, this.refPoint);
    ellipse.__rotate__(this._angle);

    ellipse.style.set = this.style;

    return ellipse;
  }
}
