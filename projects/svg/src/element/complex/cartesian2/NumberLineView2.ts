import {ElementType} from '../../../dataSource/constant/ElementType';
import {Point} from '../../../model/Point';
import {Rect} from '../../../model/Rect';
import {PathView} from '../../shape/path/PathView';
import {ElementCursor, ElementProperties, ElementStyle, ElementView} from '../../ElementView';
import {Container} from '../../../Container';
import {Path} from '../../../model/path/Path';
import {MoveTo} from '../../../model/path/point/MoveTo';
import {LineTo} from '../../../model/path/line/LineTo';
import {MoveDrawable} from '../../../service/tool/draw/type/MoveDrawable';
import {TextView} from '../../foreign/text/TextView';
import {Style} from '../../../service/style/Style';
import {RectangleView} from '../../shape/pointed/polygon/rectangle/RectangleView';
import {CartesianView2} from './CartesianView2';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';

export class NumberLine2Style extends ElementStyle {
  protected override element: NumberLineView2;

  public constructor(element: NumberLineView2) {
    super(element);
    this.element = element;
  }

  public override get strokeWidth(): string {
    return super.strokeWidth;
  }
  public override set strokeWidth(width: string) {
    this.style.set('stroke-width', width);
    this.element.background.style.strokeWidth = width;
    this.element.xAxisView.style.strokeWidth = width;
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    this.style.set('stroke-dasharray', array);
    this.element.background.style.strokeDashArray = array;
    this.element.xAxisView.style.strokeDashArray = array;
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    this.style.set('stroke', color);
    this.element.background.style.strokeColor = color;
    this.element.xAxisView.style.strokeColor = color;
    this.element.xAxisView.style.fillColor = color;
  }

  public override get fillColor(): string {
    return super.fillColor;
  }
  public override set fillColor(color: string) {
    this.style.set('fill', color);
    this.element.background.style.fillColor = color;
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

export class NumberLine2Cursor extends ElementCursor {}

export interface NumberLine2Properties extends ElementProperties {}

export interface Axis {
  label: string;
  min: number;
  step: number;
  numberOfSteps: number;
  linesPerStep: number;
}
export interface Grid {
  show: boolean;
  byX: number;
  byY: number;
}

export class NumberLineView2 extends CartesianView2 implements MoveDrawable {
  protected override _type: ElementType = ElementType.NUMBER_LINE2;
  public override readonly style: NumberLine2Style;
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'g');
  public override rotatable: boolean = false;

  private readonly _background: RectangleView;
  private readonly numbersGroup: SVGGElement;
  private readonly axisGroup: SVGGElement;
  private readonly labelsGroup: SVGGElement;

  public readonly _xAxisView: PathView;

  private _xAxis: Axis;


  constructor(container: Container,
              properties: NumberLine2Properties = {},
              rect: Rect = {x: 0, y: 0, width: 1, height: 1},
              xAxis: Axis = {label: 'X', min: -10, step: 1, numberOfSteps: 21, linesPerStep: 0},
              yAxis: Axis = {label: 'Y', min: -10, step: 1, numberOfSteps: 21, linesPerStep: 0},
              grid: Grid = {show: false, byX: 1, byY: 1},
              graphics: {f: (value: number) => any; style: Style}[] = [],
              ownerId?: string,
              index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;
    this._rect = rect;
    this._xAxis = xAxis;
    this.style = new NumberLine2Style(this);

    this.numbersGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.numbersGroup.style.shapeRendering = 'optimizespeed';
    this.numbersGroup.id = 'numbers';
    this.axisGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.axisGroup.style.shapeRendering = 'optimizespeed';
    this.axisGroup.id = 'axis';
    this.labelsGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.labelsGroup.style.shapeRendering = 'optimizespeed';
    this.labelsGroup.id = 'axis';

    this._background = new RectangleView(this._container, {overEvent: false, globalStyle: false});
    this._background.SVG.style.shapeRendering = 'optimizespeed';
    this._background.style.strokeColor = '#bfbfbf';
    this._background.style.fillColor = 'none';

    this._xAxisView = new PathView(this._container);
    this.axisGroup.appendChild(this._xAxisView.SVG);

    this.svgElement.appendChild(this._background.SVG);
    this.svgElement.appendChild(this.numbersGroup);
    this.svgElement.appendChild(this.axisGroup);
    this.svgElement.appendChild(this.labelsGroup);

    this.__updateView__();
    this.setProperties(properties);

    this.style.strokeWidth = '1';
  }

  public get background(): RectangleView {
    return this._background;
  }
  public get xAxisView(): PathView {
    return this._xAxisView;
  }

  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__updateView__();
  }

  public __drawSize__(rect: Rect): void {
    this.__setRect__(rect);
  }
  public override __setRect__(rect: Rect): void {
    rect = ElementView.normalizeRect(rect);

    this._rect = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
    this.__updateView__();
  }

  public __updateView__(): void {
    this.labelsGroup.innerHTML = '';
    const xAxisY: number = this._rect.y + this._rect.height / 2;

    this._xAxisView.path = this.getXAxisViewPath();
    const xAxisLabel: TextView = new TextView(
      this._container,
      {overEvent: false, globalStyle: false},
      undefined,
      this._xAxis.label
    );
    xAxisLabel.__drag__({x: this._rect.x + this._rect.width - 10, y: xAxisY - 10});
    xAxisLabel.style.fontSize = '10';
    xAxisLabel.style.strokeWidth = '1';
    this.labelsGroup.appendChild(xAxisLabel.SVG);

    if (this._numbersVisible) {
      this.showNumbers(xAxisY);
    } else {
      this.hideNumbers();
    }
    if (this._borderVisible) {
      this.showBorder();
    } else {
      this.hideBorder();
    }

    this._background.__drawSize__(this._rect);
  }

  private getXAxisViewPath(): Path {
    const xAxisY: number = this._rect.y + this._rect.height / 2;
    const rect: Rect = this.getAreaRect();
    const xPhysicalStepSize: number = rect.width / (this._xAxis.numberOfSteps - 1);
    const xAxisPath: Path = new Path();
    const xAxisArrowsPath: Path = new Path();
    if (xPhysicalStepSize === 0) {
      return xAxisPath;
    }

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

    /* x steps */
    const subStepPhysicalSize: number = xPhysicalStepSize / (this._xAxis.linesPerStep + 1);
    for (let i: number = 0; i < this._xAxis.numberOfSteps; ++i) {
      const x: number = rect.x + (i * xPhysicalStepSize);
      /* pass final step */
      if (i !== this._xAxis.numberOfSteps - 1) {
        /* x sub steps */
        for (let subStep: number = 1; subStep < this._xAxis.linesPerStep + 1; ++subStep) {
          xAxisPath.add(new MoveTo({x: x + subStep * subStepPhysicalSize, y: xAxisY - 2}));
          xAxisPath.add(new LineTo({x: x + subStep * subStepPhysicalSize, y: xAxisY + 2}));
        }
      }

      xAxisPath.add(new MoveTo({x, y: xAxisY - 5}));
      xAxisPath.add(new LineTo({x, y: xAxisY + 5}));
    }

    xAxisPath.addPath(xAxisArrowsPath);
    return xAxisPath;
  }

  private showNumbers(xAxisY: number): void {
    this.hideNumbers();

    const rect: Rect = this.getAreaRect();
    const xPhysicalStepSize: number = rect.width / (this._xAxis.numberOfSteps - 1);

    let currentNumber: number = this._xAxis.min;
    for (let i: number = 0; i < this._xAxis.numberOfSteps; ++i) {
      const x: number = rect.x + (i * xPhysicalStepSize);
      const numberView: TextView = super.xAxisNumber(x, xAxisY, currentNumber);
      this.numbersGroup.appendChild(numberView.SVG);
      currentNumber += this._xAxis.step;
    }
    this._numbersVisible = true;
  }
  private hideNumbers(): void {
    this.numbersGroup.innerHTML = '';
    this._numbersVisible = false;
  }
  private showBorder(): void {
    this._background.style.strokeWidth = '1';
    this._borderVisible = true;
  }
  private hideBorder(): void {
    this._background.style.strokeWidth = '0';
    this._borderVisible = false;
  }

  public get xAxisModel(): Axis {
    return this._xAxis;
  }

  public edit(xAxis: Axis, showNumbers?: boolean, showBorder?: boolean, call: boolean = true): void {
    if ( /* return if nothing changed */
      JSON.stringify(this._xAxis) === JSON.stringify(xAxis) &&
      this._numbersVisible === showNumbers &&
      this._borderVisible === showBorder
    ) {
      return;
    }

    this._xAxis = xAxis;

    if (showNumbers !== undefined) {
      this._numbersVisible = showNumbers;
    }
    if (showBorder !== undefined) {
      this._borderVisible = showBorder;
    }

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

  public override toJSON(): any {
    const json: any = super.toJSON();
    json.xAxis = Object.assign({}, this._xAxis);
    json.showNumbers = this._numbersVisible;
    json.showBorder = this._borderVisible;
    return json;
  }
  public override fromJSON(json: any): void {
    super.fromJSON(json);
    this.edit(json.xAxis, json.showNumbers, json.showBorder, false);
  }
}
