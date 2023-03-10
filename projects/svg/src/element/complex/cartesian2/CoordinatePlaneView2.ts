import {ElementType} from '../../../dataSource/constant/ElementType';
import {Point} from '../../../model/Point';
import {Rect} from '../../../model/Rect';
import {PathView} from '../../shape/path/PathView';
import {ElementCursor, ElementProperties, ElementStyle, ElementView} from '../../ElementView';
import {Container} from '../../../Container';
import {Path} from '../../../model/path/Path';
import {MoveTo} from '../../../model/path/point/MoveTo';
import {LineTo} from '../../../model/path/line/LineTo';
import {TextView} from '../../foreign/text/TextView';
import {Style} from '../../../service/style/Style';
import {RectangleView} from '../../shape/pointed/polygon/rectangle/RectangleView';
import {CartesianView2} from './CartesianView2';
import {MoveDrawable} from '../../../service/tool/draw/type/MoveDrawable';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';

export class CoordinatePlane2Style extends ElementStyle {
  protected override element: CoordinatePlaneView2;

  public constructor(element: CoordinatePlaneView2) {
    super(element);
    this.element = element;
  }

  public override get strokeWidth(): string {
    return super.strokeWidth;
  }
  public override set strokeWidth(width: string) {
    this.style.set('stroke-width', width);
    this.element.xAxisView.style.strokeWidth = width;
    this.element.yAxisView.style.strokeWidth = width;
    this.element.__updateView__();
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    this.style.set('stroke-dasharray', array);
    this.element.xAxisView.style.strokeDashArray = array;
    this.element.yAxisView.style.strokeDashArray = array;
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    this.style.set('stroke', color);
    this.element.xAxisView.style.strokeColor = color;
    this.element.xAxisView.style.fillColor = color;
    this.element.yAxisView.style.strokeColor = color;
    this.element.yAxisView.style.fillColor = color;
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

export class CoordinatePlane2Cursor extends ElementCursor {}

export interface CoordinatePlane2Properties extends ElementProperties {}

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

export class CoordinatePlaneView2 extends CartesianView2 implements MoveDrawable {
  protected _type: ElementType = ElementType.COORDINATE_PLANE2;
  public override readonly style: CoordinatePlane2Style;
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'g');
  public override rotatable: boolean = false;

  private readonly graphicsGroup: SVGGElement;
  private readonly gridGroup: SVGGElement;

  public readonly _xAxisView: PathView;
  public readonly _yAxisView: PathView;

  private _xAxis: Axis;
  private _yAxis: Axis;
  private _grid: Grid;

  private _graphics: {f: (x: number) => number; style: Style}[] = [];


  constructor(container: Container,
              properties: CoordinatePlane2Properties = {},
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
    this._yAxis = yAxis;
    this._grid = grid;
    this._graphics = graphics;
    this.style = new CoordinatePlane2Style(this);

    this.graphicsGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.graphicsGroup.style.shapeRendering = 'optimizespeed';
    this.graphicsGroup.id = 'graphics';
    this.gridGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.gridGroup.style.shapeRendering = 'optimizespeed';
    this.gridGroup.id = 'grid';

    this._xAxisView = new PathView(this._container);
    this.axisGroup.appendChild(this._xAxisView.SVG);

    this._yAxisView = new PathView(this._container);
    this.axisGroup.appendChild(this._yAxisView.SVG);

    this.svgElement.appendChild(this._background.SVG);
    this.svgElement.appendChild(this.gridGroup);
    this.svgElement.appendChild(this.numbersGroup);
    this.svgElement.appendChild(this.graphicsGroup);
    this.svgElement.appendChild(this.axisGroup);
    this.svgElement.appendChild(this.labelsGroup);

    this.__updateView__();
    this.setProperties(properties);
  }

  public addGraphic(graphic: {f: (value: number) => any; style: Style}): void {
    for (const _graphic of this._graphics) {
      if ('' + _graphic.f === '' + graphic.f) { /* if already contains this function */
        return;
      }
    }

    this._graphics.push(graphic);
    this.__updateView__();
  }
  public removeGraphic(graphic: {f: (value: number) => any; style: Style}): void {
    for (let i: number = 0; i < this._graphics.length; ++i) {
      if ('' + this._graphics[i].f === '' + graphic.f) { /* if already contains this function */
        this._graphics.splice(i, 1);
        this.__updateView__();
        break;
      }
    }
  }

  public get background(): RectangleView {
    return this._background;
  }
  public get xAxisView(): PathView {
    return this._xAxisView;
  }
  public get yAxisView(): PathView {
    return this._yAxisView;
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
    this.graphicsGroup.innerHTML = '';
    this.gridGroup.innerHTML = '';
    const rect: Rect = this.getAreaRect();

    const xPhysicalStepSize: number = rect.width / (this._xAxis.numberOfSteps - 1);
    const yPhysicalStepSize: number = rect.height / (this._yAxis.numberOfSteps - 1);
    const xAxisY: number | undefined = this.getXAxisY();
    const yAxisX: number | undefined = this.getYAxisX();

    if (xAxisY) {
      this._xAxisView.path = this.getXAxisViewPath(xAxisY);
      const xAxisLabel: TextView = new TextView(
        this._container,
        {overEvent: false, globalStyle: false},
        undefined,
        this._xAxis.label
      );
      xAxisLabel.__drag__({x: this._rect.x + this._rect.width - 10, y: xAxisY - 15});
      xAxisLabel.style.fontSize = '10';
      xAxisLabel.style.strokeWidth = '1';
      xAxisLabel.SVG.style.direction = 'rtl';
      this.labelsGroup.appendChild(xAxisLabel.SVG);
    }

    if (yAxisX) {
      this._yAxisView.path = this.getYAxisViewPath(yAxisX);
      const yAxisLabel: TextView = new TextView(
        this._container,
        {overEvent: false, globalStyle: false},
        undefined,
        this._yAxis.label
      );
      yAxisLabel.__drag__({x: yAxisX + 15, y: this._rect.y + 15});
      yAxisLabel.style.fontSize = '10';
      yAxisLabel.style.strokeWidth = '1';
      this.labelsGroup.appendChild(yAxisLabel.SVG);
    }

    /* grid */
    if (this._grid.show) {
      const gridPath: Path = new Path();
      const gridPathView: PathView = new PathView(this._container, {overEvent: false, globalStyle: false});

      /* vertical lines */
      const realXAxisMin: number = this._xAxis.min - Math.floor((this.ARROW_LENGTH + this.ARROW_MARGIN) / xPhysicalStepSize) * this._xAxis.step;
      const realXNumberOfSteps: number = (
        (this._rect.x + this._rect.width) - /* right border position */
        (rect.x + ((realXAxisMin - this._xAxis.min) / this._xAxis.step) * xPhysicalStepSize)
      ) / xPhysicalStepSize;
      for (let i: number = realXAxisMin; i < realXAxisMin + realXNumberOfSteps * this._xAxis.step; i += this._grid.byX) {
        const x: number = rect.x + ((i - this._xAxis.min) / this._xAxis.step) * xPhysicalStepSize;
        /* prevent from drawing grid on border */
        if (x - this._rect.x <= 1 || this._rect.x + this._rect.width - x <= 1) {
          continue;
        }
        gridPath.add(new MoveTo({x, y: this._rect.y}));
        gridPath.add(new LineTo({x, y: this._rect.y + this._rect.height}));
      }

      /* horizontal lines */
      const realYAxisMin: number = this._yAxis.min - Math.floor((this.ARROW_LENGTH + this.ARROW_MARGIN) / yPhysicalStepSize) * this._yAxis.step;
      const realYNumberOfSteps: number = (
        (rect.y + rect.height - ((realYAxisMin - this._yAxis.min) / this._yAxis.step) * yPhysicalStepSize)
        - this._rect.y
      ) / yPhysicalStepSize;
      for (let i: number = realYAxisMin; i < realYAxisMin + realYNumberOfSteps * this._yAxis.step; i += this._grid.byY) {
        const y: number = rect.y + rect.height - (((i - this._yAxis.min) / this._yAxis.step) * yPhysicalStepSize);
        /* prevent from drawing grid on border */
        if (y - this._rect.y <= 1 || this._rect.y + this._rect.height - y <= 1) {
          continue;
        }
        gridPath.add(new MoveTo({x: this._rect.x, y}));
        gridPath.add(new LineTo({x: this._rect.x + this._rect.width, y}));
      }

      gridPathView.path = gridPath;
      gridPathView.style.strokeWidth = '1';
      gridPathView.style.strokeColor = '#bfbfbf';
      this.gridGroup.appendChild(gridPathView.SVG);
    }

    if (this._numbersVisible) {
      if (xAxisY && yAxisX) {
        this.showNumbers(xAxisY, yAxisX);
      }
    } else {
      this.hideNumbers();
    }
    if (this._borderVisible) {
      this.showBorder();
    } else {
      this.hideBorder();
    }

    /* graphics */
    this._graphics.forEach((graphic:  {f: (x: number) => number; style: Style}) => {
      if (this._yAxis && yPhysicalStepSize) {
        this.graphicsGroup.appendChild(this.createGraphicPath(graphic, xPhysicalStepSize, yPhysicalStepSize, rect, this._xAxis, this._yAxis).SVG);
      }
    });

    this._background.__drawSize__(this._rect);
  }

  private getXAxisY(): number | undefined {
    if (this._xAxis.min <= 0 && this._xAxis.min + this._xAxis.step * this._xAxis.numberOfSteps > 0) {
      const rect: Rect = this.getAreaRect();
      const yPhysicalStepSize: number = rect.height / (this._yAxis.numberOfSteps - 1);
      let lastNegative: number = this._yAxis.min;
      let negativesCount: number = 0;
      while (lastNegative + this._yAxis.step <= 0) {
        lastNegative += this._yAxis.step;
        negativesCount++;
      }

      return rect.y + rect.height - (negativesCount * yPhysicalStepSize) - (-lastNegative / this._yAxis.step * yPhysicalStepSize);
    }
    return undefined;
  }
  private getYAxisX(): number | undefined {
    if (this._yAxis.min <= 0 && this._yAxis.min + this._yAxis.step * this._yAxis.numberOfSteps > 0) {
      const rect: Rect = this.getAreaRect();
      const xPhysicalStepSize: number = rect.width / (this._xAxis.numberOfSteps - 1);
      let lastNegative: number = this._xAxis.min;
      let negativesCount: number = 0;
      while (lastNegative + this._xAxis.step <= 0) {
        lastNegative += this._xAxis.step;
        negativesCount++;
      }

      return rect.x + (negativesCount * xPhysicalStepSize) + (-lastNegative / this._xAxis.step * xPhysicalStepSize);
    }
    return undefined;
  }
  private getXAxisViewPath(xAxisY: number): Path {
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
    const subStepLineSize: number = parseInt(this.style.strokeWidth);

    for (let i: number = 0; i < this._xAxis.numberOfSteps; ++i) {
      const x: number = rect.x + (i * xPhysicalStepSize);
      /* pass final step */
      if (i !== this._xAxis.numberOfSteps - 1) {
        /* x sub steps */
        for (let subStep: number = 1; subStep < this._xAxis.linesPerStep + 1; ++subStep) {
          xAxisPath.add(new MoveTo({x: x + subStep * subStepPhysicalSize, y: xAxisY - subStepLineSize}));
          xAxisPath.add(new LineTo({x: x + subStep * subStepPhysicalSize, y: xAxisY + subStepLineSize}));
        }
      }

      xAxisPath.add(new MoveTo({x, y: xAxisY - (subStepLineSize * 2)}));
      xAxisPath.add(new LineTo({x, y: xAxisY + (subStepLineSize * 2)}));
    }

    xAxisPath.addPath(xAxisArrowsPath);
    return xAxisPath;
  }
  private getYAxisViewPath(yAxisX: number): Path {
    const rect: Rect = this.getAreaRect();
    const yPhysicalStepSize: number = rect.height / (this._yAxis.numberOfSteps - 1);

    const yAxisPath: Path = new Path();
    const yAxisArrowsPath: Path = new Path();
    if (yPhysicalStepSize === 0) {
      return yAxisPath;
    }

    /* top arrow */
    yAxisArrowsPath.add(new MoveTo({x: yAxisX, y: this._rect.y}));
    yAxisArrowsPath.add(new LineTo({x: yAxisX - this.ARROW_LENGTH, y: this._rect.y + this.ARROW_LENGTH}));
    yAxisArrowsPath.add(new LineTo({x: yAxisX + this.ARROW_LENGTH, y: this._rect.y + this.ARROW_LENGTH}, true));
    /* bottom arrow */
    yAxisArrowsPath.add(new MoveTo({x: yAxisX, y: this._rect.y + this._rect.height}));
    yAxisArrowsPath.add(new LineTo({x: yAxisX - this.ARROW_LENGTH, y: this._rect.y + this._rect.height - this.ARROW_LENGTH}));
    yAxisArrowsPath.add(new LineTo({x: yAxisX + this.ARROW_LENGTH, y: this._rect.y + this._rect.height - this.ARROW_LENGTH}, true));

    yAxisPath.add(new MoveTo({x: yAxisX, y: this._rect.y + this.ARROW_LENGTH}));
    yAxisPath.add(new LineTo({x: yAxisX, y: this._rect.y + this._rect.height - this.ARROW_LENGTH}));

    /* y steps */
    let currentNumber = this._yAxis.min;
    const subStepPhysicalSize: number = yPhysicalStepSize / (this._yAxis.linesPerStep + 1);
    const subStepLineSize: number = parseInt(this.style.strokeWidth);

    for (let i: number = 0; i < this._yAxis.numberOfSteps; ++i) {
      const y: number = rect.y + rect.height - (i * yPhysicalStepSize);
      /* pass final step */
      if (i !== this._yAxis.numberOfSteps - 1) {
        /* y sub steps */
        for (let subStep: number = 1; subStep < this._yAxis.linesPerStep + 1; ++subStep) {
          yAxisPath.add(new MoveTo({x: yAxisX - subStepLineSize, y: y - subStep * subStepPhysicalSize}));
          yAxisPath.add(new LineTo({x: yAxisX + subStepLineSize, y: y - subStep * subStepPhysicalSize}));
        }
      }

      if (this._yAxis.min + i * this._yAxis.step === 0) {
        currentNumber += this._yAxis.step;
        continue;
      }

      yAxisPath.add(new MoveTo({x: yAxisX - (subStepLineSize * 2), y}));
      yAxisPath.add(new LineTo({x: yAxisX + (subStepLineSize * 2), y}));
    }

    yAxisPath.addPath(yAxisArrowsPath);
    return yAxisPath;
  }

  private showNumbers(xAxisY: number, yAxisX: number): void {
    this.hideNumbers();

    const rect: Rect = this.getAreaRect();
    const xPhysicalStepSize: number = rect.width / (this._xAxis.numberOfSteps - 1);
    const yPhysicalStepSize: number = rect.height / (this._yAxis.numberOfSteps - 1);

    let currentNumber: number = this._xAxis.min;
    const stepLineSize: number = parseInt(this.style.strokeWidth);

    for (let i: number = 0; i < this._xAxis.numberOfSteps; ++i) {
      const x: number = rect.x + (i * xPhysicalStepSize);
      const numberView: TextView = super.xAxisNumber(x, xAxisY, currentNumber);
      if (currentNumber === 0) {
        numberView.__drag__({x: x + 10, y: xAxisY - 5});
      } else {
        numberView.__drag__({x, y: xAxisY + this._numberSize + stepLineSize});
        if (currentNumber < 0) {
          numberView.SVG.style.textAnchor = 'start';
        } else {
          numberView.SVG.style.textAnchor = 'end';
        }
      }
      this.numbersGroup.appendChild(numberView.SVG);
      currentNumber += this._xAxis.step;
    }

    currentNumber = this._yAxis.min;
    for (let i: number = 0; i < this._yAxis.numberOfSteps; ++i) {
      const y: number = rect.y + rect.height - (i * yPhysicalStepSize);
      if (currentNumber !== 0) {
        const numberView: TextView = this.yAxisNumber(y, yAxisX, currentNumber);
        if (currentNumber < 0) {
          numberView.__drag__({x: yAxisX - 10 - stepLineSize, y: y + 10});
        } else {
          numberView.__drag__({x: yAxisX - 10 - stepLineSize, y});
        }
        numberView.SVG.style.textAnchor = 'end';
        this.numbersGroup.appendChild(numberView.SVG);
      }
      currentNumber += this._yAxis.step;
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
  public get yAxisModel(): Axis {
    return this._yAxis;
  }
  public get gridModel(): Grid {
    return this._grid;
  }
  public get graphics(): {f: (x: number) => number; style: Style}[] {
    return this._graphics;
  }

  public edit(xAxis: Axis, yAxis: Axis, grid: Grid, numberSize: number, showNumbers?: boolean, showBorder?: boolean, call: boolean = true): void {
    if ( /* return if nothing changed */
      JSON.stringify(this._xAxis) === JSON.stringify(xAxis) &&
      JSON.stringify(this._yAxis) === JSON.stringify(yAxis) &&
      JSON.stringify(this._grid) === JSON.stringify(grid) &&
      this._numbersVisible === showNumbers &&
      this._borderVisible === showBorder &&
      this._numberSize === numberSize
    ) {
      return;
    }

    this._xAxis = xAxis;
    this._yAxis = yAxis;
    this._grid = grid;
    this._numberSize = numberSize;

    if (showNumbers !== undefined) {
      this._numbersVisible = showNumbers;
    }
    if (showBorder !== undefined) {
      this._borderVisible = showBorder;
    }

    this.__updateView__();
    if (call) {
      this._container.__call__(SVGEvent.COORDINATE_PLANE2_EDITED, {element: this});
    }
  }

  private createGraphicPath(graphic: {f: (value: number) => any; style: Style}, xPhysicalStepSize: number, yPhysicalStepSize: number, rect: Rect, xAxis: Axis, yAxis: Axis): PathView {
    const path: Path = new Path();
    const max: number = xAxis.min + xAxis.step * (xAxis.numberOfSteps - 1);

    let yWasInVisibleArea: boolean = false;
    const y: number = graphic.f(xAxis.min);
    const point: Point = {
      x: rect.x + ((xAxis.min - xAxis.min) / xAxis.step) * xPhysicalStepSize,
      y: rect.y + rect.height - (((y - yAxis.min) / yAxis.step) * yPhysicalStepSize)
    };

    if (point.y >= rect.y && point.y <= rect.height) { /* in visible area */
      path.add(new MoveTo(point));
      yWasInVisibleArea = true;
    }
    path.add(new MoveTo(point));

    for (let x: number = xAxis.min; x < max; x += 0.1) {
      const _y: number = graphic.f(x);
      const _point: Point = {
        x: rect.x + ((x - xAxis.min) / xAxis.step) * xPhysicalStepSize,
        y: rect.y + rect.height - (((_y - yAxis.min) / yAxis.step) * yPhysicalStepSize)
      };
      const topBorder: number = rect.y;
      const bottomBorder: number = rect.y + rect.height;

      if (!yWasInVisibleArea && _point.y >= topBorder && _point.y <= bottomBorder) { /* from not visible area to visible area */
        path.add(new MoveTo(_point));
        yWasInVisibleArea = true;
      } else if (yWasInVisibleArea && _point.y < topBorder || _point.y > bottomBorder) { /* from visible area to not visible area */
        yWasInVisibleArea = false;
      } else if (!yWasInVisibleArea && _point.y < topBorder || _point.y > bottomBorder) { /* in not visible area */

      } else if (yWasInVisibleArea && _point.y >= topBorder && _point.y <= bottomBorder) { /* in visible area */
        path.add(new LineTo(_point));
      }
    }

    const pathView: PathView = new PathView(this._container, {overEvent: false, globalStyle: false}, path);
    pathView.style.set = graphic.style;
    return pathView;
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
    json.yAxis = Object.assign({}, this._yAxis);
    json.grid = Object.assign({}, this._grid);
    json.numberSize = this._numberSize;
    json.showNumbers = this._numbersVisible;
    json.showBorder = this._borderVisible;
    json.graphics = [];
    for (const graphic of this._graphics) {
      json.graphics.push({
        f: graphic.f.toString(),
        style: graphic.style
      });
    }
    return json;
  }
  public override fromJSON(json: any): void {
    super.fromJSON(json);
    this._graphics = [];
    for (const graphic of json.graphics) {
      this._graphics.push({
        // eslint-disable-next-line no-eval
        f: eval(graphic.f),   // MUST BE MANUALLY DESERIALIZED
        style: graphic.style
      });
    }
    this.edit(json.xAxis, json.yAxis, json.grid, json.numberSize, json.showNumbers, json.showBorder, false);
  }
}
