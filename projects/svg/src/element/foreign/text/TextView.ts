import {Container} from "../../../Container";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementCursor, ElementProperties} from "../../ElementView";
import {Rect} from "../../../model/Rect";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {ForeignView} from "../../type/ForeignView";
import {Point} from "../../../model/Point";
import {EllipseView} from "../../shape/circluar/EllipseView";
import {PathView} from "../../shape/PathView";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";

export class TextBoxCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.DRAW_TEXT_BOX] = "text";
  }
}

export class TextView extends ForeignView implements MoveDrawable {
  protected override _type: ElementType = ElementType.TEXT;
  protected svgElement: SVGElement = document.createElementNS(EllipseView.svgURI, "text");
  private _text: string = "";

  public constructor(container: Container, properties: ElementProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, text: string = "", ownerId?: string, index?: number) {
    super(container, ownerId, index);

    this._rect = rect;
    this.text = text;

    this.__updateView__();
    this.setProperties(properties);
  }

  public override get copy(): TextView {
    let copy: TextView = new TextView(this._container, this._properties);
    copy._type = ElementType.TEXT;

    copy.text = this._text;
    copy.style.set = this.style;

    copy.refPoint = Object.assign({}, this.refPoint);
    copy.__rotate__(this._angle);
    return copy;
  }

  get text(): string {
    return this._text;
  }

  set text(text: string) {
    this._text = text;
    this.svgElement.innerHTML = text;
  }

  public __correct__(refPoint: Point, lastRefPoint: Point): void {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;
    this.__drag__(delta);
  }
  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__updateView__();
  }

  public __drawSize__(rect: Rect) {
    this.__setRect__(rect);
  }
  public __setRect__(rect: Rect, delta?: Point): void {
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

  public __updateView__(): void {
    this.setAttr({
      x: this._rect.x,
      y: this._rect.y
    });
  }

  public toPath(): PathView { /* todo */
    return new PathView(this._container);
  }

  public override isComplete(): boolean {
    return this._rect.width > 15 && this._rect.height > 15;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json.text = this._text;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.text = json.text;
  };
}
