import {CartesianView} from "./CartesianView";
import {ElementCursor, ElementProperties, ElementStyle} from "../../ElementView";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {PathView} from "../../shape/path/PathView";
import {Point} from "../../../model/Point";
import {Container} from "../../../Container";
import {Rect} from "../../../model/Rect";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {RayView} from "./RayView";

export class NumberLineCursor extends ElementCursor {}

export class NumberLineStyle extends ElementStyle {
  protected override element: NumberLineView;

  public constructor(element: NumberLineView) {
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

  }

  public override get fontColor(): string {
    return super.fontColor;
  }
  public override set fontColor(color: string) {
    super.fontColor = color;

  }

  public override get backgroundColor(): string {
    return super.backgroundColor;
  }
  public override set backgroundColor(color: string)  {
    super.backgroundColor = color;

  }
}

export interface NumberLineProperties extends ElementProperties {}

export class NumberLineView extends CartesianView implements MoveDrawable {
  protected override _type: ElementType = ElementType.NUMBER_LINE;
  public override readonly style: NumberLineStyle;

  /* Model */
  private _negativeAxis: RayView;
  private _positiveAxis: RayView;
  public override rotatable: boolean = false;

  private _zoomFactor = 1;
  /* Model */

  private readonly X_AXIS_COLOR = "#0000FF";

  /**
   * @param container Container element that should contain this ElementView
   * @param properties Simple object for element modification before creating {setOverEvent: boolean, setDefaultStyle: boolean}
   * @param rect this element bounding box size
   * @param ownerId This element owner id. if not set, will get owner id of Container
   * @param index This element index. If not set, will generate new numerical value
   * */
  public constructor(container: Container,
                     properties: NumberLineProperties = {},
                     rect: Rect = {x: 0, y: 0, width: 1, height: 1},
                     ownerId?: string,
                     index?: number
  ) {
    super(container, properties, rect, ownerId, index);
    this.svgElement.id = this.id;
    this.style = new NumberLineStyle(this);

    this._negativeAxis = new RayView(container,
      {overEvent: false, globalStyle: false},
      {numbersDirection: -1, showZero: true},
      {x: this._origin.x, y: this._origin.y},
      {x: 0, y: this._origin.y}
    );
    this._negativeAxis.style.strokeColor = this.X_AXIS_COLOR;
    this._negativeAxis.style.strokeWidth = this.AXIS_WIDTH;
    this._negativeAxis.style.fontColor = this.X_AXIS_COLOR;
    this._negativeAxis.style.fontSize = this.NUMBER_FONT_SIZE;
    this._negativeAxis.style.fillColor = "none";

    this._positiveAxis = new RayView(container,
      {overEvent: false, globalStyle: false},
      {numbersDirection: 1},
      {x: this._origin.x, y: this._origin.y},
      {x: this._rect.width, y: this._origin.y}
    );
    this._positiveAxis.style.strokeColor = this.X_AXIS_COLOR;
    this._positiveAxis.style.strokeWidth = this.AXIS_WIDTH;
    this._positiveAxis.style.fontColor = this.X_AXIS_COLOR;
    this._positiveAxis.style.fontSize = this.NUMBER_FONT_SIZE;
    this._positiveAxis.style.fillColor = "none";

    this._axisGroup.appendChild(this._negativeAxis.SVG);
    this._axisGroup.appendChild(this._positiveAxis.SVG);

    this.__updateView__();
    this.setProperties(properties);
  }

  public __updateView__(): void {
    this._backgroundView.__drawSize__({x: 0, y: 0, width: this._rect.width, height: this._rect.height});
    this._negativeAxis.__updateView__();
    this._positiveAxis.__updateView__();

    this.setAttr({
      x: this._rect.x,
      y: this._rect.y,
      width: this._rect.width,
      height: this._rect.height
    });
  }

  protected override reassignAxis() {
    this._negativeAxis.setPoints(
      {x: this._origin.x, y: this._origin.y},
      {x: 0, y: this._origin.y}
    );
    this._positiveAxis.setPoints(
      {x: this._origin.x, y: this._origin.y},
      {x: this._rect.width, y: this._origin.y}
    );
  }

  public override get points(): Point[] {
    let points = super.points;
    points.push(this.center)
    return points;
  }

  override __translate__(delta: Point) {
    this.__drag__(delta);
  }
  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.setAttr({
      x: this._lastRect.x + delta.x,
      y: this._lastRect.y + delta.y
    });
  }

  public __moveOrigin__(delta: Point): void {
    this._origin.x = this._lastOrigin.x + delta.x;
    this.reassignAxis();
    this.__updateView__();
  }

  public moveOrigin(delta: Point): void {
    this.__fixRect__();
    this.__moveOrigin__(delta);
  }

  public zoomIn(factor: number) {
    this._negativeAxis.zoomIn(factor);
    this._positiveAxis.zoomIn(factor);
  }
  public zoomOut(factor: number) {
    this._negativeAxis.zoomOut(factor);
    this._positiveAxis.zoomOut(factor);
  }

  public __drawSize__(rect: Rect) {
    if (rect.width < 0) {
      rect.width = -rect.width;
      rect.x -= rect.width;
    }
    if (rect.height < 0) {
      rect.height = -rect.height;
      rect.y -= rect.height;
    }

    this._rect = rect;
    this._origin = {
      x: rect.width / 2,
      y: rect.height / 2
    }

    this.reassignAxis();

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
    this._origin.x = this._lastOrigin.x - (this._rect.x - this._lastRect.x);
    this._origin.y = this._rect.height / 2;

    this.reassignAxis();

    this.__updateView__();
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point) {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;
    this.__drag__(delta);
  }

  public override __fixRect__() {
    super.__fixRect__();
    this._lastOrigin = Object.assign({}, this._origin);
  }

  public isComplete(): boolean {
    return this._rect.width >= 50 && this._rect.height >= 30;
  }

  public toPath(): PathView {
    let pathView = new PathView(this._container, this._properties);
    pathView.addPath(this._negativeAxis.toPath().path);
    pathView.addPath(this._positiveAxis.toPath().path);
    return pathView;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json.origin = this._origin;
    json.zoomFactor = this._zoomFactor;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this._origin = json.origin;
    this.zoomIn(json.zoomFactor);
    this.__updateView__();
  };
}
