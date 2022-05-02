import {ElementCursor, ElementView} from "../../ElementView";
import {PathView} from "../../shape/PathView";
import {Size} from "../../../model/Size";
import {Rect} from "../../../model/Rect";
import {Point} from "../../../model/Point";
import {Container} from "../../../Container";
import {ForeignView} from "../../type/ForeignView";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class ImageCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "default";
  }
}

export class ImageView extends ForeignView implements MoveDrawable {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "image");
  protected override _type: ElementType = ElementType.IMAGE;

  /* Model */
  private _src: string = "";
  /* Model */

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, src: string, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.svgElement.ondragstart = function () {
      return false;
    }

    this.__setRect__(rect);
    this.src = src;

    this.setOverEvent();

    this.setAttr({
      preserveAspectRatio: "none"
    });
  }

  protected __updateView__(): void {
    this.setAttr({
      x: this._rect.x + "",
      y: this._rect.y + "",
      width: this._rect.width + "",
      height: this._rect.height + ""
    });

  }
  public get copy(): ImageView {
    let image: ImageView = new ImageView(this._container, this._rect, this._src);

    image.refPoint = Object.assign({}, this.refPoint);
    image.__rotate__(this._angle);

    image.style.set = this.style;

    return image;
  }
  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__updateView__();
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point) {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;

    this._rect.x = this._rect.x + delta.x;
    this._rect.y = this._rect.y + delta.y;

    this.__updateView__();
  }

  public get size(): Size {
    return {
      width: parseInt(this.getAttr("width")),
      height: parseInt(this.getAttr("height"))
    };
  }
  public __drawSize__(rect: Rect) {
    this.__setRect__(rect);
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

  public get src(): string {
    return this._src;
  }
  public set src(URI: string) {
    this.setAttr({href: URI});
    this._src = URI;
  }

  public isComplete(): boolean {
    let size = this.size;
    return size.width > 0 && size.height > 0;
  }

  public toPath(): PathView {
    return new PathView(this._container);
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["src"] = this._src;
    json["content"] = undefined;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.src = json.src;
  };
}
