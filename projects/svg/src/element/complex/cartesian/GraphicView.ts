import {ElementType} from '../../../dataSource/constant/ElementType';
import {Point} from '../../../model/Point';
import {Rect} from '../../../model/Rect';
import {ElementCursor, ElementProperties, ElementView} from '../../ElementView';
import {PathView} from '../../shape/path/PathView';
import {Container} from '../../../Container';
import {Path} from '../../../model/path/Path';
import {MoveDrawable} from '../../../service/tool/draw/type/MoveDrawable';
import {MoveTo} from '../../../model/path/point/MoveTo';
import {LineTo} from '../../../model/path/line/LineTo';
import {ScaleProperties} from './CartesianView';
import {CartesianEditable} from './CartesianEditable';

export type GraphicFunction = (x: number) => number;

export class GraphicCursor extends ElementCursor {}

export interface GraphicProperties extends ElementProperties {}

export class GraphicView extends PathView implements MoveDrawable, CartesianEditable {
  protected override _type: ElementType = ElementType.GRAPHIC;

  private _origin: Point;
  private _lastOrigin: Point;
  private _f: GraphicFunction;
  private _zoomFactor: number = 1;

  protected _physicalUnitLimits: {min: number; max: number} = {min: 60, max: 120};
  protected _mainStep: number = 1;
  protected _mainStepMultiplier: number = 10;
  protected _mainStepPhysicalUnit: number = 60; /* px - CHANGING on zoom */

  constructor(container: Container,
              properties: GraphicProperties = {},
              rect: Rect = {x: 0, y: 0, width: 1, height: 1},
              origin: Point = {x: 0, y: 0},
              f: GraphicFunction,
              scale?: ScaleProperties,
              ownerId?: string,
              index?: number
  ) {
    super(container, properties, new Path(), ownerId, index);

    this._origin = origin;
    this._lastOrigin = origin;
    this._rect = rect;

    if (scale) {
      this._mainStep = scale.mainStep;
      this._mainStepPhysicalUnit = scale.mainStepPhysicalUnit;
      this._mainStepMultiplier = scale.mainStepMultiplier;
      this._physicalUnitLimits.min = scale.physicalUnitLimits.min;
      this._physicalUnitLimits.max = scale.physicalUnitLimits.max;
    }

    this._f = f;
    this.path = this.createGraphic();
  }

  private createGraphic(): Path {
    const path: Path = new Path();
    const widthByUnit: number = (this._rect.width / this._mainStepPhysicalUnit) * this._mainStep;
    const originXByUnit: number = (this._origin.x / this._mainStepPhysicalUnit) * this._mainStep;
    const minX: number = -originXByUnit;
    const maxX: number = widthByUnit - originXByUnit;
    const step: number = 0.01 * this._mainStep;

    let yWasInVisibleArea: boolean = false;
    const firstPoint: Point = {
      x: minX * this._mainStepPhysicalUnit / this._mainStep + this._origin.x + this._rect.x,
      y: -this._f(minX) * this._mainStepPhysicalUnit / this._mainStep + this._origin.y + this._rect.y
    };
    if (firstPoint.y >= this._rect.y && firstPoint.y <= this._rect.height) { /* in visible area */
      path.add(new MoveTo(firstPoint));
      yWasInVisibleArea = true;
    }

    for (let x: number = minX; x < maxX; x += step) {
      const nextPoint: Point = {
        x: x * this._mainStepPhysicalUnit / this._mainStep + this._origin.x + this._rect.x,
        y: -this._f(x) * this._mainStepPhysicalUnit / this._mainStep + this._origin.y + this._rect.y
      };

      const topBorder: number = this._rect.y;
      const bottomBorder: number = this._rect.y + this._rect.height;

      if (!yWasInVisibleArea && nextPoint.y >= topBorder && nextPoint.y <= bottomBorder) { /* from not visible area to visible area */
        path.add(new MoveTo(nextPoint));
        yWasInVisibleArea = true;
      } else  if (yWasInVisibleArea && nextPoint.y < topBorder || nextPoint.y > bottomBorder) { /* from visible area to not visible area */
        yWasInVisibleArea = false;
      } else if (!yWasInVisibleArea && nextPoint.y < topBorder || nextPoint.y > bottomBorder) { /* in not visible area */

      } else if (yWasInVisibleArea && nextPoint.y >= topBorder && nextPoint.y <= bottomBorder) { /* in visible area */
        path.add(new LineTo(nextPoint));
      }
    }
    return path;
  }

  public get f(): GraphicFunction {
    return this._f;
  }
  public set f(f: GraphicFunction) {
    this._f = f;
    this.path = this.createGraphic();
  }

  public override __drag__(delta: Point): void {
    this._origin.x = this._lastOrigin.x + delta.x;
    this._origin.y = this._lastOrigin.y + delta.y;
    super.__drag__(delta);
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point): void {
    super.__correct__(refPoint, lastRefPoint);
    const delta: Point = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    this._rect.x += delta.x;
    this._rect.y += delta.y;
  }
  public __drawSize__(rect: Rect): void {
    rect = ElementView.normalizeRect(rect);

    this._rect = rect;
    this._origin = {
      x: rect.width / 2,
      y: rect.height / 2
    };

    this.path = this.createGraphic();
  }
  public override __setRect__(rect: Rect, delta?: Point): void {
    this.__setRectSilent__(rect, delta);
    this.path = this.createGraphic();
  }
  /** don't updates view */
  public __setRectSilent__(rect: Rect, delta?: Point): void {
    rect = ElementView.normalizeRect(rect);

    this._rect = rect;
    this._origin.x = this._lastOrigin.x - (this._rect.x - this._lastRect.x);
    this._origin.y = this._lastOrigin.y - (this._rect.y - this._lastRect.y);
  }
  public zoomIn(factor: number): void {
    this._zoomFactor *= factor;
    this._mainStepPhysicalUnit *= factor;
    if (this._mainStepPhysicalUnit > this._physicalUnitLimits.max) {
      this._mainStepPhysicalUnit /= this._mainStepMultiplier;
      this._mainStep /= this._mainStepMultiplier;
    }
    this.path = this.createGraphic();
  }
  public zoomOut(factor: number): void {
    this._zoomFactor /= factor;
    this._mainStepPhysicalUnit /= factor;
    if (this._mainStepPhysicalUnit < this._physicalUnitLimits.min) {
      this._mainStepPhysicalUnit *= this._mainStepMultiplier;
      this._mainStep *= this._mainStepMultiplier;
    }
    this.path = this.createGraphic();
  }

  public __moveOrigin__(delta: Point): void {
    this._origin.x = this._lastOrigin.x + delta.x;
    this._origin.y = this._lastOrigin.y + delta.y;

    this.path = this.createGraphic();
  }
  public moveOrigin(delta: Point): void {
    this.__fixRect__();
    this.__moveOrigin__(delta);
  }
  public setOrigin(origin: Point): void {
    this._origin = Object.assign({}, origin);

    this.path = this.createGraphic();
  }

  public override __updateView__(): void {
    const rect: Rect = Object.assign({}, this._rect);
    super.__updateView__();
    this._rect = rect;
  }

  public override __fixRect__(): void {
    super.__fixRect__();
    this._lastOrigin = Object.assign({}, this._origin);
  }

  public override toJSON(): any {
    const json: any = super.toJSON();
    json.f = this._f.toString();
    json.origin = this._origin;
    json.physicalUnitLimits = this._physicalUnitLimits;
    json.mainStep = this._mainStep;
    json.mainStepMultiplier = this._mainStepMultiplier;
    json.mainStepPhysicalUnit = this._mainStepPhysicalUnit;
    json.zoomFactor = this._zoomFactor;
    return json;
  }
  public override fromJSON(json: any): void {
    super.fromJSON(json);
    // eslint-disable-next-line no-eval
    this._f = eval(json.f);
    this._origin = json.origin;
    this._physicalUnitLimits = json.physicalUnitLimits;
    this._mainStep = json.mainStep;
    this._mainStepMultiplier = json.mainStepMultiplier;
    this._mainStepPhysicalUnit = json.mainStepPhysicalUnit;
    this.zoomIn(json.zoomFactor);
    this.__updateView__();
  };
}
