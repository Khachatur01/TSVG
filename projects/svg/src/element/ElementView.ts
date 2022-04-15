import {Point} from "../model/Point";
import {Resizeable} from "../service/edit/resize/Resizeable";
import {Rect} from "../model/Rect";
import {Draggable} from "../service/tool/drag/Draggable";
import {Matrix} from "../service/math/Matrix";
import {Container} from "../Container";
import {PathView} from "./shape/PathView";
import {GroupView} from "./group/GroupView";
import {Style} from "../service/style/Style";
import {ElementType} from "../dataSource/constant/ElementType";
import {Cursor} from "../dataSource/constant/Cursor";
import {ForeignObjectView} from "./foreign/ForeignObjectView";

export class ElementCursor {
  public cursor: any = {};
  constructor() {
    this.cursor[Cursor.SELECT] = "move";
    this.cursor[Cursor.EDIT] = "crosshair";
  }
}

export class ElementStyle extends Style {
  protected element: ElementView;

  public constructor(element: ElementView) {
    super();
    this.element = element;
  }

  public override get strokeWidth(): string {
    return super.strokeWidth;
  }
  public override set strokeWidth(width: string) {
    super.strokeWidth = width;
    this.element.setAttr({"stroke-width": width});
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    super.strokeColor = color;
    this.element.setAttr({"stroke": color});
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    super.strokeDashArray = array;
    this.element.setAttr({"stroke-dasharray": array});
  }

  public override get fillColor(): string {
    let color = super.fillColor;
    if(!color || color == "none" || color == "transparent")
      color = "#FFFFFF00";
    return color;
  }
  public override set fillColor(color: string) {
    super.fillColor = color;
    if(color.length == 9 && color.slice(-2) === "00")
      color = "none";
    this.element.setAttr({"fill": color});
  }

  public override get fontSize(): string {
    return super.fontSize;
  }
  public override set fontSize(size: string) {
    super.fontSize = size;
    this.element.HTML.style.fontSize = size + "px";
  }

  public override get fontColor(): string {
    return super.fontColor;
  }
  public override set fontColor(color: string) {
    super.fontColor = color;
    this.element.HTML.style.color = color;
  }

  public override get backgroundColor(): string {
    return super.backgroundColor;
  }
  public override set backgroundColor(color: string)  {
    super.backgroundColor = color;
    this.element.HTML.style.backgroundColor = color;
  }

  public setDefaultStyle(): void {
    let style = this.element.container.style;
    this.strokeWidth = style.strokeWidth;
    this.strokeColor = style.strokeColor;
    this.fillColor = style.fillColor;
    this.fontSize = style.fontSize;
    this.fontColor = style.fontColor;
    this.backgroundColor = style.backgroundColor;
  }
}

export abstract class ElementView implements Resizeable, Draggable {
  public static readonly svgURI: "http://www.w3.org/2000/svg" = "http://www.w3.org/2000/svg";
  protected abstract svgElement: SVGElement;
  public readonly rotatable: boolean = true;

  /* Model */
  protected abstract _type: ElementType;
  public readonly style: ElementStyle;
  protected _ownerId: string;
  protected _index: number;
  private _group: GroupView | null = null;
  protected _container: Container;
  protected _rect: Rect = {x: 0, y: 0, width: 0, height: 0};
  protected _angle: number = 0;
  protected _refPoint: Point = {x: 0, y: 0};
  protected _lastRect: Rect = {x: 0, y: 0, width: 0, height: 0};
  protected _lastAngle: number = 0;
  /* Model */

  private _highlight = this.highlight.bind(this);
  private _lowlight = this.lowlight.bind(this);

  public translate(delta: Point) {
    this.svgElement.style.transform =
      "translate(" + delta.x + "px, " + delta.y + "px) rotate(" + this._angle + "deg)";
  }
  public abstract drag(delta: Point): void;
  public getVisibleRect(): Rect {
    return ElementView.calculateRect(this.visiblePoints);
  };
  public getRect(): Rect {
    return this._rect;
  };
  public abstract setRect(rect: Rect, delta?: Point): void; /* if delta set, calculate rect width and height by delta */

  protected abstract updateView(): void;
  public get visiblePoints(): Point[] {
    return Matrix.rotate(
      this.points,
      this._refPoint,
      -this._angle
    );
  }
  public get points(): Point[] {
    return [
      {x: this._rect.x, y: this._rect.y},
      {x: this._rect.x + this._rect.width, y: this._rect.y},
      {x: this._rect.x + this._rect.width, y: this._rect.y + this._rect.height},
      {x: this._rect.x, y: this._rect.y + this._rect.height}
    ];
  };
  public abstract toPath(): PathView;
  public abstract get copy(): ElementView;
  public abstract isComplete(): boolean;

  public abstract onFocus(): void;
  public abstract onBlur(): void;

  public constructor(container: Container, ownerId?: string, index?: number) {
    this._container = container;
    this.style = new ElementStyle(this);

    if (ownerId) {
      this._ownerId = ownerId;
    } else {
      this._ownerId = container.ownerId;
    }
    if (index) {
      this._index = index;
    } else {
      this._index = container.nextElementIndex;
    }
  }

  public get type(): ElementType {
    return this._type;
  }

  public get id(): string {
    return this._container.idPrefix + "_u" + this._ownerId + "_e" + this._index;
  }
  public setId(ownerId: string, index: number) {
    this._ownerId = ownerId;
    this._index = index;
    this.svgElement.id = this.id;
  }

  get ownerId(): string {
    return this._ownerId;
  }
  public set ownerId(ownerId: string) {
    this._ownerId = ownerId;
    this.svgElement.id = this.id;
  }

  get index(): number {
    return this._index;
  }
  public set index(index: number) {
    this._index = index;
    this.svgElement.id = this.id;
  }

  public get container(): Container {
    return this._container;
  }
  public set container(container: Container) {
    this._container = container;
  }

  public abstract correct(refPoint: Point, lastRefPoint: Point): void;

  public getCorrectionDelta(refPoint: Point, lastRefPoint: Point) {
    /* calculate delta */
    let rotatedRefPoint = Matrix.rotate(
      [{x: lastRefPoint.x, y: lastRefPoint.y}],
      {x: refPoint.x, y: refPoint.y},
      this.angle
    )[0];
    /* correction by delta */
    return {
      x: Math.round(rotatedRefPoint.x - lastRefPoint.x),
      y: Math.round(rotatedRefPoint.y - lastRefPoint.y)
    };
  }

  public get group(): GroupView | null {
    return this._group;
  }
  public set group(group: GroupView | null) {
    this._group = group;
  }

  public static calculateRect(points: Point[]): Rect {
    if (points.length === 0) return {x: 0, y: 0, width: 0, height: 0};
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      if (points[i].x < minX)
        minX = points[i].x;
      if (points[i].y < minY)
        minY = points[i].y;

      if (points[i].x > maxX)
        maxX = points[i].x;
      if (points[i].y > maxY)
        maxY = points[i].y;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  protected calculateRectByNewPoint(point: Point): Rect {
    let position = this._rect;
    let size = this._rect;

    if (point.x < position.x) {
      position.width += position.x - point.x;
      position.x = point.x;
    }
    else if (point.x > position.x + size.width) {
      size.width = point.x - position.x;
    }

    if (point.y < position.y) {
      position.height += position.y - point.y;
      position.y = point.y;
    }
    else if (point.y > position.y + size.height) {
      size.height = point.y - position.y;
    }

    return {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    }
  }

  public get center(): Point {
    let center = {
      x: this._rect.x + this._rect.width / 2,
      y: this._rect.y + this._rect.height / 2
    }
    if (this._angle == 0) {
      return center;
    } else {
      return Matrix.rotate(
        [center],
        this._refPoint,
        -this._angle
      )[0];
    }
  }

  public get refPoint(): Point {
    return this._refPoint;
  }
  public set refPoint(refPoint: Point) {
    this.svgElement.style.transformOrigin = refPoint.x + "px " + refPoint.y + "px";
    this._refPoint = refPoint;
  }
  public centerRefPoint() {
    this.refPoint = {
      x: this._lastRect.x + this._lastRect.width / 2,
      y: this._lastRect.y + this._lastRect.height / 2
    };
  }

  public get angle(): number {
    return this._angle;
  }
  public rotate(angle: number): void {
    this.svgElement.style.transform = "rotate(" + angle + "deg)";
    this._angle = angle;
  }

  public get SVG(): SVGElement {
    return this.svgElement;
  }
  public get HTML(): SVGElement | HTMLElement {
    return this.svgElement;
  }

  public getAttr(attribute: string): string {
    let value = this.SVG.getAttribute(attribute);
    if (!value)
      return "0";
    return value;
  }
  public setAttr(attributes: object): void {
    for (const [key, value] of Object.entries(attributes))
      if (key && value)
        this.SVG.setAttribute(key, "" + value);
  }

  public setOverEvent(): void {
    this.svgElement.addEventListener("mouseover", this._highlight);
    this.svgElement.addEventListener("mouseout", this._lowlight);
  }
  public removeOverEvent(): void {
    this.svgElement.removeEventListener("mouseover", this._highlight);
    this.svgElement.removeEventListener("mouseout", this._lowlight);
  }

  public remove() {
    this.svgElement.parentElement?.removeChild(this.svgElement);
  }

  public highlight(): void {
    if (this._container.selectTool.isOn())
      this.svgElement.style.filter = "drop-shadow(0px 0px 5px rgb(0 0 0 / 0.7))";
  }
  public lowlight(): void {
    this.svgElement.style.filter = "unset";
  }

  public fixRect(): void {
    this._lastRect = Object.assign({}, this._rect);
  }
  public fixAngle(): void {
    this._lastAngle = this._angle;
  }

  public get lastRect(): Rect {
    return this._lastRect;
  }
  public get lastAngle(): number {
    return this._lastAngle;
  }

  public toJSON(): any {
    return {
      type: this._type,
      style: this.style.toJSON(),
      ownerId: this._ownerId,
      index: this._index,
      group: {
        ownerId: this._group?._ownerId,
        index: this._group?._index
      },
      containerId: this._container.id,
      rect: this._rect,
      angle: this._angle,
      refPoint: this._refPoint,
    }
  }
  public fromJSON(json: any) {
    this.style.set = json.style;
    this.setId(json.ownerId, json.index);
    if (this._group) {
      this._group._ownerId = json.group.ownerId;
      this._group._index = json.group.index;
    }
    this.fixRect();
    this.setRect(json.rect);
    this.rotate(json.angle);
    this.refPoint = json.refPoint;
  };
}
