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
import {Style} from '../../../service/style/Style';
import {RectangleView} from '../../shape/pointed/polygon/rectangle/RectangleView';
import {SVGEvent} from "../../../dataSource/constant/SVGEvent";

export class CoordinatePlane2Cursor extends ElementCursor {}

export interface CoordinatePlane2Properties extends ElementProperties {}

interface Axis {
  label: string;
  min: number;
  step: number;
  numberOfSteps: number;
  linesPerStep: number;
}
interface Grid {
  show: boolean;
  byX: number;
  byY: number;
}

export class CoordinatePlaneView2 extends ComplexView implements MoveDrawable {
  protected _type: ElementType = ElementType.COORDINATE_PLANE2;
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'g');
  public override rotatable = false;

  private readonly borderView: RectangleView;
  private readonly numbersGroup: SVGGElement;
  private readonly graphicsGroup: SVGGElement;
  private readonly gridGroup: SVGGElement;
  private readonly axisGroup: SVGGElement;

  private xAxis: Axis;
  private yAxis: Axis;
  private grid: Grid;

  private _graphics: {f: (value: number) => any; style: Style}[] = [];

  private readonly ARROW_LENGTH = 5;
  private readonly ARROW_MARGIN = 5;

  constructor(container: Container,
              properties: CoordinatePlane2Properties = {},
              rect: Rect = {x: 0, y: 0, width: 1, height: 1},
              xAxis: Axis = {label: 'X', min: -10, step: 1, numberOfSteps: 20, linesPerStep: 0},
              yAxis: Axis = {label: 'Y', min: -10, step: 1, numberOfSteps: 20, linesPerStep: 0},
              grid: Grid = {show: false, byX: 1, byY: 1},
              graphics: {f: (value: number) => any; style: Style}[] = [],
              ownerId?: string,
              index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;
    this._rect = rect;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.grid = grid;
    this._graphics = graphics;

    this.numbersGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.numbersGroup.style.shapeRendering = 'optimizespeed';
    this.graphicsGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.graphicsGroup.style.shapeRendering = 'optimizespeed';
    this.gridGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.gridGroup.style.shapeRendering = 'optimizespeed';
    this.axisGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.axisGroup.style.shapeRendering = 'optimizespeed';

    this.borderView = new RectangleView(this._container, {overEvent: false, globalStyle: false});
    this.borderView.SVG.style.shapeRendering = 'optimizespeed';
    this.borderView.style.strokeColor = '#bfbfbf';
    this.borderView.style.strokeWidth = '1';

    this.svgElement.appendChild(this.borderView.SVG);
    this.svgElement.appendChild(this.gridGroup);
    this.svgElement.appendChild(this.numbersGroup);
    this.svgElement.appendChild(this.graphicsGroup);
    this.svgElement.appendChild(this.axisGroup);

    this.__updateView__();
    this.setProperties(properties);
  }

  public addGraphic(graphic: {f: (value: number) => any; style: Style}) {
    for (const _graphic of this._graphics) {
      if ('' + _graphic.f === '' + graphic.f) { /* if already contains this function */
        return;
      }
    }

    this._graphics.push(graphic);
    this.__updateView__();
  }
  public removeGraphic(graphic: {f: (value: number) => any; style: Style}) {
    for (let i = 0; i < this._graphics.length; ++i) {
      if ('' + this._graphics[i].f === '' + graphic.f) { /* if already contains this function */
        this._graphics.splice(i, 1);
        this.__updateView__();
        break;
      }
    }
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
    this.graphicsGroup.innerHTML = '';
    this.gridGroup.innerHTML = '';
    this.axisGroup.innerHTML = '';
    const rect = { /* rect without arrow and arrow margin */
      x: this._rect.x + this.ARROW_LENGTH + this.ARROW_MARGIN,
      y: this._rect.y + this.ARROW_LENGTH + this.ARROW_MARGIN,
      width: this._rect.width - (this.ARROW_LENGTH + this.ARROW_MARGIN) * 2,
      height: this._rect.height - (this.ARROW_LENGTH + this.ARROW_MARGIN) * 2
    };

    const xPhysicalStepSize = rect.width / this.xAxis.numberOfSteps;
    const yPhysicalStepSize = rect.height / this.yAxis.numberOfSteps;
    let xAxisY;
    let yAxisX;
    let numberView;
    let currentNumber;

    if (this.xAxis.min <= 0 && this.xAxis.min + this.xAxis.step * this.xAxis.numberOfSteps > 0) {
      let lastNegative = this.xAxis.min;
      let negativesCount = 0;
      while (lastNegative + this.xAxis.step <= 0) {
        lastNegative += this.xAxis.step;
        negativesCount++;
      }

      yAxisX = rect.x + (negativesCount * xPhysicalStepSize) + (-lastNegative / this.xAxis.step * xPhysicalStepSize);
    }
    if (this.yAxis.min <= 0 && this.yAxis.min + this.yAxis.step * this.yAxis.numberOfSteps > 0) {
      let lastNegative = this.yAxis.min;
      let negativesCount = 0;
      while (lastNegative + this.yAxis.step <= 0) {
        lastNegative += this.yAxis.step;
        negativesCount++;
      }

      xAxisY = rect.y + rect.height - (negativesCount * yPhysicalStepSize) - (-lastNegative / this.yAxis.step * yPhysicalStepSize);
    }

    if (xAxisY) {
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

      /* x steps */
      currentNumber = this.xAxis.min;
      for (let i = 0; i < this.xAxis.numberOfSteps; ++i) {
        const x = rect.x + (i * xPhysicalStepSize);
        const subStepPhysicalSize = xPhysicalStepSize / (this.xAxis.linesPerStep + 1);
        /* x sub steps */
        for (let subStep = 1; subStep < this.xAxis.linesPerStep + 1; ++subStep) {
          xAxisPath.add(new MoveTo({x: x + subStep * subStepPhysicalSize, y: xAxisY - 2}));
          xAxisPath.add(new LineTo({x: x + subStep * subStepPhysicalSize, y: xAxisY + 2}));
        }

        if (this.xAxis.min + i * this.xAxis.step === 0) {
          currentNumber += this.xAxis.step;
          continue;
        }

        xAxisPath.add(new MoveTo({x, y: xAxisY - 5}));
        xAxisPath.add(new LineTo({x, y: xAxisY + 5}));
        if (currentNumber !== 0) {
          numberView = new TextView(this._container);
          numberView.__drag__({x, y: xAxisY - 5});
          numberView.style.fontSize = '10';
          numberView.style.strokeWidth = '1';
          numberView.text = currentNumber + '';
          this.numbersGroup.appendChild(numberView.SVG);
        }
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
    }

    if (yAxisX) {
      const yAxisPath = new Path();
      const yAxisArrowsPath = new Path();
      if (yPhysicalStepSize === 0) {
        return;
      }

      const yAxisLabel = new TextView(
        this._container,
        {overEvent: false, globalStyle: false},
        undefined,
        this.yAxis.label
      );
      yAxisLabel.__drag__({x: yAxisX - 15, y: this._rect.y + 15});
      yAxisLabel.style.fontSize = '10';
      yAxisLabel.style.strokeWidth = '1';
      this.numbersGroup.appendChild(yAxisLabel.SVG);

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
      currentNumber = this.yAxis.min;
      for (let i = 0; i < this.yAxis.numberOfSteps; ++i) {
        const y = rect.y + rect.height - (i * yPhysicalStepSize);
        const subStepPhysicalSize = yPhysicalStepSize / (this.yAxis.linesPerStep + 1);
        /* y sub steps */
        for (let subStep = 1; subStep < this.yAxis.linesPerStep + 1; ++subStep) {
          yAxisPath.add(new MoveTo({x: yAxisX - 2, y: y - subStep * subStepPhysicalSize}));
          yAxisPath.add(new LineTo({x: yAxisX + 2, y: y - subStep * subStepPhysicalSize}));
        }

        if (this.yAxis.min + i * this.yAxis.step === 0) {
          currentNumber += this.yAxis.step;
          continue;
        }

        yAxisPath.add(new MoveTo({x: yAxisX - 5, y}));
        yAxisPath.add(new LineTo({x: yAxisX + 5, y}));
        if (currentNumber !== 0) {
          numberView = new TextView(this._container);
          numberView.__drag__({x: yAxisX + 5, y});
          numberView.style.fontSize = '10';
          numberView.style.strokeWidth = '1';
          numberView.text = currentNumber + '';
          this.numbersGroup.appendChild(numberView.SVG);
        }
        currentNumber += this.yAxis.step;
      }

      const yAxisPathView = new PathView(this._container);
      yAxisPathView.style.strokeWidth = '1';
      yAxisPathView.style.fillColor = '#000000';
      yAxisPathView.path = yAxisPath;
      this.axisGroup.appendChild(yAxisPathView.SVG);

      const yAxisArrowsPathView = new PathView(this._container);
      yAxisArrowsPathView.style.strokeWidth = '0';
      yAxisArrowsPathView.style.fillColor = '#000000';
      yAxisArrowsPathView.path = yAxisArrowsPath;
      this.axisGroup.appendChild(yAxisArrowsPathView.SVG);
    }

    /* grid */
    const gridPath = new Path();
    const gridPathView = new PathView(this._container, {overEvent: false, globalStyle: false});

    if (this.grid.show) {
      const realXAxisMin = this.xAxis.min - Math.floor((this.ARROW_LENGTH + this.ARROW_MARGIN) / xPhysicalStepSize) * this.xAxis.step;
      const realXNumberOfSteps = (
          (this._rect.x + this._rect.width) -
          (rect.x + ((realXAxisMin - this.xAxis.min) / this.xAxis.step) * xPhysicalStepSize)
        ) / xPhysicalStepSize;
      for (let i = realXAxisMin; i < realXAxisMin + realXNumberOfSteps * this.xAxis.step; i += this.grid.byX) {
        const x = rect.x + ((i - this.xAxis.min) / this.xAxis.step) * xPhysicalStepSize;
        gridPath.add(new MoveTo({x, y: this._rect.y}));
        gridPath.add(new LineTo({x, y: this._rect.y + this._rect.height}));
      }

      const realYAxisMin = this.yAxis.min - Math.floor((this.ARROW_LENGTH + this.ARROW_MARGIN) / yPhysicalStepSize) * this.yAxis.step;
      const realYNumberOfSteps = (
        (rect.y + rect.height - ((realYAxisMin - this.yAxis.min) / this.yAxis.step) * yPhysicalStepSize)
        - this._rect.y
      ) / yPhysicalStepSize;
      for (let i = realYAxisMin; i < realYAxisMin + realYNumberOfSteps * this.yAxis.step; i += this.grid.byY) {
        const y = rect.y + rect.height - (((i - this.yAxis.min) / this.yAxis.step) * yPhysicalStepSize);
        gridPath.add(new MoveTo({x: this._rect.x, y}));
        gridPath.add(new LineTo({x: this._rect.x + this._rect.width, y}));
      }
    }
    gridPathView.path = gridPath;
    gridPathView.style.strokeWidth = '1';
    gridPathView.style.strokeColor = '#bfbfbf';
    this.gridGroup.appendChild(gridPathView.SVG);

    /* graphics */
    this._graphics.forEach(graphic => {
      if (this.yAxis && yPhysicalStepSize) {
        this.graphicsGroup.appendChild(this.createGraphicPath(graphic, xPhysicalStepSize, yPhysicalStepSize, rect, this.xAxis, this.yAxis).SVG);
      }
    });

    this.borderView.__drawSize__(this._rect);
  }

  public get xAxisModel() {
    return this.xAxis;
  }
  public get yAxisModel() {
    return this.yAxis;
  }
  public get gridModel() {
    return this.grid;
  }
  public get graphics() {
    return this._graphics;
  }

  public edit(xAxis: Axis, yAxis: Axis, grid: Grid, call: boolean = true) {
    if ( /* return if nothing changed */
      JSON.stringify(this.xAxis) === JSON.stringify(xAxis) &&
      JSON.stringify(this.yAxis) === JSON.stringify(yAxis) &&
      JSON.stringify(this.grid) === JSON.stringify(grid)
    ) {
      return;
    }

    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.grid = grid;
    this.__updateView__();
    if (call) {
      this._container.__call__(SVGEvent.COORDINATE_PLANE2_EDITED, {element: this});
    }
  }

  private createGraphicPath(graphic: {f: (value: number) => any; style: Style}, xPhysicalStepSize: number, yPhysicalStepSize: number, rect: Rect, xAxis: Axis, yAxis: Axis): PathView {
    const path = new Path();
    const max = xAxis.min + xAxis.step * xAxis.numberOfSteps;

    let yWasInVisibleArea = false;
    const y = graphic.f(xAxis.min);
    const point = {
      x: rect.x + ((xAxis.min - xAxis.min) / xAxis.step) * xPhysicalStepSize,
      y: rect.y + rect.height - (((y - yAxis.min) / yAxis.step) * yPhysicalStepSize)
    };

    if (point.y >= rect.y && point.y <= rect.height) { /* in visible area */
      path.add(new MoveTo(point));
      yWasInVisibleArea = true;
    }
    path.add(new MoveTo(point));

    for (let x = xAxis.min; x < max; x += 0.1) {
      const _y = graphic.f(x);
      const _point = {
        x: rect.x + ((x - xAxis.min) / xAxis.step) * xPhysicalStepSize,
        y: rect.y + rect.height - (((_y - yAxis.min) / yAxis.step) * yPhysicalStepSize)
      };
      const topBorder = rect.y;
      const bottomBorder = rect.y + rect.height;

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

    const pathView = new PathView(this._container, {overEvent: false, globalStyle: false}, path);
    pathView.style.set = graphic.style;
    return pathView;
  }

  public isComplete(): boolean {
    return this._rect.width > 10 && this._rect.height > 10;
  }

  public toPath(): PathView {
    return new PathView(this._container);
  }

  public override fromJSON(json: any) {
    super.fromJSON(json);
    this._graphics = [];
    for (const graphic of json.graphics) {
      this._graphics.push({
        // eslint-disable-next-line no-eval
        f: eval(graphic.f),   // MUST BE MANUALLY DESERIALIZED
        style: graphic.style
      });
    }
    this.edit(json.xAxis, json.yAxis, json.grid, false);
  }

  public override toJSON(): any {
    const json = super.toJSON();
    json.xAxis = Object.assign({}, this.xAxis);
    if (this.yAxis) {
      json.yAxis = Object.assign({}, this.yAxis);
    }
    json.grid = Object.assign({}, this.grid);
    json.graphics = [];
    for (const graphic of this._graphics) {
      json.graphics.push({
        f: graphic.f.toString(),
        style: graphic.style
      });
    }
    return json;
  }
}
