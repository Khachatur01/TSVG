import {Rect} from "../../../model/Rect";
import {Point} from "../../../model/Point";
import {PathView} from "../../shape/path/PathView";
import {ElementCursor, ElementProperties, ElementStyle, ElementView} from "../../ElementView";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {Container} from "../../../Container";
import {CartesianView, ScaleProperties} from "./CartesianView";
import {RayView} from "./RayView";
import {GraphicView} from "./GraphicView";
import {Style} from "../../../service/style/Style";

export class CoordinatePlaneStyle extends ElementStyle {
  protected override element: CoordinatePlaneView;

  public constructor(element: CoordinatePlaneView) {
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

export class CoordinatePlaneCursor extends ElementCursor {}

export interface CoordinatePlaneProperties extends ElementProperties {}

export class CoordinatePlaneView extends CartesianView implements MoveDrawable {
  protected override _type: ElementType = ElementType.COORDINATE_PLANE;
  public override readonly style: CoordinatePlaneStyle;

  /* Model */
  private _negativeXAxis: RayView;
  private _positiveXAxis: RayView;
  private _negativeYAxis: RayView;
  private _positiveYAxis: RayView;
  private _graphics: GraphicView[] = [];
  private readonly _graphicGroup: SVGGElement;
  public override rotatable: boolean = false;

  private readonly X_AXIS_COLOR = "#0000FF";
  private readonly Y_AXIS_COLOR = "#FF0000";

  private _zoomFactor = 1;
  private _scaleProperties: ScaleProperties = {
    mainStep: 1,
    mainStepPhysicalUnit: 60,
    mainStepMultiplier: 10,
    physicalUnitLimits: {
      min: 60,
      max: 120
    }
  };
  /* Model */

  /**
   * @param container Container element that should contain this ElementView
   * @param properties Simple object for element modification before creating {setOverEvent: boolean, setDefaultStyle: boolean}
   * @param rect this element bounding box size
   * @param origin this element origin point relative to coordinate plane
   * @param ownerId This element owner id. if not set, will get owner id of Container
   * @param index This element index. If not set, will generate new numerical value
   * */
  public constructor(container: Container,
                     properties: CoordinatePlaneProperties = {},
                     rect: Rect = {x: 0, y: 0, width: 1, height: 1},
                     origin: Point = {x: 0, y: 0},
                     ownerId?: string,
                     index?: number
  ) {
    super(container, properties, rect, ownerId, index);
    this.svgElement.id = this.id;
    this._rect = rect;
    this._origin = origin;
    this.style = new CoordinatePlaneStyle(this);

    this._graphicGroup = document.createElementNS(ElementView.svgURI, "g");
    this._graphicGroup.id = "graphic";

    this._negativeXAxis = new RayView(container,
      {overEvent: false, globalStyle: false},
      {numbersDirection: -1, showZero: true},
      {x: this._origin.x, y: this._origin.y},
      {x: 0, y: this._origin.y},
      this._scaleProperties
    );
    this._negativeXAxis.style.strokeColor = this.X_AXIS_COLOR;
    this._negativeXAxis.style.strokeWidth = this.AXIS_WIDTH;
    this._negativeXAxis.style.fontColor = this.X_AXIS_COLOR;
    this._negativeXAxis.style.fontSize = this.NUMBER_FONT_SIZE;
    this._negativeXAxis.style.fillColor = "none";

    this._positiveXAxis = new RayView(container,
      {overEvent: false, globalStyle: false},
      {numbersDirection: 1},
      {x: this._origin.x, y: this._origin.y},
      {x: this._rect.width, y: this._origin.y},
      this._scaleProperties
    );
    this._positiveXAxis.style.strokeColor = this.X_AXIS_COLOR;
    this._positiveXAxis.style.strokeWidth = this.AXIS_WIDTH;
    this._positiveXAxis.style.fontColor = this.X_AXIS_COLOR;
    this._positiveXAxis.style.fontSize = this.NUMBER_FONT_SIZE;
    this._positiveXAxis.style.fillColor = "none";

    this._negativeYAxis = new RayView(container,
      {overEvent: false, globalStyle: false},
      {numbersDirection: -1},
      {x: this._origin.x, y: this._origin.y},
      {x: this._origin.x, y: this._rect.height},
      this._scaleProperties
    );
    this._negativeYAxis.style.strokeColor = this.Y_AXIS_COLOR;
    this._negativeYAxis.style.strokeWidth = this.AXIS_WIDTH;
    this._negativeYAxis.style.fontColor = this.Y_AXIS_COLOR;
    this._negativeYAxis.style.fontSize = this.NUMBER_FONT_SIZE;
    this._negativeYAxis.style.fillColor = "none";

    this._positiveYAxis = new RayView(container,
      {overEvent: false, globalStyle: false},
      {numbersDirection: 1},
      {x: this._origin.x, y: this._origin.y},
      {x: this._origin.x, y: 0},
      this._scaleProperties
    );
    this._positiveYAxis.style.strokeColor = this.Y_AXIS_COLOR;
    this._positiveYAxis.style.strokeWidth = this.AXIS_WIDTH;
    this._positiveYAxis.style.fontColor = this.Y_AXIS_COLOR;
    this._positiveYAxis.style.fontSize = this.NUMBER_FONT_SIZE;
    this._positiveYAxis.style.fillColor = "none";

    this._axisGroup.appendChild(this._negativeXAxis.SVG);
    this._axisGroup.appendChild(this._positiveXAxis.SVG);
    this._axisGroup.appendChild(this._negativeYAxis.SVG);
    this._axisGroup.appendChild(this._positiveYAxis.SVG);

    this.svgElement.appendChild(this._graphicGroup);

    this.__updateView__();

    this.setProperties(properties);
  }

  public __updateView__(): void {
    this._backgroundView.__drawSize__({x: 0, y: 0, width: this._rect.width, height: this._rect.height});
    this._negativeXAxis.__updateView__();
    this._positiveXAxis.__updateView__();
    this._negativeYAxis.__updateView__();
    this._positiveYAxis.__updateView__();

    this._graphics.forEach(graphic => {
      graphic.__updateView__();
    });

    this.setAttr({
      x: this._rect.x,
      y: this._rect.y,
      width: this._rect.width,
      height: this._rect.height
    });
  }
  protected override reassignAxis() {
    this._negativeXAxis.setPoints(
      {x: this._origin.x, y: this._origin.y},
      {x: 0, y: this._origin.y}
    );
    this._positiveXAxis.setPoints(
      {x: this._origin.x, y: this._origin.y},
      {x: this._rect.width, y: this._origin.y}
    );
    this._negativeYAxis.setPoints(
      {x: this._origin.x, y: this._origin.y},
      {x: this._origin.x, y: this._rect.height}
    );
    this._positiveYAxis.setPoints(
      {x: this._origin.x, y: this._origin.y},
      {x: this._origin.x, y: 0}
    );
  }
  public get graphics(): GraphicView[] {
    return this._graphics;
  }
  public get functions(): Function[] {
    let functions: Function[] = [];
    this._graphics.forEach(graphic => {
      functions.push(graphic.f);
    });
    return functions;
  }
  public addFunction(f: Function, style: Style) {
    let graphicView = new GraphicView(
      this._container,
      {overEvent: true, globalStyle: false},
      {x: 0, y: 0, width: this._rect.width, height: this._rect.height},
      Object.assign({}, this._origin),
      f,
      this._scaleProperties
    );

    graphicView.style.set = style;

    this._graphics.push(graphicView);
    this._graphicGroup.appendChild(graphicView.SVG);
  }
  public removeFunction(f: Function) {
    this._graphics.forEach(graphic => {
      if (graphic.f === f) {
        this._graphicGroup.removeChild(graphic.SVG);
        this._graphics.splice(this._graphics.indexOf(graphic), 1);
      }
    })
  }

  public override get points(): Point[] {
    let points = super.points;
    let realCenter: Point = {
      x: this._origin.x + this._rect.x,
      y: this._origin.y + this._rect.y,
    }
    points.push(realCenter);
    return points;
  }

  public override __translate__(delta: Point) {
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

  public zoomIn(factor: number) {
    this._zoomFactor *= factor;
    this._graphics.forEach(graphic => {
      graphic.zoomIn(factor);
    });
    this._negativeXAxis.zoomIn(factor);
    this._positiveXAxis.zoomIn(factor);
    this._negativeYAxis.zoomIn(factor);
    this._positiveYAxis.zoomIn(factor);
  }
  public zoomOut(factor: number) {
    this._zoomFactor /= factor;
    this._graphics.forEach(graphic => {
      graphic.zoomOut(factor);
    });
    this._negativeXAxis.zoomOut(factor);
    this._positiveXAxis.zoomOut(factor);
    this._negativeYAxis.zoomOut(factor);
    this._positiveYAxis.zoomOut(factor);
  }
  public __moveOrigin__(delta: Point): void {
    this._origin.x = this._lastOrigin.x + delta.x;
    this._origin.y = this._lastOrigin.y + delta.y;

    this._graphics.forEach(graphic => {
      graphic.__moveOrigin__(delta);
    });
    this.reassignAxis();

    this.__updateView__();
  }
  public moveOrigin(delta: Point): void {
    this.__fixRect__();
    this.__moveOrigin__(delta);
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
    };

    this._graphics.forEach(graphic => {
      graphic.__drawSize__({x: 0, y: 0, width: rect.width, height: rect.height});
    })
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
    this._origin.y = this._lastOrigin.y - (this._rect.y - this._lastRect.y);

    this._graphics.forEach(graphic => {
      graphic.__setRectSilent__({x: 0, y: 0, width: rect.width, height: rect.height});
      graphic.__moveOrigin__({
        x: -(this._rect.x - this._lastRect.x),
        y: -(this._rect.y - this._lastRect.y)
      });
    })
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
    this._graphics.forEach(graphic => {
      graphic.__fixRect__();
    });
    this._negativeXAxis.__fixRect__();
    this._positiveXAxis.__fixRect__();
    this._negativeYAxis.__fixRect__();
    this._positiveYAxis.__fixRect__();
    this._lastOrigin = Object.assign({}, this._origin);
  }

  public isComplete(): boolean {
    return this._rect.width >= 50 && this._rect.height >= 30;
  }

  public toPath(): PathView {
    let pathView = new PathView(this._container, this._properties);
    this._graphics.forEach(graphic => {
      pathView.addPath(graphic.toPath().path);
    });
    pathView.addPath(this._negativeXAxis.toPath().path);
    pathView.addPath(this._positiveXAxis.toPath().path);
    pathView.addPath(this._negativeYAxis.toPath().path);
    pathView.addPath(this._positiveYAxis.toPath().path);
    return pathView;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json.graphics = [];
    this._graphics.forEach(graphic => {
      json.graphics.push({
        f: graphic.f.toString(),
        style: graphic.style
      });
    });
    json.origin = this._origin;
    json.zoomFactor = this._zoomFactor;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this._origin = json.origin;
    this.zoomIn(json.zoomFactor);

    this.reassignAxis();

    this._graphics = [];
    for (let graphic of json.graphics) {
      this.addFunction(eval(graphic.f), graphic.style);
    }
  };
}
