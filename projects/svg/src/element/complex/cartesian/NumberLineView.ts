/* eslint-disable @typescript-eslint/naming-convention */
import {ComplexView} from '../../type/ComplexView';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {Point} from '../../../model/Point';
import {Rect} from '../../../model/Rect';
import {PathView} from '../../shape/path/PathView';
import {ElementCursor, ElementProperties, ElementView} from '../../ElementView';
import {Container} from '../../../Container';
import {Path} from '../../../model/path/Path';
import {MoveTo} from '../../../model/path/point/MoveTo';
import {LineTo} from '../../../model/path/line/LineTo';
import {MoveDrawable} from '../../../service/tool/draw/type/MoveDrawable';
import {TextView} from '../../foreign/text/TextView';
import {RectangleView} from '../../shape/pointed/polygon/rectangle/RectangleView';
import {SVGEvent} from "../../../dataSource/constant/SVGEvent";

export class NumberLineCursor extends ElementCursor {}

export interface NumberLineProperties extends ElementProperties {}

interface Axis {
  label: string;
  min: number;
  step: number;
  numberOfSteps: number;
  linesPerStep: number;
}

export class NumberLineView extends ComplexView implements MoveDrawable {
  protected _type: ElementType = ElementType.NUMBER_LINE2;
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'g');
  public override rotatable = false;

  private readonly borderView: RectangleView;
  private readonly numbersGroup: SVGGElement;
  private readonly axisGroup: SVGGElement;

  private xAxis: Axis;

  private readonly ARROW_LENGTH = 5;
  private readonly ARROW_MARGIN = 5;

  constructor(container: Container,
              properties: NumberLineProperties = {},
              rect: Rect = {x: 0, y: 0, width: 1, height: 1},
              xAxis: Axis = {label: 'X', min: -10, step: 1, numberOfSteps: 20, linesPerStep: 0},
              ownerId?: string,
              index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;
    this._rect = rect;
    this.xAxis = xAxis;

    this.numbersGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.numbersGroup.style.shapeRendering = 'optimizespeed';
    this.axisGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.axisGroup.style.shapeRendering = 'optimizespeed';

    this.borderView = new RectangleView(this._container, {overEvent: false, globalStyle: false});
    this.borderView.SVG.style.shapeRendering = 'optimizespeed';
    this.borderView.style.strokeColor = '#bfbfbf';
    this.borderView.style.strokeWidth = '1';

    this.svgElement.appendChild(this.borderView.SVG);
    this.svgElement.appendChild(this.numbersGroup);
    this.svgElement.appendChild(this.axisGroup);

    this.__updateView__();
    this.setProperties(properties);
  }

  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__updateView__();
  }

  public __drawSize__(rect: Rect): void {
    this.__setRect__(rect);
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

    this._rect = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
    this.__updateView__();
  }

  public __updateView__(): void {
    this.numbersGroup.innerHTML = '';
    this.axisGroup.innerHTML = '';
    const rect = { /* rect without arrow and arrow margin */
      x: this._rect.x + this.ARROW_LENGTH + this.ARROW_MARGIN,
      y: this._rect.y + this.ARROW_LENGTH + this.ARROW_MARGIN,
      width: this._rect.width - (this.ARROW_LENGTH + this.ARROW_MARGIN) * 2,
      height: this._rect.height - (this.ARROW_LENGTH + this.ARROW_MARGIN) * 2
    };

    const xPhysicalStepSize = rect.width / this.xAxis.numberOfSteps;
    const xAxisY = this._rect.y + this._rect.height / 2;
    let numberView;
    let currentNumber;

    const xAxisPath = new Path();
    const xAxisArrowsPath = new Path();
    if (xPhysicalStepSize === 0) {
      return;
    }

    const xAxisLabel = new TextView(
      this._container,
      {overEvent: false, globalStyle: false},
      undefined,
      this.xAxis.label
    );
    xAxisLabel.__drag__({x: this._rect.x + this._rect.width - 10, y: xAxisY - 10});
    xAxisLabel.style.fontSize = '10';
    xAxisLabel.style.strokeWidth = '1';
    this.numbersGroup.appendChild(xAxisLabel.SVG);

    /* left arrow */
    xAxisArrowsPath.add(new MoveTo({x: this._rect.x, y: xAxisY}));
    xAxisArrowsPath.add(new LineTo({x: this._rect.x + this.ARROW_LENGTH, y: xAxisY - this.ARROW_LENGTH}));
    xAxisArrowsPath.add(new LineTo({x: this._rect.x + this.ARROW_LENGTH, y: xAxisY + this.ARROW_LENGTH}, true));
    /* right arrow */
    xAxisArrowsPath.add(new MoveTo({x: this._rect.x + this._rect.width, y: xAxisY}));
    xAxisArrowsPath.add(new LineTo({x: this._rect.x + this._rect.width - this.ARROW_LENGTH, y: xAxisY - this.ARROW_LENGTH}));
    xAxisArrowsPath.add(new LineTo({x: this._rect.x + this._rect.width - this.ARROW_LENGTH, y: xAxisY + this.ARROW_LENGTH}, true));

    xAxisPath.add(new MoveTo({x: this._rect.x + this.ARROW_LENGTH, y: xAxisY}));
    xAxisPath.add(new LineTo({x: this._rect.x + this._rect.width - this.ARROW_LENGTH, y: xAxisY}));

    currentNumber = this.xAxis.min;
    for (let i = 0; i < this.xAxis.numberOfSteps; ++i) {
      const x = rect.x + (i * xPhysicalStepSize);
      const subStepPhysicalSize = xPhysicalStepSize / (this.xAxis.linesPerStep + 1);
      for (let subStep = 1; subStep < this.xAxis.linesPerStep + 1; ++subStep) {
        xAxisPath.add(new MoveTo({x: x + subStep * subStepPhysicalSize, y: xAxisY - 2}));
        xAxisPath.add(new LineTo({x: x + subStep * subStepPhysicalSize, y: xAxisY + 2}));
      }

      xAxisPath.add(new MoveTo({x, y: xAxisY - 5}));
      xAxisPath.add(new LineTo({x, y: xAxisY + 5}));
      numberView = new TextView(this._container);
      numberView.__drag__({x, y: xAxisY - 5});
      numberView.style.fontSize = '10';
      numberView.style.strokeWidth = '1';
      numberView.text = currentNumber + '';
      this.numbersGroup.appendChild(numberView.SVG);
      currentNumber += this.xAxis.step;
    }

    const xAxisPathView = new PathView(this._container);
    xAxisPathView.style.strokeWidth = '1';
    xAxisPathView.style.fillColor = '#000000';
    xAxisPathView.path = xAxisPath;
    this.axisGroup.appendChild(xAxisPathView.SVG);

    const xAxisArrowsPathView = new PathView(this._container);
    xAxisArrowsPathView.style.strokeWidth = '0';
    xAxisArrowsPathView.style.fillColor = '#000000';
    xAxisArrowsPathView.path = xAxisArrowsPath;
    this.axisGroup.appendChild(xAxisArrowsPathView.SVG);

    this.borderView.__drawSize__(this._rect);
  }

  public get xAxisModel() {
    return this.xAxis;
  }

  public edit(xAxis: Axis, call: boolean = true) {
    this.xAxis = xAxis;
    this.__updateView__();
    if (call) {
      this._container.__call__(SVGEvent.NUMBER_LINE2_EDITED, {element: this});
    }
  }

  public isComplete(): boolean {
    return this._rect.width > 10 && this._rect.height > 10;
  }

  public toPath(): PathView {
    return new PathView(this._container);
  }

  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.edit(json.xAxis, false);
  }

  public override toJSON(): any {
    const json = super.toJSON();
    json.xAxis = Object.assign({}, this.xAxis);
    return json;
  }
}
