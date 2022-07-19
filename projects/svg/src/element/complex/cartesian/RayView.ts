import {ElementType} from "../../../dataSource/constant/ElementType";
import {Point} from "../../../model/Point";
import {Rect} from "../../../model/Rect";
import {ElementCursor, ElementProperties, ElementStyle, ElementView} from "../../ElementView";
import {PathView} from "../../shape/PathView";
import {ComplexView} from "../../type/ComplexView";
import {Container} from "../../../Container";
import {Path} from "../../../model/path/Path";
import {MoveTo} from "../../../model/path/point/MoveTo";
import {LineTo} from "../../../model/path/line/LineTo";
import {Angle} from "../../../service/math/Angle";
import {Matrix} from "../../../service/math/Matrix";
import {TextView} from "../../foreign/text/TextView";
import {ClickDrawable} from "../../../service/tool/draw/type/ClickDrawable";

export class RayCursor extends ElementCursor {}

export class RayStyle extends ElementStyle {
  protected override element: RayView;

  public constructor(element: RayView) {
    super(element);
    this.element = element;
  }

  public override get strokeWidth(): string {
    return super.strokeWidth;
  }
  public override set strokeWidth(width: string) {
    super.strokeWidth = width;
    this.element.rayPathView.style.strokeWidth = width;
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    super.strokeDashArray = array;
    this.element.rayPathView.style.strokeDashArray = array;
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    super.strokeColor = color;
    this.element.rayPathView.style.strokeColor = color;
  }

  public override get fillColor(): string {
    return super.fillColor;
  }
  public override set fillColor(color: string) {
    super.fillColor = color;
    this.element.rayPathView.style.fillColor = color;
  }

  public override get fontSize(): string {
    return super.fontSize;
  }
  public override set fontSize(size: string) {
    super.fontSize = size;
    this.element.numbersGroup.style.fontSize = size;
  }

  public override get fontColor(): string {
    return super.fontColor;
  }
  public override set fontColor(color: string) {
    super.fontColor = color;
    this.element.numbersGroup.setAttribute("fill", color);
  }

  public override get backgroundColor(): string {
    return super.backgroundColor;
  }
  public override set backgroundColor(color: string)  {
    super.backgroundColor = color;
  }
}

export interface RayViewEffects {
  showSteps?: boolean;
  showNumbers?: boolean;
  showZero?: boolean;
  numbersDirection?: 1 | -1;
}

export class RayView extends ComplexView implements ClickDrawable {
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "g");
  protected _type: ElementType = ElementType.RAY;

  public override readonly style: RayStyle;

  private readonly _rayPathView: PathView;
  private readonly _numbersGroup: SVGGElement;

  private _viewEffects: RayViewEffects = {
    showSteps: true,
    showNumbers: true,
    showZero: false,
    numbersDirection: 1,
  };

  private _lastStartPoint: Point = {x: 0, y: 0};
  private _lastEndPoint: Point = {x: 0, y: 0};
  private _startPoint: Point = {x: 0, y: 0};
  private _endPoint: Point = {x: 0, y: 0};

  protected _mainStepDivisors: number[] = [1, 2, 4, 5];
  protected _currentDivisor = this._mainStepDivisors[0];
  protected readonly _limitMap: {[key: number]: {min: number, max: number}} = {};

  protected _physicalUnitLimits = {min: 60, max: 120};
  protected _mainStep: number = 1;
  protected _mainStepMultiplier: number = 10;

  protected _mainStepPhysicalUnit: number = 60; /* px - CHANGING on zoom */

  protected readonly STEP_VIEW_SIZE = 6;
  protected readonly SUB_STEP_VIEW_SIZE = 3;
  protected readonly SUB_STEPS_COUNT = 4;

  constructor(container: Container,
              properties: ElementProperties = {},
              viewEffects: RayViewEffects = {},
              startPoint: Point = {x: 0, y: 0},
              endPoint: Point = {x: 0, y: 0},
              ownerId?: string, index?: number) {

    super(container, ownerId, index);

    this.style = new RayStyle(this);
    this._startPoint = startPoint;
    this._endPoint = endPoint;
    this._rayPathView = new PathView(container, {overEvent: false, globalStyle: false});
    this._numbersGroup = document.createElementNS(ElementView.svgURI, "g");
    this._numbersGroup.setAttribute("stroke-width", "0");
    this._numbersGroup.id = "numbers";

    this.svgElement.appendChild(this._rayPathView.SVG);
    this.svgElement.appendChild(this._numbersGroup);

    this.setProperties(properties);
    this.viewEffects = viewEffects;
  }

  public getPoint(index: number): Point {
    if (index < 0) {
      index = 2 + index; /* 2 is points count */
    }
    if (index === 0) {
      return this._startPoint;
    } else if (index === 1) {
      return this._endPoint;
    } else {
      throw Error("No such point index");
    }
  }
  public pushPoint(point: Point): void {
    this._endPoint = point;
    this._rect = ElementView.calculateRect(this._rayPathView.points);
    this.__updateView__()
  }
  public removePoint(index: number): void {}
  public replacePoint(index: number, point: Point): void {
    if (index < 0) {
      index = 2 + index; /* 2 is points count */
    }
    if (index === 0) {
      this._startPoint = point;
    } else if (index === 1) {
      this._endPoint = point;
    } else {
      throw Error("No such point index");
    }
    this._rect = ElementView.calculateRect(this._rayPathView.points);
    this.__updateView__()
  }
  public setPoints(start: Point, end: Point): void {
    this._startPoint = start;
    this._endPoint = end;
    this._rect = ElementView.calculateRect(this._rayPathView.points);
    this.__updateView__();
  }

  public get rayPathView(): PathView {
    return this._rayPathView;
  }
  public get numbersGroup(): SVGGElement {
    return this._numbersGroup;
  }

  private isInRange(divisor: number): boolean {
    const physicalUnit = this._mainStepPhysicalUnit / divisor;
    return physicalUnit <= this._physicalUnitLimits.max && physicalUnit >= this._physicalUnitLimits.min;
  }

  public zoomIn(factor: number) {
    this._mainStepPhysicalUnit *= factor;

    while (this.isInRange(this._mainStepMultiplier)) {
      this._mainStep /= 10;
      this._mainStepPhysicalUnit /= 10;
    }
    this._currentDivisor = Math.max(...this._mainStepDivisors.filter(this.isInRange.bind(this)));

    this.__updateView__();
  }
  public zoomOut(factor: number) {
    this._mainStepPhysicalUnit /= factor;

    let filteredDivisors = this._mainStepDivisors.filter(this.isInRange.bind(this));
    while (filteredDivisors.length === 0) {
      this._mainStep *= 10;
      this._mainStepPhysicalUnit *= 10;
      filteredDivisors = this._mainStepDivisors.filter(this.isInRange.bind(this));
    }

    this._currentDivisor = Math.max(...filteredDivisors);

    this.__updateView__();
  }

  private createSubStepPath(physicalStep: number, physicalSubStep: number, startPoint: Point, angle: number): Path {
    let path: Path = new Path()
    for (let subStepLength = physicalSubStep; subStepLength < physicalStep; subStepLength += physicalSubStep) {
      let subStepPosition = Angle.lineFromVector(startPoint, angle, subStepLength);
      let points = [
        {x: subStepPosition.x, y: subStepPosition.y - this.SUB_STEP_VIEW_SIZE},
        {x: subStepPosition.x, y: subStepPosition.y + this.SUB_STEP_VIEW_SIZE}
      ]
      if (angle != 0 && angle != 360) {
        points = Matrix.rotate(points, subStepPosition, angle);
      }

      path.add(new MoveTo(points[0]));
      path.add(new LineTo(points[1]));
    }
    return path;
  }
  private createNumber(position: Point, number: number): TextView {
    let visibleNumber: any = Math.round(number * 100_000) / 100_000;
    if (visibleNumber != 0 && (Math.abs(visibleNumber) <= 0.0001 || Math.abs(visibleNumber) > 9_999)) {
      visibleNumber = number.toExponential(4);
    }

    return new TextView(this._container,
      {overEvent: false, globalStyle: false},
      {x: position.x + 3, y: position.y - 3, width: 0, height: 0},
      visibleNumber + "");
  }

  public __updateView__(): void {
    let path = new Path();
    path.add(new MoveTo(this._startPoint));
    path.add(new LineTo(this._endPoint));

    let angle = Angle.fromTwoPoints(this._startPoint, this._endPoint);
    const physicalStep = this._mainStepPhysicalUnit / this._currentDivisor;
    let physicalSubStep = physicalStep / this.SUB_STEPS_COUNT;
    let lineLength = Angle.lineLength(this._startPoint, this._endPoint);

    if (this._viewEffects.showSteps) {
      /* add sub steps before first step */
      path.addPath(this.createSubStepPath(physicalStep, physicalSubStep, this._startPoint, angle));
      for (let stepLength = physicalStep; stepLength < lineLength; stepLength += physicalStep) {
        let stepPosition = Angle.lineFromVector(this._startPoint, angle, stepLength);
        let points = [
          {x: stepPosition.x, y: stepPosition.y - this.STEP_VIEW_SIZE},
          {x: stepPosition.x, y: stepPosition.y + this.STEP_VIEW_SIZE}
        ]
        if (angle != 0 && angle != 360) {
          points = Matrix.rotate(points, stepPosition, angle);
        }

        path.add(new MoveTo(points[0]));
        path.add(new LineTo(points[1]));

        /* add sub steps before current step */
        path.addPath(this.createSubStepPath(physicalStep, physicalSubStep, stepPosition, angle));
      }
    }

    /* arrow */
    let arrowCenterVertex = {x: this._endPoint.x, y: this._endPoint.y};
    let arrowSideVertexes = [
      {x: this._endPoint.x - this.STEP_VIEW_SIZE, y: this._endPoint.y - this.STEP_VIEW_SIZE},
      {x: this._endPoint.x - this.STEP_VIEW_SIZE, y: this._endPoint.y + this.STEP_VIEW_SIZE}
    ];

    if (angle != 0 && angle != 360) {
      arrowSideVertexes = Matrix.rotate(arrowSideVertexes, arrowCenterVertex, angle);
    }

    path.add(new MoveTo(arrowSideVertexes[0]));
    path.add(new LineTo(arrowCenterVertex));
    path.add(new LineTo(arrowSideVertexes[1]));

    this._rayPathView.path = path;

    if (this._viewEffects.showNumbers) {
      this._numbersGroup.innerHTML = "";

      if (this._viewEffects.showZero) {
        this._numbersGroup.appendChild(this.createNumber(this._startPoint, 0).SVG);
      }

      let step = this._mainStep / this._currentDivisor * (this._viewEffects.numbersDirection || 1);
      let number = step;
      for (let stepLength = physicalStep; stepLength < lineLength; stepLength += physicalStep) {
        let stepPosition = Angle.lineFromVector(this._startPoint, angle, stepLength);
        this._numbersGroup.appendChild(this.createNumber(stepPosition, number).SVG);
        number += step;
      }
    }
  }

  public set viewEffects(effects: RayViewEffects) {
    let effectsAny: any = effects;
    let thisEffectsAny: any = this._viewEffects;
    for (let key in effectsAny) {
      if (effectsAny[key] !== undefined) {
        thisEffectsAny[key] = effectsAny[key];
      }
    }
    this._viewEffects = thisEffectsAny;
    this.__updateView__();
  }

  public __correct__(refPoint: Point, lastRefPoint: Point): void {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;

    this.__fixRect__();
    this.__drag__({x: delta.x, y: delta.y});
  }
  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;

    this._startPoint = {
      x: this._lastStartPoint.x + delta.x,
      y: this._lastStartPoint.y + delta.y
    };
    this._endPoint = {
      x: this._lastEndPoint.x + delta.x,
      y: this._lastEndPoint.y + delta.y
    };

    this._rayPathView.__drag__(delta);
  }

  public __setRect__(rect: Rect, delta?: Point): void {
    let dw = 1;
    let dh = 1;

    if (delta) {
      dw = delta.x;
      dh = delta.y;
    } else {
      if (this._lastRect.width != 0)
        dw = rect.width / (this._lastRect.width);
      if (this._lastRect.height != 0)
        dh = rect.height / (this._lastRect.height);
    }

    let points = [this._startPoint, this._endPoint];
    let lastPoints = [this._lastStartPoint, this._lastEndPoint];

    for (let i = 0; i < points.length; i++) {
      /* points may not be fixed, and this._lastPoints[i] may be undefined */

      points[i].x = rect.x + Math.abs(lastPoints[i].x - rect.x) * dw;
      points[i].y = rect.y + Math.abs(lastPoints[i].y - rect.y) * dh;
    }
    this._rect = ElementView.calculateRect([this._startPoint, this._endPoint]);

    this.__updateView__();
  }

  public override __fixRect__() {
    super.__fixRect__();
    this._rayPathView.__fixRect__();
    this._lastStartPoint = Object.assign({}, this._startPoint);
    this._lastEndPoint = Object.assign({}, this._endPoint);
  }

  get copy(): ElementView { /* todo */
    return this;
  }

  public isComplete(): boolean { /* todo */
    return false;
  }

  public toPath(): PathView { /* todo */
    return new PathView(this._container);
  }
  public override toJSON(): any { /* todo */
    return super.toJSON()
  }
  public override fromJSON(json: any) { /* todo */
  };
}
