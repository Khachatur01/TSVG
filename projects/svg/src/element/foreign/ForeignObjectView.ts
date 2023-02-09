/* eslint-disable @typescript-eslint/naming-convention */
import {ElementCursor, ElementProperties, ElementStyle, ElementView} from '../ElementView';
import {Container} from '../../Container';
import {Point} from '../../model/Point';
import {Rect} from '../../model/Rect';
import {PathView} from '../shape/path/PathView';
import {SVGEvent} from '../../dataSource/constant/SVGEvent';
import {ForeignView} from '../type/ForeignView';
import {MoveDrawable} from '../../service/tool/draw/type/MoveDrawable';
import {ElementType} from '../../dataSource/constant/ElementType';
import {Cursor} from '../../dataSource/constant/Cursor';

export class ForeignObjectCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.DRAW_TEXT_BOX] = 'text';
  }
}

class ForeignObjectStyle extends ElementStyle {
  protected override element: ForeignObjectView;

  public constructor(element: ForeignObjectView) {
    super(element);
    this.element = element;
  }

  public override get strokeWidth(): string {
    return super.strokeWidth;
  }
  public override set strokeWidth(width: string) {
    // super.strokeWidth = width;
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    // super.strokeDashArray = array;
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    // super.strokeColor = color;
  }

  public override get fillColor(): string {
    return super.fillColor;
  }
  public override set fillColor(color: string) {
    // super.fillColor = color;
  }

  public override get fontSize(): string {
    return super.fontSize;
  }
  public override set fontSize(size: string) {
    super.fontSize = size;
    this.element.content.style.fontSize = size + 'px';
  }

  public override get fontColor(): string {
    return super.fontColor;
  }
  public override set fontColor(color: string) {
    super.fontColor = color;
    this.element.content.style.color = color;
  }

  public override get backgroundColor(): string {
    return super.backgroundColor;
  }
  public override set backgroundColor(color: string)  {
    super.backgroundColor = color;
    this.element.content.style.backgroundColor = color;
  }
}

export interface ForeignObjectProperties extends ElementProperties {
  contentEditable?: boolean;
}

export class ForeignObjectView extends ForeignView implements MoveDrawable {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'foreignObject');
  protected override _type: ElementType = ElementType.FOREIGN_OBJECT;

  /* Model */
  public override readonly style: ForeignObjectStyle;
  protected _content: HTMLElement;
  public readonly editOutline: string = 'thin solid #999';
  public readonly defaultOutline: string = '';
  private _lastCommittedHTML = '';

  protected copyEvent = (event: ClipboardEvent) => {
    const text = document.getSelection()?.toString();
    if (text) {
      this._container.focused.__clipboard__.text = text;
    }
    event.preventDefault();
  };
  protected cutEvent = (event: ClipboardEvent) => {
    const text = document.getSelection()?.toString();
    if (text) {
      this._container.focused.__clipboard__.text = text;
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        selection.deleteFromDocument();
      }
    }
    event.preventDefault();
  };
  protected pasteEvent = (event: ClipboardEvent) => {
    const paste = this.container.focused.__clipboard__.text;

    const selection = window.getSelection();
    if (!selection?.rangeCount || paste === '') {
      return;
    }

    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));

    event.preventDefault();
  };
  /* Model */

  /* this flag will be used when content blurred, and no need to call blur event's callback */
  protected callBlurEvent = true;

  public constructor(
    container: Container,
    properties: ForeignObjectProperties = {},
    rect: Rect = {x: 0, y: 0, width: 0, height: 0},
    ownerId?: string,
    index?: number
  ) {

    super(container, ownerId, index);
    this.svgElement.id = this.id;
    this.svgElement.style.outline = this.defaultOutline;
    this.svgElement.style.border = 'none';
    this.style = new ForeignObjectStyle(this);
    this._content = document.createElement('div');
    this._content.style.height = '100%';
    /* prevent from dropping elements inside */
    this._content.ondrop = () => {return false;};

    this.addEditCallBack();
    this.addFocusEvent();
    this.safeClipboard = this._container.focused.__clipboard__.isSafe;

    this.__setRect__(rect);
    this.setAttr({
      preserveAspectRatio: 'none'
    });

    this.setProperties(properties);
  }

  public override setProperties(properties: ForeignObjectProperties) {
    super.setProperties(properties);
    if (properties.contentEditable !== undefined) {
      this._content.contentEditable = properties.contentEditable + '';
    }
  }

  public set safeClipboard(isSafe: boolean) {
    if (isSafe) {
      this._content.addEventListener('copy', this.copyEvent);
      this._content.addEventListener('cut', this.cutEvent);
      this._content.addEventListener('paste', this.pasteEvent);
    } else {
      this._content.removeEventListener('copy', this.copyEvent);
      this._content.removeEventListener('cut', this.cutEvent);
      this._content.removeEventListener('paste', this.pasteEvent);
    }
  }

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
  public __drawSize__(rect: Rect) {
    this.__setRect__(rect);
  }
  public __updateView__(): void {
    this.setAttr({
      x: this._rect.x,
      y: this._rect.y,
      width: this._rect.width,
      height: this._rect.height
    });
  }

  protected addEditCallBack() {
    this._content.addEventListener('input', () => {
      this._container.__call__(SVGEvent.ASSET_EDIT, {element: this});
    });
    this._content.addEventListener('blur', () => {
      if (!this.callBlurEvent) {
        this.callBlurEvent = true;
        return;
      }

      if (this._content.outerHTML !== this._lastCommittedHTML) {
        this._container.__call__(SVGEvent.ASSET_EDIT_COMMIT, {element: this});
        this._lastCommittedHTML = this._content.outerHTML;
      }
    });
  }

  public override __onFocus__() {
    this.svgElement.style.outline = this.editOutline;
  }
  public override __onBlur__() {
    this.svgElement.style.outline = this.defaultOutline;
  }

  protected addFocusEvent(): void {
    this._content.addEventListener('focus', (event) => {
      if (this._selectable && this._container.tools.drawTool.isOn() && this._container.tools.drawTool.getDrawer() === this._container.drawers.textBox) {
        this._container.blur(undefined, false);
        this._container.focus(this, false, undefined, false);
        this._content.focus();
        this.__onFocus__();
      } else {
        this.callBlurEvent = false;
        this._content.blur();
        this.__onBlur__();
      }
    });
  }
  public override set cursor(cursor: string) {
    this.svgElement.style.cursor = cursor;
    this._content.style.cursor = cursor;
  }

  public override get HTML(): HTMLElement | SVGElement {
    if (this._content) {
      return this._content;
    }
    return this.svgElement;
  }

  public get content(): HTMLElement {
    return this._content;
  }
  public setContent(content: string): void {
    this._content.innerHTML = content;
    this._content.style.border = 'none';
    this._content.style.outline = 'none';
    this.svgElement.innerHTML = '';
    this.svgElement.appendChild(this._content);
  }

  public get boundingRect(): Rect {
    const points = this.points;
    return ElementView.calculateRect(points);
  }
  public get visibleBoundingRect(): Rect {
    const points = this.visiblePoints;
    return ElementView.calculateRect(points);
  }

  public isComplete(): boolean {
    return this._rect.width > 0 && this._rect.height > 0;
  }
  public toPath(): PathView {
    return new PathView(this._container, this._properties);
  }

  public override toJSON(): any {
    const json = super.toJSON();
    json.content = encodeURIComponent(this._content.outerHTML);
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    if (json.content) {
      this.svgElement.innerHTML = decodeURIComponent(json.content);
      this._content = this.svgElement.firstChild as HTMLElement;
    }
  };
}
