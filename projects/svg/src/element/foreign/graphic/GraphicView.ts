import {Rect} from "../../../model/Rect";
import {Point} from "../../../model/Point";
import {PathView} from "../../shape/PathView";
import {ElementCursor, ElementView} from "../../ElementView";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ComplexView} from "../../type/ComplexView";
import {LineTo} from "../../../model/path/line/LineTo";
import {MoveTo} from "../../../model/path/point/MoveTo";
import {Path} from "../../../model/path/Path";
import {Container} from "../../../Container";
import {RectangleView} from "../../shape/pointed/polygon/rectangle/RectangleView";
import {TextView} from "../text/TextView";

export class GraphicCursor extends ElementCursor {}

interface FunctionGraphic {
  color: string,
  width: number,
  pathView: PathView
}

export class GraphicView extends ComplexView implements MoveDrawable {
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "svg");
  protected override _type: ElementType = ElementType.GRAPHIC;

  /* Model */
  private _graphics: Map<Function, FunctionGraphic> = new Map<Function, FunctionGraphic>();
  private _xAxisPathView: PathView;
  private _yAxisPathView: PathView;
  private _backgroundView: RectangleView;
  private readonly _axisGroup: SVGGElement;
  private readonly _numbersGroup: SVGGElement;
  private readonly _graphicGroup: SVGGElement;
  public override rotatable: boolean = false;

  private _center: Point; /* relative to graphic */
  private _lastCenter: Point; /* relative to graphic */
  private _logicalStepUnit: number = 1;
  private _physicalUnitDeltaStep: number = 20;
  private _physicalUnit: number = 60;                  // px - CHANGING on zoom
  private readonly _minPhysicalUnit: number = 40;      // px
  private readonly _maxPhysicalUnit: number = 120;     // px

  public showAxis: boolean = true;
  public showAxisSteps: boolean = true;
  public showAxisNumbers: boolean = true;

  private readonly STEP_VIEW_SIZE = 5;
  private readonly SUB_STEP_VIEW_SIZE = 2;
  private readonly SUB_STEP_COUNT = 5;
  private readonly X_AXIS_COLOR = "#0000FF";
  private readonly Y_AXIS_COLOR = "#FF0000";
  private readonly NUMBER_FONT_SIZE = "10";
  /* Model */

  /**
   * @param container Container element that should contain this ElementView
   * @param properties Simple object for element modification before creating {setOverEvent: boolean, setDefaultStyle: boolean}
   * @param rect this element bounding box size
   * @param ownerId This element owner id. if not set, will get owner id of Container
   * @param index This element index. If not set, will generate new numerical value
   * */
  public constructor(container: Container,
                     properties: any = {},
                     rect: Rect = {x: 0, y: 0, width: 1, height: 1},
                     ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;
    this._center = {x: 0, y: 0};
    this._lastCenter = {x: 0, y: 0};
    this._rect = rect;

    this._numbersGroup = document.createElementNS(ElementView.svgURI, "g");
    this._numbersGroup.id = "numbers";
    this._axisGroup = document.createElementNS(ElementView.svgURI, "g");
    this._axisGroup.id = "axis";
    this._graphicGroup = document.createElementNS(ElementView.svgURI, "g");
    this._graphicGroup.id = "graphic";

    this._backgroundView = new RectangleView(this._container, {overEvent: false, globalStyle: true}, rect);
    this._backgroundView.style.fillColor = "none";
    this._backgroundView.style.strokeColor = "none";
    this._backgroundView.style.strokeWidth = "0";

    this._xAxisPathView = new PathView(this._container);
    this._xAxisPathView.style.strokeWidth = "1";
    this._xAxisPathView.style.strokeColor = this.X_AXIS_COLOR;
    this._xAxisPathView.style.fillColor = "none";
    this._xAxisPathView.path = this.createXAxis(true);
    this._xAxisPathView.SVG.style.shapeRendering = "optimizeSpeed";

    this._yAxisPathView = new PathView(this._container);
    this._yAxisPathView.style.strokeWidth = "1";
    this._yAxisPathView.style.strokeColor = this.Y_AXIS_COLOR;
    this._yAxisPathView.style.fillColor = "none";
    this._yAxisPathView.path = this.createYAxis(true);
    this._yAxisPathView.SVG.style.shapeRendering = "optimizeSpeed";

    this._axisGroup.appendChild(this._xAxisPathView.SVG);
    this._axisGroup.appendChild(this._yAxisPathView.SVG);

    this.svgElement.appendChild(this._backgroundView.SVG);
    this.svgElement.appendChild(this._numbersGroup);
    this.svgElement.appendChild(this._axisGroup);
    this.svgElement.appendChild(this._graphicGroup);

    this.__updateView__();

    this.setProperties(properties);
  }

  protected __updateView__(): void {
    this._backgroundView.__drawSize__({x: 0, y: 0, width: this._rect.width, height: this._rect.height});

    if (this.showAxis) {
      this._xAxisPathView.path = this.createXAxis(this.showAxisSteps);
      this._yAxisPathView.path = this.createYAxis(this.showAxisSteps);
      if (this.showAxisNumbers) {
        this.addAxisNumbers();
      } else {
        this.removeAxisNumbers();
      }
    } else {
      this._xAxisPathView.path = new Path();
      this._yAxisPathView.path = new Path();
    }

    this._graphics.forEach((functionGraphic: FunctionGraphic, f: Function) => {
      functionGraphic.pathView.path = this.createGraphic(f);
    });

    this.setAttr({
      x: this._rect.x,
      y: this._rect.y,
      width: this._rect.width,
      height: this._rect.height
    });
  }

  public zoomIn() {
    this._physicalUnit += this._physicalUnitDeltaStep;
     if (this._physicalUnit > this._maxPhysicalUnit) {
      this._physicalUnit = this._minPhysicalUnit + this._physicalUnitDeltaStep;
      this._logicalStepUnit /= this._maxPhysicalUnit / this._minPhysicalUnit;
    }
    this.__updateView__();
  }
  public zoomOut() {
    this._physicalUnit -= this._physicalUnitDeltaStep;
    if (this._physicalUnit <= this._minPhysicalUnit) {
      this._physicalUnit = this._maxPhysicalUnit - this._physicalUnitDeltaStep;
      this._logicalStepUnit *= this._maxPhysicalUnit / this._minPhysicalUnit;
    }
    this.__updateView__();
  }


  private createXAxis(steps: boolean = false): Path {
    let path = new Path();
    path.add(new MoveTo({x: 0, y: this._center.y}));
    path.add(new LineTo({x: this._rect.width, y: this._center.y}));

    /* left arrow */
    path.add(new MoveTo({x: this.STEP_VIEW_SIZE * 2, y: this._center.y - this.STEP_VIEW_SIZE * 2}));
    path.add(new LineTo({x: 0, y: this._center.y}));
    path.add(new LineTo({x: this.STEP_VIEW_SIZE * 2, y: this._center.y + this.STEP_VIEW_SIZE * 2}));
    /* right arrow */
    path.add(new MoveTo({x: this._rect.width - this.STEP_VIEW_SIZE * 2, y: this._center.y - this.STEP_VIEW_SIZE * 2}));
    path.add(new LineTo({x: this._rect.width, y: this._center.y}));
    path.add(new LineTo({x: this._rect.width - this.STEP_VIEW_SIZE * 2, y: this._center.y + this.STEP_VIEW_SIZE * 2}));

    if (steps) {
      /* positive x-axis steps */
      for (let x = this._center.x + this._physicalUnit; x < this._rect.width + this._physicalUnit; x += this._physicalUnit) {
        path.add(new MoveTo({
          x: x, y: this._center.y - this.STEP_VIEW_SIZE
        }));
        path.add(new LineTo({
          x: x, y: this._center.y + this.STEP_VIEW_SIZE
        }));

        /* positive x-axis sub steps */
        let subStepDelta = this._physicalUnit / this.SUB_STEP_COUNT;
        let previousStep = x - this._physicalUnit;
        for (let subX = previousStep + subStepDelta; subX < x; subX += subStepDelta) {
          path.add(new MoveTo({
            x: subX, y: this._center.y - this.SUB_STEP_VIEW_SIZE
          }));
          path.add(new LineTo({
            x: subX, y: this._center.y + this.SUB_STEP_VIEW_SIZE
          }));
        }
      }

      /* negative x-axis steps */
      for (let x = this._center.x - this._physicalUnit; x >= 0 - this._physicalUnit; x -= this._physicalUnit) {
        path.add(new MoveTo({
          x: x, y: this._center.y - this.STEP_VIEW_SIZE
        }));
        path.add(new LineTo({
          x: x, y: this._center.y + this.STEP_VIEW_SIZE
        }));

        /* negative x-axis sub steps */
        let subStepDelta = this._physicalUnit / this.SUB_STEP_COUNT;
        let previousStep = x + this._physicalUnit;
        for (let subX = previousStep - subStepDelta; subX > x; subX -= subStepDelta) {
          path.add(new MoveTo({
            x: subX, y: this._center.y - this.SUB_STEP_VIEW_SIZE
          }));
          path.add(new LineTo({
            x: subX, y: this._center.y + this.SUB_STEP_VIEW_SIZE
          }));
        }
      }
    }
    return path;
  }
  private createYAxis(steps: boolean = false): Path {
    let path = new Path();
    path.add(new MoveTo({x: this._center.x, y: 0}));
    path.add(new LineTo({x: this._center.x, y: this._rect.height}));

    /* top arrow */
    path.add(new MoveTo({x: this._center.x - this.STEP_VIEW_SIZE * 2, y: this.STEP_VIEW_SIZE * 2}));
    path.add(new LineTo({x: this._center.x, y: 0}));
    path.add(new LineTo({x: this._center.x + this.STEP_VIEW_SIZE * 2, y: this.STEP_VIEW_SIZE * 2}));
    /* bottom arrow */
    path.add(new MoveTo({x: this._center.x - this.STEP_VIEW_SIZE * 2, y: this._rect.height - this.STEP_VIEW_SIZE * 2}));
    path.add(new LineTo({x: this._center.x, y: this._rect.height}));
    path.add(new LineTo({x: this._center.x + this.STEP_VIEW_SIZE * 2, y: this._rect.height - this.STEP_VIEW_SIZE * 2}));

    if (steps) {
      for (let y = this._center.y - this._physicalUnit; y >= 0 - this._physicalUnit; y -= this._physicalUnit) {
        /* positive y-axis steps */
        path.add(new MoveTo({
          x: this._center.x - this.STEP_VIEW_SIZE, y: y
        }));
        path.add(new LineTo({
          x: this._center.x + this.STEP_VIEW_SIZE, y: y
        }));

        /* positive y-axis sub steps */
        let subStepDelta = this._physicalUnit / this.SUB_STEP_COUNT;
        let previousStep = y + this._physicalUnit;
        for (let subY = previousStep - subStepDelta; subY > y; subY -= subStepDelta) {
          path.add(new MoveTo({
            x: this._center.x - this.SUB_STEP_VIEW_SIZE, y: subY
          }));
          path.add(new LineTo({
            x: this._center.x + this.SUB_STEP_VIEW_SIZE, y: subY
          }));
        }
      }

      /* negative y-axis steps */
      for (let y = this._center.y + this._physicalUnit; y < this._rect.height + this._physicalUnit; y += this._physicalUnit) {
        path.add(new MoveTo({
          x: this._center.x - this.STEP_VIEW_SIZE, y: y
        }));
        path.add(new LineTo({
          x: this._center.x + this.STEP_VIEW_SIZE, y: y
        }));

        /* negative y-axis sub steps */
        let subStepDelta = this._physicalUnit / this.SUB_STEP_COUNT;
        let previousStep = y - this._physicalUnit;
        for (let subY = previousStep + subStepDelta; subY < y; subY += subStepDelta) {
          path.add(new MoveTo({
            x: this._center.x - this.SUB_STEP_VIEW_SIZE, y: subY
          }));
          path.add(new LineTo({
            x: this._center.x + this.SUB_STEP_VIEW_SIZE, y: subY
          }));
        }
      }
    }

    return path;
  }
  private createAxisNumber(x: number, y: number, number: number, color: string): TextView {
    let visibleNumber: any = Math.round(number * 1_000_000) / 1_000_000;
    if (Math.abs(visibleNumber) <= 0.000001 || Math.abs(visibleNumber) > 999_999) {
      visibleNumber = number.toExponential(4);
    }

    let numberText = new TextView(this._container, {}, {x: x + 3, y: y - 3, width: 0, height: 0}, visibleNumber + "");
    numberText.style.fillColor = color;
    numberText.style.fontSize = this.NUMBER_FONT_SIZE;
    return numberText;
  }
  private addAxisNumbers(): void {
    this._numbersGroup.innerHTML = "";
    let number = this._logicalStepUnit;
    for (let x = this._center.x + this._physicalUnit; x < this._rect.width + this._physicalUnit; x += this._physicalUnit) {
      /* positive x-axis numbers */
      this._numbersGroup.appendChild(this.createAxisNumber(x, this._center.y, number, this.X_AXIS_COLOR).SVG);
      number += this._logicalStepUnit;
    }

    number = -this._logicalStepUnit;
    for (let x = this._center.x - this._physicalUnit; x >= 0 - this._physicalUnit; x -= this._physicalUnit) {
      /* negative x-axis numbers */
      this._numbersGroup.appendChild(this.createAxisNumber(x, this._center.y, number, this.X_AXIS_COLOR).SVG);
      number -= this._logicalStepUnit;
    }

    number = this._logicalStepUnit;
    for (let y = this._center.y - this._physicalUnit; y >= 0 - this._physicalUnit; y -= this._physicalUnit) {
      /* positive y-axis numbers */
      this._numbersGroup.appendChild(this.createAxisNumber(this._center.x, y, number, this.Y_AXIS_COLOR).SVG);
      number += this._logicalStepUnit;
    }

    number = -this._logicalStepUnit;
    for (let y = this._center.y + this._physicalUnit; y < this._rect.height + this._physicalUnit; y += this._physicalUnit) {
      /* negative y-axis numbers */
      this._numbersGroup.appendChild(this.createAxisNumber(this._center.x, y, number, this.Y_AXIS_COLOR).SVG);
      number -= this._logicalStepUnit;
    }
  }
  private removeAxisNumbers(): void {
    this._numbersGroup.innerHTML = "";
  }
  private createGraphic(f: Function): Path {
    let path = new Path();
    let widthByUnit = (this._rect.width / this._physicalUnit) * this._logicalStepUnit;
    let centerXByUnit = (this._center.x / this._physicalUnit) * this._logicalStepUnit;
    let minX = -centerXByUnit;
    let maxX = widthByUnit - centerXByUnit;
    let step = 0.01 * this._logicalStepUnit;

    let yWasInVisibleArea: boolean = false;
    let point = {
      x: minX * this._physicalUnit / this._logicalStepUnit + this._center.x,
      y: -f(minX) * this._physicalUnit / this._logicalStepUnit + this._center.y
    };
    if (point.y >= 0 && point.y <= this._rect.height) { /* in visible area */
      path.add(new MoveTo(point));
      yWasInVisibleArea = true;
    }

    for (let x = minX; x < maxX; x += step) {
      let point = {
        x: x * this._physicalUnit / this._logicalStepUnit + this._center.x,
        y: -f(x) * this._physicalUnit / this._logicalStepUnit + this._center.y
      };


      if (!yWasInVisibleArea && point.y >= 0 && point.y <= this._rect.height) { /* from not visible area to visible area */
        path.add(new MoveTo(point));
        yWasInVisibleArea = true;
      } else if (yWasInVisibleArea && point.y < 0 || point.y > this._rect.height) { /* from visible area to not visible area */
        yWasInVisibleArea = false;
      } else if (!yWasInVisibleArea && point.y < 0 || point.y > this._rect.height) { /* in not visible area */

      } else if (yWasInVisibleArea && point.y >= 0 && point.y <= this._rect.height) { /* in visible area */
        path.add(new LineTo(point));
      }

    }
    return path;
  }
  public addFunction(f: Function, color: string = "#00000099", width: number = 2) {
    let graphicView = new PathView(this._container, {overEvent: true, globalStyle: false}, this.createGraphic(f));
    graphicView.style.fillColor = "none";
    graphicView.style.strokeColor = color;
    graphicView.style.strokeWidth = width + "";

    this._graphicGroup.appendChild(graphicView.SVG);
    this._graphics.set(f, {
      color: color, width: width, pathView: graphicView
    });
  }
  public removeFunction(f: Function) {
    let functionGraphic = this._graphics.get(f);
    if(functionGraphic) {
      this._graphicGroup.removeChild(functionGraphic.pathView.SVG);
    }
    this._graphics.delete(f);
  }

  public get copy(): GraphicView { /* TODO */
    return new GraphicView(this._container);
  }

  public override get points(): Point[] {
    let points = super.points;
    points.push(this.center)
    return points;
  }

  override __translate__(delta: Point) {
    this.setAttr({
      x: this._lastRect.x + delta.x,
      y: this._lastRect.y + delta.y
    });
  }
  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__translate__(delta);
  }

  public __dragCenter__(delta: Point): void {
    this._center.x = this._lastCenter.x + delta.x;
    this._center.y = this._lastCenter.y + delta.y;
    this.__updateView__();
  }

  public dragCenter(delta: Point): void {
    this.__fixRect__();
    this.__dragCenter__(delta);
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
    this._center = {
      x: rect.width / 2,
      y: rect.height / 2
    }
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
    // this._center.x = this._lastCenter.x * (this._rect.width / this._lastRect.width);
    // this._center.y = this._lastCenter.y * (this._rect.height / this._lastRect.height);

    this.__updateView__();
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point) {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;
    this.__drag__(delta);
  }

  public override __fixRect__() {
    super.__fixRect__();
    this._lastCenter = Object.assign({}, this._center);
  }

  public isComplete(): boolean {
    return this._rect.width >= 50 && this._rect.height >= 30;
  }

  public toPath(): PathView {
    let pathView = new PathView(this._container, this._properties);
    this._graphics.forEach((functionGraphic: FunctionGraphic, f: Function) => {
      pathView.addPath(functionGraphic.pathView.path);
    });
    pathView.addPath(this._xAxisPathView.path);
    pathView.addPath(this._yAxisPathView.path);
    return pathView;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json.graphics = {};
    this._graphics.forEach((functionGraphic: FunctionGraphic, f: Function) => {
      json.graphics[f.toString()] = {
        color: functionGraphic.color,
        width: functionGraphic.width
      };
    });
    json.center = this._center;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    for (let f in json.graphics) {
      this.addFunction(eval(f), json.graphics[f].color, json.graphics[f].width);
    }
    this.__dragCenter__(json.center);
    this.__updateView__();
  };

}
