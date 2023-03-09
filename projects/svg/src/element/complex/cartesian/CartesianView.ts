import {ComplexView} from '../../type/ComplexView';
import {Point} from '../../../model/Point';
import {Container} from '../../../Container';
import {Rect} from '../../../model/Rect';
import {ElementProperties, ElementView} from '../../ElementView';
import {RectangleView} from '../../shape/pointed/polygon/rectangle/RectangleView';
import {CartesianEditable} from './CartesianEditable';

export interface ScaleProperties {
  mainStep: number;
  mainStepPhysicalUnit: number;
  mainStepMultiplier: number;
  physicalUnitLimits: {
    min: number; max: number;
  };
}

export abstract class CartesianView extends ComplexView implements CartesianEditable {
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'svg');

  protected _origin: Point; /* relative to graphic */
  protected _lastOrigin: Point; /* relative to graphic */

  protected readonly _backgroundView: RectangleView;
  protected readonly _axisGroup: SVGGElement;

  protected readonly NUMBER_FONT_SIZE: string = '12';
  protected readonly AXIS_WIDTH: string = '1';

  protected constructor(container: Container,
                        properties: ElementProperties = {},
                        rect: Rect = {x: 0, y: 0, width: 1, height: 1},
                        ownerId?: string, index?: number) {

    super(container, ownerId, index);
    this._origin = {x: 0, y: 0};
    this._lastOrigin = {x: 0, y: 0};
    this._rect = rect;

    this._axisGroup = document.createElementNS(ElementView.svgURI, 'g');
    this._axisGroup.id = 'axis';

    this._backgroundView = new RectangleView(this._container, {overEvent: false, globalStyle: true}, rect);
    this._backgroundView.style.fillColor = 'none';
    this._backgroundView.style.strokeColor = 'none';
    this._backgroundView.style.strokeWidth = '0';

    this.svgElement.appendChild(this._backgroundView.SVG);
    this.svgElement.appendChild(this._axisGroup);
  }

  public get backgroundRect(): RectangleView {
    return this._backgroundView;
  }

  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.setAttr({
      x: this._lastRect.x + delta.x,
      y: this._lastRect.y + delta.y
    });
  }

  protected abstract reassignAxis(): void;

  public abstract zoomIn(factor: number): void;
  public abstract zoomOut(factor: number): void;
  public abstract __moveOrigin__(delta: Point): void;
}
