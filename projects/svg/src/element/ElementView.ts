import {Point} from '../model/Point';
import {Resizeable} from '../service/edit/resize/Resizeable';
import {Rect} from '../model/Rect';
import {Draggable} from '../service/tool/drag/Draggable';
import {Matrix} from '../service/math/Matrix';
import {Container} from '../Container';
import {PathView} from './shape/path/PathView';
import {GroupView} from './group/GroupView';
import {Style} from '../service/style/Style';
import {ElementType} from '../dataSource/constant/ElementType';
import {Cursor} from '../dataSource/constant/Cursor';
import {Line} from '../model/Line';
import {Drawable} from '../service/tool/draw/type/Drawable';

export class ElementCursor {
  public cursor: any = {};
  constructor() {
    this.cursor[Cursor.NO_TOOL] = 'default';
    this.cursor[Cursor.SELECT] = 'move';
    this.cursor[Cursor.EDIT_NODE] = 'default';
    this.cursor[Cursor.EDIT_TABLE] = 'default';
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
    this.element.setAttr({'stroke-width': width});
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    super.strokeDashArray = array;
    this.element.setAttr({'stroke-dasharray': array});
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    super.strokeColor = color;
    this.element.setAttr({stroke: color});
  }

  public override get fillColor(): string {
    return super.fillColor;
  }
  public override set fillColor(color: string) {
    super.fillColor = color;
    this.element.setAttr({fill: color});
  }

  public override get fontSize(): string {
    return super.fontSize;
  }
  public override set fontSize(size: string) {
    super.fontSize = size;
    this.element.HTML.style.fontSize = size + 'px';
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

  public setGlobalStyle(): void {
    const style: Style = this.element.container.style;
    this.strokeWidth = style.strokeWidth;
    this.strokeDashArray = style.strokeDashArray;
    this.strokeColor = style.strokeColor;
    this.fillColor = style.fillColor;
    this.fontSize = style.fontSize;
    this.fontColor = style.fontColor;
    this.backgroundColor = style.backgroundColor;
  }
}

export interface ElementProperties {
  overEvent?: boolean;
  globalStyle?: boolean;
}

export abstract class ElementView implements Resizeable, Draggable, Drawable {
  public static readonly svgURI: 'http://www.w3.org/2000/svg' = 'http://www.w3.org/2000/svg';
  protected abstract svgElement: SVGElement;

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
  protected _lastAngle: number = 0;
  protected _lastRefPoint: Point = {x: 0, y: 0};
  protected _selectable: boolean = true;
  protected _properties: ElementProperties = {};
  public rotatable: boolean = true;
  public erasable: boolean = true;
  public proportionalResizable: boolean = false;
  /* Model */

  private _highlight: () => void = this.__highlight__.bind(this);
  private _lowlight: () => void = this.__lowlight__.bind(this);

  /**
   * @param container Container element that should contain this ElementView
   * @param ownerId This element owner id. if not set, will get owner id of Container
   * @param index This element index. If not set, will generate new numerical value
   * */
  public constructor(container: Container, ownerId?: string, index?: number) {
    this._container = container;

    /**
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
      throw Error('Missing id argument: ownerId{ ' + ownerId + ' }, index{ ' + index + ' }');
    }
  }

  public get properties(): ElementProperties {
    return this._properties;
  }
  public setProperties(properties: ElementProperties): void {
    this._properties = Object.assign({}, properties);
    this._properties.globalStyle = undefined; /* global style property should be set only in creation time */
    if (properties.overEvent) {
      this.setOverEvent();
    } else {
      this.removeOverEvent();
    }
    if (properties.globalStyle) {
      try {
        this.style.setGlobalStyle();
      } catch (e) {}
    }
  }

  public __translate__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this._refPoint.x = this._lastRefPoint.x + delta.x;
    this._refPoint.y = this._lastRefPoint.y + delta.y;
    this.svgElement.style.transform =
      'translate(' + delta.x + 'px, ' + delta.y + 'px) rotate(' + this._angle + 'deg)';
  }
  public abstract __drag__(delta: Point): void;
  public getVisibleRotatedRect(angle: number = 0): Rect {
    return ElementView.calculateRotatedRect(this.visiblePoints, this.center, angle);
  }
  public getVisibleRect(): Rect {
    return ElementView.calculateRect(this.visiblePoints);
  };
  public getVisibleRectPoints(): Point[] {
    const points: Point[] = Object.assign([], this.points);

    return Matrix.rotate(
      points,
      this._refPoint,
      -this._angle
    );
  }
  public getRect(): Rect {
    return {
      x: this._rect.x,
      y: this._rect.y,
      width: this._rect.width,
      height: this._rect.height,
    };
  };
  /**
   * change element size
   * rect x,y is reference point
   * rect width,height is new size of element
   * */
  public __setRect__(rect: Rect): void {
    rect = ElementView.normalizeRect(rect);

    this._rect = rect;
    this.__updateView__();
  }
  public setRect(rect: Rect): void {
    this.__fixRect__();
    this.__fixRefPoint__();
    this.__setRect__(rect);
  }

  public static normalizeRect(rect: Rect): Rect {
    if (rect.width < 0) {
      rect.width = -rect.width;
      rect.x -= rect.width;
    }
    if (rect.height < 0) {
      rect.height = -rect.height;
      rect.y -= rect.height;
    }

    return rect;
  }
  public static rectToSquare(rect: Rect): Rect {
    const averageSize: number = (Math.abs(rect.width) + Math.abs(rect.height)) / 2;
    if (rect.width < 0) {
      rect.width = -averageSize;
    } else {
      rect.width = averageSize;
    }
    if (rect.height < 0) {
      rect.height = -averageSize;
    } else {
      rect.height = averageSize;
    }
    return rect;
  }

  public abstract __updateView__(): void;
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
  public get copy(): ElementView {
    return this._container.createElementFromJSON(
      JSON.parse(
        JSON.stringify(this.toJSON())
      )
    );
  };
  public abstract isComplete(): boolean;

  /**
   * check if rect1 fully inside rect2
   *
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
  public static pointInLine(point: Point, line: Line): boolean {
    const crossProduct: number = (point.y - line.p0.y) * (line.p1.x - line.p0.x) - (point.x - line.p0.x) * (line.p1.y - line.p0.y);
    if (Math.abs(crossProduct) > Number.EPSILON) {
      return false;
    }

    const dotProduct: number = (point.x - line.p0.x) * (line.p1.x - line.p0.x) + (point.y - line.p0.y) * (line.p1.y - line.p0.y);

    if (dotProduct < 0) {
      return false;
    }

    const lineSquareLength: number = (line.p1.x - line.p0.x) * (line.p1.x - line.p0.x) + (line.p1.y - line.p0.y) * (line.p1.y - line.p0.y);

    return dotProduct <= lineSquareLength;
  }
  public static linesIntersect(line0: Line, line1: Line): boolean {
    /* returns false if lines are overlap */
    let gamma: number; let lambda: number;
    const det: number = (line0.p1.x - line0.p0.x) * (line1.p1.y - line1.p0.y) - (line1.p1.x - line1.p0.x) * (line0.p1.y - line0.p0.y);
    if (det === 0) {
      return false;
    } else {
      lambda = ((line1.p1.y - line1.p0.y) * (line1.p1.x - line0.p0.x) + (line1.p0.x - line1.p1.x) * (line1.p1.y - line0.p0.y)) / det;
      gamma = ((line0.p0.y - line0.p1.y) * (line1.p1.x - line0.p0.x) + (line0.p1.x - line0.p0.x) * (line1.p1.y - line0.p0.y)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  }
  public static linesIntersectionPoint(line0: Line, line1: Line): Point | null {
    /* Check if none of the lines are of length 0 */
    if ((line0.p0.x === line0.p1.x && line0.p0.y === line0.p1.y) || (line1.p0.x === line1.p1.x && line1.p0.y === line1.p1.y)) {
      return null;
    }

    const denominator: number = ((line1.p1.y - line1.p0.y) * (line0.p1.x - line0.p0.x) - (line1.p1.x - line1.p0.x) * (line0.p1.y - line0.p0.y));

    /* Lines are parallel */
    if (denominator === 0) {
      return null;
    }

    const ua: number = ((line1.p1.x - line1.p0.x) * (line0.p0.y - line1.p0.y) - (line1.p1.y - line1.p0.y) * (line0.p0.x - line1.p0.x)) / denominator;
    const ub: number = ((line0.p1.x - line0.p0.x) * (line0.p0.y - line1.p0.y) - (line0.p1.y - line0.p0.y) * (line0.p0.x - line1.p0.x)) / denominator;

    /* is the intersection along the segments */
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return null;
    }

    return {
      x: line0.p0.x + ua * (line0.p1.x - line0.p0.x),
      y: line0.p0.y + ua * (line0.p1.y - line0.p0.y)
    };
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
  public static pointDistanceFromSegment(point: Point, line: Line): number {
    const A: number = point.x - line.p0.x;
    const B: number = point.y - line.p0.y;
    const C: number = line.p1.x - line.p0.x;
    const D: number = line.p1.y - line.p0.y;

    const dot: number = A * C + B * D;
    const squareLength: number = C * C + D * D;
    let param: number = -1;
    if (squareLength !== 0) {
      param = dot / squareLength;
    }

    let xx: number;
    let yy: number;

    if (param < 0) {
      xx = line.p0.x;
      yy = line.p0.y;
    } else if (param > 1) {
      xx = line.p1.x;
      yy = line.p1.y;
    } else {
      xx = line.p0.x + param * C;
      yy = line.p0.y + param * D;
    }

    const dx: number = point.x - xx;
    const dy: number = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }


  /**
   * check if polygon created by points, intersects some lines
   *
   * @param points points of shape
   * @param sides sides, to calculate intersection
   * @param closedShape if shape is closed, calculate intersection as polygon, otherwise as polyline
   * */
  public static pointsIntersectingSides(points: Point[], sides: Line[], closedShape: boolean = true): boolean {
    for (let i: number = 0; i < points.length; i++) {
      let next: number;

      if (closedShape) {
        next = i + 1 !== points.length ? i + 1 : 0;
      } else if (i + 1 === points.length) { /* 'i' is last point index */
        /* if last point is not in rect, then element is not intersected with rect */
        break; /* ends loop to return false */
      } else { /* closedShape is false, and 'i' is not last point index */
        next = i + 1;
      }

      const line: Line = {p0: points[i], p1: points[next]};
      for (const side of sides) {
        if (ElementView.linesIntersect(line, side)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * check if polygon created by points, intersects rectangle
   *
   * @param points points of shape
   * @param rect rectangle, to calculate intersection
   * @param closedShape if shape is closed, calculate intersection as polygon, otherwise as polyline
   * */
  public static pointsIntersectingRect(points: Point[], rect: Rect, closedShape: boolean = true): boolean {
    let pointInRect: boolean = false;
    /* if some point in rect, then element is intersected with rect */
    for (const point of points) {
      if (ElementView.pointInRect(point, rect)) {
        pointInRect = true;
        break;
      }
    }
    const rectSides: Line[] = ElementView.getRectSides(rect);
    return pointInRect || ElementView.pointsIntersectingSides(points, rectSides, closedShape);
  }

  /**
   * check if this element intersects with given rect
   * */
  public intersectsRect(rect: Rect): boolean {
    const points: Point[] = this.visiblePoints;
    return ElementView.pointsIntersectingRect(points, rect);
  }
  public intersectsLine(line: Line): boolean {
    const points: Point[] = this.visiblePoints;
    return ElementView.pointsIntersectingSides(points, [line]);
  }

  public abstract __onFocus__(): void;
  public abstract __onBlur__(): void;

  public get type(): ElementType {
    return this._type;
  }

  public static parseId(id: string): {ownerId: string; index: number} | null {
    const idArray: string[] = id.split(/(_u|_e)+/);
    const ownerId: string = idArray[2];
    const index: number = parseInt(idArray[4]);

    if (!ownerId || !index) {
      return null;
    }

    return {
      ownerId,
      index
    };
  }
  public get id(): string {
    return this._container.idPrefix + '_u' + this._ownerId + '_e' + this._index;
  }
  public setId(ownerId: string, index: number): void {
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

  public __correct__(refPoint: Point, lastRefPoint: Point): void {
    const delta: Point = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x === 0 && delta.y === 0) {return;}

    this._rect.x = this._rect.x + delta.x;
    this._rect.y = this._rect.y + delta.y;

    this.__updateView__();
  }
  public __getCorrectionDelta__(refPoint: Point, lastRefPoint: Point): Point {
    /* calculate delta */
    const rotatedRefPoint: Point = Matrix.rotate(
      [{x: lastRefPoint.x, y: lastRefPoint.y}],
      {x: refPoint.x, y: refPoint.y},
      this._angle
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
    if (points.length === 0) {
      return {x: 0, y: 0, width: 0, height: 0};
    }
    let minX: number = points[0].x;
    let minY: number = points[0].y;
    let maxX: number = points[0].x;
    let maxY: number = points[0].y;

    for (let i: number = 1; i < points.length; i++) {
      if (points[i].x < minX) {
        minX = points[i].x;
      }
      if (points[i].y < minY) {
        minY = points[i].y;
      }

      if (points[i].x > maxX) {
        maxX = points[i].x;
      }
      if (points[i].y > maxY) {
        maxY = points[i].y;
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  protected calculateRectByNewPoint(point: Point): Rect {
    const position: Rect = this._rect;
    const size: Rect = this._rect;

    if (point.x < position.x) {
      position.width += position.x - point.x;
      position.x = point.x;
    } else if (point.x > position.x + size.width) {
      size.width = point.x - position.x;
    }

    if (point.y < position.y) {
      position.height += position.y - point.y;
      position.y = point.y;
    } else if (point.y > position.y + size.height) {
      size.height = point.y - position.y;
    }

    return {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    };
  }

  public static calculateRotatedRect(points: Point[], refPoint: Point, angle: number = 0): Rect {
    points = Matrix.rotate(
      points,
      refPoint,
      -angle
    );

    return ElementView.calculateRect(points);
  }

  public get center(): Point {
    const center: Point = {
      x: this._rect.x + this._rect.width / 2,
      y: this._rect.y + this._rect.height / 2
    };
    if (this._angle === 0) {
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
    this.svgElement.style.transformOrigin = refPoint.x + 'px ' + refPoint.y + 'px';
    this._refPoint = refPoint;
  }

  public get angle(): number {
    return this._angle;
  }
  public __rotate__(angle: number): void {
    this.svgElement.style.transform = 'rotate(' + angle + 'deg)';
    this._angle = angle;
  }

  public get SVG(): SVGElement {
    return this.svgElement;
  }
  public set SVG(svgElement: SVGElement) {
    this.svgElement = svgElement;
  }
  public get HTML(): SVGElement | HTMLElement {
    return this.svgElement;
  }

  public getAttr(attribute: string): string {
    const value: string | null = this.SVG.getAttribute(attribute);
    if (!value) {
      return '0';
    }
    return value;
  }
  public setAttr(attributes: object, SVG?: SVGElement): void {
    for (const [key, value] of Object.entries(attributes)) {
      if (SVG) {
        SVG.setAttribute(key, '' + value);
      } else {
        this.SVG.setAttribute(key, '' + value);
      }
    }
  }
  public delAttr(attributes: string[], SVG?: HTMLElement): void {
    for (const attribute of attributes) {
      if (SVG) {
        SVG.removeAttribute(attribute);
      } else {
        this.SVG.removeAttribute(attribute);
      }
    }
  }

  public set cursor(cursor: string) {
    this.svgElement.style.cursor = cursor;
  }

  public setOverEvent(): void {
    this.svgElement.addEventListener('mouseover', this._highlight);
    this.svgElement.addEventListener('mouseout', this._lowlight);
    this._properties.overEvent = true;
  }
  public removeOverEvent(): void {
    this.svgElement.removeEventListener('mouseover', this._highlight);
    this.svgElement.removeEventListener('mouseout', this._lowlight);
    this._properties.overEvent = false;
  }

  public __remove__(): void {
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
    if (!this._container.tools.selectTool.isOn() || !this._selectable) {
      return;
    }
    if (this._group && this._group._selectable) { /* if in group and selectable */
      this._group.SVG.style.filter = 'drop-shadow(0px 0px 5px rgb(0 0 0 / 1))';
    } else{
      this.svgElement.style.filter = 'drop-shadow(0px 0px 5px rgb(0 0 0 / 1))';
    }
  }
  public __lowlight__(): void {
    if (this._group) { /* if in group */
      this._group.SVG.style.filter = 'unset';
    } else{
      this.svgElement.style.filter = 'unset';
    }
  }

  public __fixRect__(): void {
    this._lastRect = Object.assign({}, this._rect);
  }
  public __fixAngle__(): void {
    this._lastAngle = this._angle;
  }
  public __fixRefPoint__(): void {
    this._lastRefPoint = Object.assign({}, this._refPoint);
  }

  public get __lastRect__(): Rect {
    return this._lastRect;
  }
  public get __lastAngle__(): number {
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
      properties: this._properties,
      rotatable: this.rotatable
    };
  }
  public fromJSON(json: any): void {
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
    this.setProperties(json.properties);
    this.rotatable = json.rotatable;
  };
}
