import {ElementType} from '../../../dataSource/constant/ElementType';
import {Point} from '../../../model/Point';
import {Rect} from '../../../model/Rect';
import {ElementCursor, ElementProperties, ElementStyle, ElementView} from '../../ElementView';
import {PathView} from '../../shape/path/PathView';
import {ComplexView} from '../../type/ComplexView';
import {Container} from '../../../Container';
import {Path} from '../../../model/path/Path';
import {MoveTo} from '../../../model/path/point/MoveTo';
import {LineTo} from '../../../model/path/line/LineTo';
import {Angle} from '../../../service/math/Angle';
import {Matrix} from '../../../service/math/Matrix';
import {TextView} from '../../foreign/text/TextView';
import {ClickDrawable} from '../../../service/tool/draw/type/ClickDrawable';
import {ScaleProperties} from './CartesianView';
import {CartesianEditable} from './CartesianEditable';

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
    this.element.numbersGroup.setAttribute('fill', color);
  }

  public override get backgroundColor(): string {
    return super.backgroundColor;
  }
  public override set backgroundColor(color: string)  {
    super.backgroundColor = color;
  }
}

export interface RayProperties extends ElementProperties {}

export interface RayViewEffects {
  showSteps?: boolean;
  showNumbers?: boolean;
  showZero?: boolean;
  numbersDirection?: 1 | -1;
}

export class RayView extends ComplexView implements ClickDrawable, CartesianEditable {
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'g');
  protected _type: ElementType = ElementType.RAY;

  public override readonly style: RayStyle;

  private readonly _numberViews: TextView[] = [];
  private readonly _rayPathView: PathView;
  private readonly _numbersGroup: SVGGElement;

  private _viewEffects: RayViewEffects = {
    showSteps: true,
    showNumbers: true,
    showZero: false,
    numbersDirection: 1,
  };
  private _zoomFactor: number = 1;

  private _lastStartPoint: Point = {x: 0, y: 0};
  private _lastEndPoint: Point = {x: 0, y: 0};
  private _startPoint: Point = {x: 0, y: 0};
  private _endPoint: Point = {x: 0, y: 0};

  protected _mainStepDivisors: number[] = [1, 2, 4, 5];
  protected _currentDivisor: number = this._mainStepDivisors[0];

  protected _physicalUnitLimits: {min: number; max: number} = {min: 60, max: 120};
  protected _mainStep: number = 1;
  protected _mainStepMultiplier: number = 10;
  protected _mainStepPhysicalUnit: number = 60; /* px - CHANGING on zoom */

  protected readonly STEP_VIEW_SIZE: number = 6;
  protected readonly SUB_STEP_VIEW_SIZE: number = 3;
  protected readonly SUB_STEPS_COUNT: number = 4;

  constructor(container: Container,
              properties: RayProperties = {},
              viewEffects: RayViewEffects = {},
              startPoint: Point = {x: 0, y: 0},
              endPoint: Point = {x: 0, y: 0},
              scale?: ScaleProperties,
              ownerId?: string,
              index?: number
  ) {

    super(container, ownerId, index);

    this.style = new RayStyle(this);
    this._startPoint = startPoint;
    this._endPoint = endPoint;

    this._rayPathView = new PathView(container, {overEvent: false, globalStyle: false});
    this._numbersGroup = document.createElementNS(ElementView.svgURI, 'g');
    this._numbersGroup.setAttribute('stroke-width', '0');
    this._numbersGroup.id = 'numbers';

    this.svgElement.appendChild(this._rayPathView.SVG);
    this.svgElement.appendChild(this._numbersGroup);

    if (scale) {
      this._mainStep = scale.mainStep;
      this._mainStepPhysicalUnit = scale.mainStepPhysicalUnit;
      this._mainStepMultiplier = scale.mainStepMultiplier;
      this._physicalUnitLimits.min = scale.physicalUnitLimits.min;
      this._physicalUnitLimits.max = scale.physicalUnitLimits.max;
    }

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
      throw Error('No such point index');
    }
  }
  public pushPoint(point: Point): void {}
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
      throw Error('No such point index');
    }
    this._rect = ElementView.calculateRect(this._rayPathView.points);
    this.__updateView__();
  }
  public override get points(): Point[] {
    return [
      this._startPoint,
      this._endPoint
    ];
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
    const physicalUnit: number = this._mainStepPhysicalUnit / divisor;
    return physicalUnit <= this._physicalUnitLimits.max && physicalUnit >= this._physicalUnitLimits.min;
  }

  public zoomIn(factor: number): void {
    this._zoomFactor *= factor;
    this._mainStepPhysicalUnit *= factor;

    while (this.isInRange(this._mainStepMultiplier)) {
      this._mainStep /= 10;
      this._mainStepPhysicalUnit /= 10;
    }
    this._currentDivisor = Math.max(...this._mainStepDivisors.filter(this.isInRange.bind(this)));

    this.__updateView__();
  }
  public zoomOut(factor: number): void {
    this._zoomFactor /= factor;
    this._mainStepPhysicalUnit /= factor;

    let filteredDivisors: number[] = this._mainStepDivisors.filter(this.isInRange.bind(this));
    while (filteredDivisors.length === 0) {
      this._mainStep *= 10;
      this._mainStepPhysicalUnit *= 10;
      filteredDivisors = this._mainStepDivisors.filter(this.isInRange.bind(this));
    }

    this._currentDivisor = Math.max(...filteredDivisors);

    this.__updateView__();
  }

  public __moveOrigin__(delta: Point): void {}
  public moveOrigin(delta: Point): void {}
  public setOrigin(origin: Point): void {}

  private createSubStepPath(physicalStep: number, physicalSubStep: number, mainStepPosition: Point, angle: number, maxLength?: number): Path {
    const path: Path = new Path();
    const subStepPhysicalLength: number = Angle.lineLength(this._startPoint, mainStepPosition);

    for (let subStepLength: number = physicalSubStep; subStepLength < physicalStep; subStepLength += physicalSubStep) {
      const subStepPosition: Point = Angle.lineFromVector(mainStepPosition, angle, subStepLength);

      /* if sub steps position is outer from ray */
      if (maxLength !== undefined && (subStepPhysicalLength + subStepLength > maxLength)) {
        break;
      }

      let points: Point[] = [
        {x: subStepPosition.x, y: subStepPosition.y - this.SUB_STEP_VIEW_SIZE},
        {x: subStepPosition.x, y: subStepPosition.y + this.SUB_STEP_VIEW_SIZE}
      ];
      if (angle !== 0 && angle !== 360) {
        points = Matrix.rotate(points, subStepPosition, angle);
      }

      path.add(new MoveTo(points[0]));
      path.add(new LineTo(points[1]));
    }

    return path;
  }
  private createNumber(position: Point, value: number): TextView {
    let visibleNumber: number | string = Math.round(value * 100_000) / 100_000;
    if (visibleNumber !== 0 && (Math.abs(visibleNumber) <= 0.0001 || Math.abs(visibleNumber) > 9_999)) {
      visibleNumber = value.toExponential(4);
    }

    return new TextView(this._container,
      {overEvent: false, globalStyle: false},
      {x: position.x + 3, y: position.y - 3, width: 0, height: 0},
      visibleNumber + '');
  }

  public __updateView__(): void {
    const path: Path = new Path();
    path.add(new MoveTo(this._startPoint));
    path.add(new LineTo(this._endPoint));

    const angle: number = Angle.fromTwoPoints(this._startPoint, this._endPoint);
    const physicalStep: number = this._mainStepPhysicalUnit / this._currentDivisor;
    const physicalSubStep: number = physicalStep / this.SUB_STEPS_COUNT;
    const lineLength: number = Angle.lineLength(this._startPoint, this._endPoint);

    if (this._viewEffects.showSteps) {
      /* add sub steps before first step */
      path.addPath(this.createSubStepPath(physicalStep, physicalSubStep, this._startPoint, angle, lineLength));
      for (let stepLength: number = physicalStep; stepLength < lineLength; stepLength += physicalStep) {
        const stepPosition: Point = Angle.lineFromVector(this._startPoint, angle, stepLength);
        let points: Point[] = [
          {x: stepPosition.x, y: stepPosition.y - this.STEP_VIEW_SIZE},
          {x: stepPosition.x, y: stepPosition.y + this.STEP_VIEW_SIZE}
        ];
        if (angle !== 0 && angle !== 360) {
          points = Matrix.rotate(points, stepPosition, angle);
        }

        path.add(new MoveTo(points[0]));
        path.add(new LineTo(points[1]));

        /* add sub steps before current step */
        path.addPath(this.createSubStepPath(physicalStep, physicalSubStep, stepPosition, angle, lineLength));
      }
    }

    /* arrow */
    const arrowCenterVertex: Point = {x: this._endPoint.x, y: this._endPoint.y};
    let arrowSideVertexes: Point[] = [
      {x: this._endPoint.x - this.STEP_VIEW_SIZE, y: this._endPoint.y - this.STEP_VIEW_SIZE},
      {x: this._endPoint.x - this.STEP_VIEW_SIZE, y: this._endPoint.y + this.STEP_VIEW_SIZE}
    ];

    if (angle !== 0 && angle !== 360) {
      arrowSideVertexes = Matrix.rotate(arrowSideVertexes, arrowCenterVertex, angle);
    }

    path.add(new MoveTo(arrowSideVertexes[0]));
    path.add(new LineTo(arrowCenterVertex));
    path.add(new LineTo(arrowSideVertexes[1]));

    this._rayPathView.path = path;

    if (this._viewEffects.showNumbers) {
      this._numbersGroup.innerHTML = '';

      if (this._viewEffects.showZero) {
        const numberView: TextView = this.createNumber(this._startPoint, 0);
        this._numberViews.push(numberView);
        this._numbersGroup.appendChild(numberView.SVG);
      }

      const step: number = this._mainStep / this._currentDivisor * (this._viewEffects.numbersDirection || 1);
      /* number value of step */
      let value: number = step;
      for (let stepLength: number = physicalStep; stepLength < lineLength; stepLength += physicalStep) {
        const stepPosition: Point = Angle.lineFromVector(this._startPoint, angle, stepLength);
        const numberView: TextView = this.createNumber(stepPosition, value);
        this._numberViews.push(numberView);
        this._numbersGroup.appendChild(numberView.SVG);
        value += step;
      }
    }
  }

  public set viewEffects(effects: RayViewEffects) {
    const effectsAny: any = effects;
    const thisEffectsAny: any = this._viewEffects;
    for (const key in effectsAny) {
      if (effectsAny[key] !== undefined) {
        thisEffectsAny[key] = effectsAny[key];
      }
    }
    this._viewEffects = thisEffectsAny;
    this.__updateView__();
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point): void {
    const delta: Point = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x === 0 && delta.y === 0) {return;}

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
    this._numberViews.forEach((numberView: TextView) => {
      numberView.__drag__(delta);
    });
  }

  public override __setRect__(rect: Rect, delta?: Point): void {
    let dw: number = 1;
    let dh: number = 1;

    if (delta) {
      dw = delta.x;
      dh = delta.y;
    } else {
      if (this._lastRect.width !== 0)
        {dw = rect.width / (this._lastRect.width);}
      if (this._lastRect.height !== 0)
        {dh = rect.height / (this._lastRect.height);}
    }

    const points: Point[] = [this._startPoint, this._endPoint];
    const lastPoints: Point[] = [this._lastStartPoint, this._lastEndPoint];

    for (let i: number = 0; i < points.length; i++) {
      /* points may not be fixed, and this._lastPoints[i] may be undefined */

      points[i].x = rect.x + Math.abs(lastPoints[i].x - rect.x) * dw;
      points[i].y = rect.y + Math.abs(lastPoints[i].y - rect.y) * dh;
    }
    this._rect = ElementView.calculateRect([this._startPoint, this._endPoint]);

    this.__updateView__();
  }

  public override __fixRect__(): void {
    super.__fixRect__();
    this._rayPathView.__fixRect__();
    this._numberViews.forEach((numberView: TextView) => {
      numberView.__fixRect__();
    });
    this._lastStartPoint = Object.assign({}, this._startPoint);
    this._lastEndPoint = Object.assign({}, this._endPoint);
  }

  public isComplete(): boolean { /* todo */
    return this._startPoint.x === this._endPoint.x && this._startPoint.y === this._endPoint.y;
  }

  public toPath(): PathView { /* todo */
    return new PathView(this._container);
  }
  public override toJSON(): any {
    const json: any = super.toJSON();
    json.startPoint = Object.assign({}, this._startPoint);
    json.endPoint = Object.assign({}, this._endPoint);
    json.currentDivisor = this._currentDivisor;
    json.physicalUnitLimits = Object.assign({}, this._physicalUnitLimits);
    json.mainStep = this._mainStep;
    json.mainStepMultiplier = this._mainStepMultiplier;
    json.mainStepPhysicalUnit = this._mainStepPhysicalUnit;
    json.viewEffects = Object.assign({}, this._viewEffects);
    json.zoomFactor = this._zoomFactor;
    return json;
  }
  public override fromJSON(json: any): void {
    this._startPoint = Object.assign({}, json.startPoint);
    this._endPoint = Object.assign({}, json.endPoint);
    this._currentDivisor = json.currentDivisor;
    this._physicalUnitLimits = Object.assign({}, json.physicalUnitLimits);
    this._mainStep = json.mainStep;
    this._mainStepMultiplier = json.mainStepMultiplier;
    this._mainStepPhysicalUnit = json.mainStepPhysicalUnit;
    this._viewEffects = Object.assign({}, json.viewEffects);
    this._zoomFactor = json.zoomFactor;
    super.fromJSON(json);
    this.__updateView__();
  };
}
