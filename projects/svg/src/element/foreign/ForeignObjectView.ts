import {ElementCursor, ElementView} from "../ElementView";
import {Container} from "../../Container";
import {Point} from "../../model/Point";
import {Rect} from "../../model/Rect";
import {PathView} from "../shape/PathView";
import {Callback} from "../../dataSource/constant/Callback";
import {ForeignView} from "../type/ForeignView";
import {MoveDrawable} from "../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../dataSource/constant/ElementType";
import {Cursor} from "../../dataSource/constant/Cursor";

export class ForeignObjectCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "auto";
  }
}

export class ForeignObjectView extends ForeignView implements MoveDrawable {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "foreignObject");
  protected override _type: ElementType = ElementType.FOREIGN_OBJECT;

  /* Model */
  protected _content: HTMLElement | null = null;
  public readonly outline: string = "thin solid #999";
  /* Model */

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;
    this.svgElement.style.outline = "none";
    this.svgElement.style.border = "none";
    this.style.fontSize = this.style.fontSize;
    this.style.fontColor = this.style.fontColor;
    this.style.backgroundColor = this.style.backgroundColor;

    this.setRect(rect);
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
    try {
      this.style.setDefaultStyle();
    } catch (error: any) {
    }

    this.addEditCallBack();
  }

  public get copy(): ForeignObjectView {
    let foreignObject: ForeignObjectView = new ForeignObjectView(this._container);
    if (this._content)
      foreignObject.setContent(this._content.cloneNode(true) as HTMLElement);

    foreignObject.setRect(this._rect);
    foreignObject.fixRect();

    foreignObject.refPoint = Object.assign({}, this.refPoint);
    foreignObject.rotate(this._angle);

    foreignObject.style.set = this.style;

    return foreignObject;
  }

  public drag(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.updateView();
  }
  public setRect(rect: Rect, delta?: Point): void {
    if (rect.width < 0) {
      rect.width = -rect.width;
      rect.x -= rect.width;
    }
    if (rect.height < 0) {
      rect.height = -rect.height;
      rect.y -= rect.height;
    }
    this._rect = rect;
    this.updateView();
  }
  protected updateView(): void {
    this.setAttr({
      x: this._rect.x + "",
      y: this._rect.y + "",
      width: this._rect.width + "",
      height: this._rect.height + ""
    });
  }

  public override correct(refPoint: Point, lastRefPoint: Point) {
    let delta = this.getCorrectionDelta(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;

    this._rect.x = this._rect.x + delta.x;
    this._rect.y = this._rect.y + delta.y;

    this.updateView();
  }

  public drawSize(rect: Rect) {
    this.setRect(rect);
  }

  protected addEditCallBack() {
    this._content?.addEventListener("input", () => {
      this._container.call(Callback.ASSET_EDIT, {content: this._content});
    });
  }

  public override onFocus(force: boolean = false) {
    if (force || this._container.editTool.isOn()) {
      this.svgElement.style.outline = this.outline;
    }
  }
  public override onBlur() {
    this.svgElement.style.outline = "unset";
  }

  public override get HTML(): HTMLElement | SVGElement {
    if (this._content) {
      return this._content;
    }
    return this.svgElement;
  }

  public get content(): HTMLElement | null {
    return this._content;
  }
  public setContent(content: HTMLElement, setListeners: boolean = true): void {
    this._content = content;
    content.style.userSelect = "none";
    content.style.border = "none";
    content.style.outline = "none";
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
    return ElementView.calculateRect(points);
  }
  public get visibleBoundingRect(): Rect {
    let points = this.visiblePoints;
    return ElementView.calculateRect(points);
  }

  public isComplete(): boolean {
    return this._rect.width > 0 && this._rect.height > 0;
  }
  public toPath(): PathView {
    return new PathView(this._container);
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["content"] = this._content?.outerHTML;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    if (json.content) {
      let content = document.createElement("div");
      this.setContent(content);
      content.outerHTML = json.content;
      this._content = content;
    }
  };
}
