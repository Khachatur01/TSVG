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
import {Line} from "../model/Line";

export class ElementCursor {
  public cursor: any = {};
  constructor() {
    this.cursor[Cursor.SELECT] = "move";
    this.cursor[Cursor.EDIT] = "default";
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

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    super.strokeDashArray = array;
    this.element.setAttr({"stroke-dasharray": array});
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    super.strokeColor = color;
    this.element.setAttr({"stroke": color});
  }

  public override get fillColor(): string {
    return super.fillColor;
  }
  public override set fillColor(color: string) {
    super.fillColor = color;
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
  public readonly style: ElementStyle = new ElementStyle(this);
  protected _ownerId: string;
  protected _index: number;
  private _group: GroupView | null = null;
  protected _container: Container;
  protected _rect: Rect = {x: 0, y: 0, width: 0, height: 0};
  protected _angle: number = 0;
  protected _refPoint: Point = {x: 0, y: 0};
  protected _lastRect: Rect = {x: 0, y: 0, width: 0, height: 0};
  protected ___lastAngle__: number = 0;
  protected _selectable: boolean = true;
  /* Model */

  private _highlight = this.__highlight__.bind(this);
  private _lowlight = this.__lowlight__.bind(this);

  public constructor(container: Container, ownerId?: string, index?: number) {
    this._container = container;

    /*
    * One of ownerId and index arguments can't be undefined.
    * Both should be defined or both should be undefined
    * */
    if (ownerId && index) { /* set defined id to element */
      this._ownerId = ownerId;
      this._index = index;
    } else if (!ownerId && !index) { /* generate id for element */
      this._ownerId = container.ownerId;
      this._index = container.nextElementIndex;
    } else {
      throw Error("Missing id argument: ownerId{ " + ownerId + " }, index{ " + index + " }");
    }
  }

  public __translate__(delta: Point) {
    this.svgElement.style.transform =
      "translate(" + delta.x + "px, " + delta.y + "px) rotate(" + this._angle + "deg)";
  }
  public abstract __drag__(delta: Point): void;
  public getVisibleRect(): Rect {
    return ElementView.calculateRect(this.visiblePoints);
  };
  public getRect(): Rect {
    return this._rect;
  };
  public abstract __setRect__(rect: Rect, delta?: Point): void; /* if delta set, calculate rect width and height by delta */


  protected abstract __updateView__(): void;
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

  /**
   * check if rect1 fully inside rect2
   * @param rect1 inside rect
   * @param rect2 outside rect
   * */
  public static rectInRect(rect1: Rect, rect2: Rect): boolean {
    return (rect1.x > rect2.x) && (rect1.x + rect1.width < rect2.x + rect2.width) &&
      (rect1.y > rect2.y) && (rect1.y + rect1.height < rect2.y + rect2.height);
  }
  public static pointInRect(point: Point, rect: Rect): boolean {
    return (point.x > rect.x) && (point.x < rect.x + rect.width) &&
      (point.y > rect.y) && (point.y < rect.y + rect.height);
  }
  public static linesIntersect(line0: Line, line1: Line): boolean {
    /* returns false if lines are overlap */
    let det, gamma, lambda;
    det = (line0.p1.x - line0.p0.x) * (line1.p1.y - line1.p0.y) - (line1.p1.x - line1.p0.x) * (line0.p1.y - line0.p0.y);
    if (det === 0) {
      return false;
    } else {
      lambda = ((line1.p1.y - line1.p0.y) * (line1.p1.x - line0.p0.x) + (line1.p0.x - line1.p1.x) * (line1.p1.y - line0.p0.y)) / det;
      gamma = ((line0.p0.y - line0.p1.y) * (line1.p1.x - line0.p0.x) + (line0.p1.x - line0.p0.x) * (line1.p1.y - line0.p0.y)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  }
  public static getRectSides(rect: Rect): Line[] {
    return [
      /* top side */
      { p0: {x: rect.x, y: rect.y},                             p1: {x: rect.x + rect.width, y: rect.y}               },
      /* right side */
      { p0: {x: rect.x + rect.width, y: rect.y},                p1: {x: rect.x + rect.width, y: rect.y + rect.height} },
      /* bottom side */
      { p0: {x: rect.x + rect.width, y: rect.y + rect.height},  p1: {x: rect.x, y: rect.y + rect.height}              },
      /* left side */
      { p0: {x: rect.x, y: rect.y + rect.height},               p1: {x: rect.x, y: rect.y}                            }
    ];
  }
  /**
   * check if polygon created by points, intersects rectangle
   * @param points points of shape
   * @param rect rectangle, to calculate intersection
   * @param closedShape if shape is closed, calculate intersection as polygon, otherwise as polyline
   * */
  public static pointsIntersectingRect(points: Point[], rect: Rect, closedShape: boolean = true): boolean {
    let rectSides = ElementView.getRectSides(rect);
    for (let i = 0; i < points.length; i++) {
      if (ElementView.pointInRect(points[i], rect)) {
        /* if some point in rect, then element is intersected with rect */
        return true;
      }

      let next;

      if (closedShape) {
        next = i + 1 != points.length ? i + 1 : 0;
      } else if (i + 1 == points.length) { /* 'i' is last point index */
        /* if last point is not in rect, then element is not intersected with rect */
        break; /* ends loop to return false */
      } else { /* closedShape is false, and 'i' is not last point index */
        next = i + 1;
      }

      let line = {p0: points[i], p1: points[next]};
      for (let side of rectSides) {
        if (ElementView.linesIntersect(line, side)) {
          return true;
        }
      }
    }
    return false;
  }

  public intersectsRect(rect: Rect): boolean {
    let points = this.visiblePoints;
    return ElementView.pointsIntersectingRect(points, rect);
  }

  public abstract __onFocus__(): void;
  public abstract __onBlur__(): void;

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

  public abstract __correct__(refPoint: Point, lastRefPoint: Point): void;
  public __getCorrectionDelta__(refPoint: Point, lastRefPoint: Point) {
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

  public get angle(): number {
    return this._angle;
  }
  public __rotate__(angle: number): void {
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

  public __remove__() {
    this.svgElement.parentElement?.removeChild(this.svgElement);
  }

  public get selectable(): boolean {
    return this._selectable;
  }
  public set selectable(selectable: boolean) {
    this._selectable = selectable;
    if (selectable) {
      this._container.__setElementCursor__(this);
    } else {
      this._container.__setElementCursor__(this, Cursor.NO_TOOL);
    }
  }

  public __highlight__(): void {
    if (!this._container.selectTool.isOn() || !this._selectable) {
      return;
    }
    if (this._group && this._group._selectable) { /* if in group and selectable */
      this._group.SVG.style.filter = "drop-shadow(0px 0px 5px rgb(0 0 0 / 1))";
    } else{
      this.svgElement.style.filter = "drop-shadow(0px 0px 5px rgb(0 0 0 / 1))";
    }
  }
  public __lowlight__(): void {
    if (this._group) { /* if in group */
      this._group.SVG.style.filter = "unset";
    } else{
      this.svgElement.style.filter = "unset";
    }
  }

  public __fixRect__(): void {
    this._lastRect = Object.assign({}, this._rect);
  }
  public __fixAngle__(): void {
    this.___lastAngle__ = this._angle;
  }

  public get __lastRect__(): Rect {
    return this._lastRect;
  }
  public get __lastAngle__(): number {
    return this.___lastAngle__;
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
    this.__fixRect__();
    this.__setRect__(json.rect);
    this.__rotate__(json.angle);
    this.refPoint = json.refPoint;
  };
}
