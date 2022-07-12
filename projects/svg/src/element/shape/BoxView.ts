import {ElementCursor, ElementView} from "../ElementView";
import {Point} from "../../model/Point";
import {Rect} from "../../model/Rect";
import {Container} from "../../Container";
import {PathView} from "./PathView";
import {ShapeView} from "../type/ShapeView";
import {ElementType} from "../../dataSource/constant/ElementType";
import {ElementProperties} from "../../model/ElementProperties";

export class BoxCursor extends ElementCursor {}

export class BoxView extends ShapeView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "rect");
  protected override _type: ElementType = ElementType.BOX;

  public constructor(container: Container, properties: ElementProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this._rect = rect;
    this.__updateView__();

    this.setProperties(properties);
  }
  protected __updateView__(): void {
    this.setAttr({
      x: this._rect.x,
      y: this._rect.y,
      width: this._rect.width,
      height: this._rect.height
    });
  }

  public get copy(): BoxView {
    let box: BoxView = new BoxView(this._container, this._properties);
    box.__setRect__(Object.assign({}, this._rect));
    box.style.set = this.style;

    box.refPoint = Object.assign({}, this.refPoint);
    box.__rotate__(this._angle);

    return box;
  }

  __correct__(refPoint: Point, lastRefPoint: Point): void {}
  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__updateView__();
  }
  public __setRect__(rect: Rect): void {
    if (rect.width < 0) {
      rect.width = -rect.width;
      rect.x -= rect.width;
    }
    if (rect.height < 0) {
      rect.height = -rect.height;
      rect.y -= rect.height;
    }

    this._rect = rect;
    this.__updateView__();
  }

  public override isComplete(): boolean {
    return this._rect.width != 0 && this._rect.height != 0;
  }

  public override toPath(): PathView {
    return new PathView(this._container, this._properties); /* todo */
  }

}
