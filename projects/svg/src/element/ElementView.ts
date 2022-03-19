import {Point} from "../model/Point";
import {Size} from "../model/Size";
import {Resizeable} from "../service/edit/resize/Resizeable";
import {Rect} from "../model/Rect";
import {Draggable} from "../service/tool/drag/Draggable";
import {Matrix} from "../service/math/Matrix";
import {TSVG} from "../TSVG";
import {PathView} from "./shape/pointed/polyline/PathView";
import {GroupView} from "./group/GroupView";
import {Style} from "../service/style/Style";
import {ElementType} from "../dataSource/constant/ElementType";

interface CursorStyle {
  select: string,
  edit: string
}
export class ElementStyle extends Style {
  private element: ElementView;

  public readonly cursor: CursorStyle = {
    select: "move",
    edit: "crosshair"
  };

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
  public override set backgroundColor(color: string) {
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
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "rect"); // default element
  protected type: ElementType = ElementType.RECTANGLE;

  public readonly style;
  public readonly rotatable: boolean = true;

  protected _ownerId: string;
  protected _index: number;

  protected _container: TSVG;
  protected _lastPosition: Point = {x: 0, y: 0};
  protected _lastSize: Size = {width: 0, height: 0};
  protected _lastAngle: number = 0;
  protected _angle: number = 0;
  protected _refPoint: Point = {x: 0, y: 0};

  private _group: GroupView | null = null;
  private _highlight = this.highlight.bind(this);
  private _lowlight = this.lowlight.bind(this);

  public constructor(container: TSVG, ownerId?: string, index?: number) {
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

  public abstract get size(): Size;
  public abstract setSize(rect: Rect, delta: Point | null): void; /* if delta set, calculate rect width and height by delta */
  public abstract isComplete(): boolean;
  public abstract get position(): Point;
  public abstract set position(delta: Point);
  public abstract get points(): Point[];
  public abstract get boundingRect(): Rect;
  public abstract get visibleBoundingRect(): Rect;
  public abstract toPath(): PathView;
  public abstract get copy(): ElementView;

  public abstract onFocus(): void;
  public abstract onBlur(): void;

  public get container(): TSVG {
    return this._container;
  }
  public set container(container: TSVG) {
    this._container = container;
  }

  public correct(refPoint: Point, lastRefPoint: Point): void {
  };

  public getCorrectionDelta(refPoint: Point, lastRefPoint: Point) {
    /* calculate delta */
    let rotatedRefPoint = Matrix.rotate(
      [{x: lastRefPoint.x, y: lastRefPoint.y}],
      {x: refPoint.x, y: refPoint.y},
      this.angle
    )[0];
    /* correct by delta */
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

  public get rotatedPoints(): Point[] {
    return Matrix.rotate(
      this.points,
      this._refPoint,
      -this._angle
    );
  }

  protected calculateBoundingBox(points: Point[]): Rect {
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

  // public get rotatedCenter(): Point {
  //   return Matrix.rotate(
  //     [this.center],
  //     this._refPoint,
  //     -this._angle
  //   )[0];
  // }
  // public get center(): Point {
  //   let rect = this.boundingRect;
  //
  //   return {
  //     x: rect.x + rect.width / 2,
  //     y: rect.y + rect.height / 2
  //   }
  // }

  public get center(): Point {
    let rect = this.boundingRect;

    let center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
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
      x: this._lastPosition.x + this._lastSize.width / 2,
      y: this._lastPosition.y + this._lastSize.height / 2
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
    this._lastPosition = this.position;
    this._lastSize = this.size;
  }
  public fixPosition(): void {
    this._lastPosition = this.position;
  }
  public fixSize(): void {
    this._lastSize = this.size;
  }
  public fixAngle(): void {
    this._lastAngle = this._angle;
  }

  public get lastRect(): Rect {
    return {
      x: this._lastPosition.x,
      y: this._lastPosition.y,
      width: this._lastSize.width,
      height: this._lastSize.height
    }
  }
  public get lastAngle(): number {
    return this._lastAngle;
  }
}
