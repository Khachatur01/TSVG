import {ElementView} from "../ElementView";
import {TSVG} from "../../TSVG";
import {Point} from "../../model/Point";
import {Size} from "../../model/Size";
import {Rect} from "../../model/Rect";
import {PathView} from "../shape/pointed/polyline/PathView";
import {Callback} from "../../dataSource/constant/Callback";
import {ForeignView} from "../type/ForeignView";
import {MoveDrawable} from "../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../dataSource/constant/ElementType";

export class ForeignObjectView extends ForeignView implements MoveDrawable {
  protected _content: HTMLElement | null = null;
  public readonly outline: string = "thin solid #999";

  public constructor(container: TSVG, position: Point = {x: 0, y: 0}, size: Size = {width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement = document.createElementNS(ElementView.svgURI, "foreignObject");
    this.type = ElementType.FOREIGN_OBJECT;
    this.svgElement.id = this.id;
    this.svgElement.style.outline = "none";
    this.style.cursor.edit = "text";

    this.position = position;

    this.setSize({
      x: position.x, y: position.y,
      width: size.width, height: size.height
    });
    this.setOverEvent();

    this.setAttr({
      preserveAspectRatio: "none"
    });

    this._container.addCallBack(Callback.EDIT_TOOl_OFF, () => {
      if (this._content) {
        this._content.style.userSelect = "none";
      }
    });

    this._container.addCallBack(Callback.EDIT_TOOl_ON, () => {
      if (this._content) {
        this._content.style.userSelect = "unset";
      }
    });

    this.addEditCallBack();
  }

  public override get HTML(): SVGElement | HTMLElement {
    if (this._content)
      return this._content;

    return this.svgElement
  }

  public get copy(): ForeignObjectView {
    let position = this.position;
    let size = this.size;

    let foreignObject: ForeignObjectView = new ForeignObjectView(this._container);
    if (this._content)
      foreignObject.setContent(this._content.cloneNode(true) as HTMLElement);

    foreignObject.position = position;
    foreignObject.setSize({
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    });
    foreignObject.fixRect();

    foreignObject.refPoint = Object.assign({}, this.refPoint);
    foreignObject.rotate(this._angle);

    foreignObject.style.set = this.style;

    return foreignObject;
  }

  public get position(): Point {
    return {
      x: parseInt(this.getAttr("x")),
      y: parseInt(this.getAttr("y"))
    };
  }
  public set position(delta: Point) {
    this.setAttr({
      x: this._lastPosition.x + delta.x,
      y: this._lastPosition.y + delta.y
    });
  }

  public override correct(refPoint: Point, lastRefPoint: Point) {
    let delta = this.getCorrectionDelta(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;
    let position = this.position;

    this.setAttr({
      x: position.x + delta.x,
      y: position.y + delta.y
    });
  }

  public get size(): Size {
    return {
      width: parseInt(this.getAttr("width")),
      height: parseInt(this.getAttr("height"))
    };
  }
  public drawSize(rect: Rect) {
    this.setSize(rect);
  }
  public setSize(rect: Rect): void {
    if (rect.width < 0) {
      rect.width = -rect.width;
      rect.x -= rect.width;
    }
    if (rect.height < 0) {
      rect.height = -rect.height;
      rect.y -= rect.height;
    }

    this.setAttr({
      x: rect.x + "",
      y: rect.y + "",
      width: rect.width + "",
      height: rect.height + ""
    });
  }

  protected addEditCallBack() {
    this._content?.addEventListener("input", () => {
      this._container.call(Callback.ASSET_EDIT, {content: this._content});
    });
  }

  public override onFocus() {
    this.svgElement.style.outline = this.outline;
  }
  public override onBlur() {
    this.svgElement.style.outline = "unset";
  }

  public get content(): HTMLElement | null {
    return this._content;
  }
  public setContent(content: HTMLElement, setListeners: boolean = true): void {
    this._content = content;
    content.style.userSelect = "none";
    content.contentEditable = "true";
    this.svgElement.appendChild(content);

    if (setListeners) {
      content.addEventListener("focus", () => {
        if (this._container.editTool.isOn()) {
          content.focus();
        } else {
          content.blur();
        }
      });
      this.addEditCallBack();
    }
  }

  public get boundingRect(): Rect {
    let points = this.points;
    return this.calculateBoundingBox(points);
  }
  public get visibleBoundingRect(): Rect {
    let points = this.rotatedPoints;
    return this.calculateBoundingBox(points);
  }

  public isComplete(): boolean {
    let size = this.size;
    return size.width > 0 && size.height > 0;
  }
  public toPath(): PathView {
    return new PathView(this._container);
  }
}
