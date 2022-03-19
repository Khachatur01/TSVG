import {ForeignView} from "../../type/ForeignView";
import {Rect} from "../../../model/Rect";
import {Point} from "../../../model/Point";
import {Size} from "../../../model/Size";
import {PathView} from "../../shape/pointed/polyline/PathView";
import {TSVG} from "../../../TSVG";
import {ElementView} from "../../ElementView";
import {Path} from "../../../model/path/Path";
import {MoveTo} from "../../../model/path/point/MoveTo";
import {LineTo} from "../../../model/path/line/LineTo";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {Matrix} from "../../../service/math/Matrix";
import {ElementType} from "../../../dataSource/constant/ElementType";

interface Graphic {
  path: PathView;
  color: string;
  width: number;
}
export class GraphicView extends ForeignView implements MoveDrawable {
  public readonly outline: string = "thin solid #999";
  private graphics: Map<Function, Graphic> = new Map<Function, Graphic>();
  private _xAxisPathView: PathView;
  private _yAxisPathView: PathView;
  private readonly _axisGroup: SVGGElement;
  private readonly _graphicGroup: SVGGElement;

  private _center: Point = {x: 0, y: 0};
  private _size: Size = {width: 0, height: 0};
  private _physicalUnitSize: number = 20;               // px - CHANGING on zoom
  private _rulerStep: number = 1;                       // CHANGING by handler
  private readonly _minRulerStepSize: number = 15;      // px
  private readonly _maxRulerStepSize: number = 50;      // px
  public override rotatable: boolean = false;

  public constructor(container: TSVG, center: Point = {x: 0, y: 0}, size: Size = {width: 1, height: 1}, ownerId?: string, index?: number) {
    super(container, ownerId, index);

    this.svgElement = document.createElementNS(ElementView.svgURI, "svg");
    this._axisGroup = document.createElementNS(ElementView.svgURI, "g");
    this._graphicGroup = document.createElementNS(ElementView.svgURI, "g");

    let background = document.createElementNS(ElementView.svgURI, "rect")
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", "transparent");

    this.svgElement.appendChild(background);
    this.svgElement.appendChild(this._axisGroup);
    this.svgElement.appendChild(this._graphicGroup);

    this.svgElement.style.outline = this.outline;
    this._xAxisPathView = new PathView(this._container);
    this._xAxisPathView.SVG.style.shapeRendering = "optimizeSpeed";

    this._xAxisPathView.SVG.style.strokeLinecap = "butt";
    this._yAxisPathView = new PathView(this._container);
    this._yAxisPathView.SVG.style.shapeRendering = "optimizeSpeed";

    this._yAxisPathView.SVG.style.strokeLinecap = "butt";
    center = {
      x: center.x - size.width / 2,
      y: center.y - size.height / 2
    }
    this.position = center;
    this.setSize({
      x: center.x,
      y: center.y,
      width: size.width,
      height: size.height
    });
    this.drawAxis();
    this.type = ElementType.GRAPHIC;
  }

  public zoomIn() {
    this._physicalUnitSize += this._physicalUnitSize / 2;
    this.recreateGraphic();
  }
  public zoomOut() {
    this._physicalUnitSize -= this._physicalUnitSize / 2;
    this.recreateGraphic();
  }
  public showSteps() {
    this.drawAxis();
  }
  public hideSteps() {
    this.drawAxis(false);
  }

  public addFunction(f: Function, color: string = "#000", width: number = 2) {
    let graphic = {
      path: new PathView(this._container),
      width: width,
      color: color
    }
    this.setPath(f, graphic);
    this.graphics.set(f, graphic);
    this._graphicGroup.appendChild(graphic.path.SVG);
  }
  public removeFunction(f: Function) {
    let graphicPath = this.graphics.get(f);
    if(graphicPath) {
      this._graphicGroup.removeChild(graphicPath.path.SVG);
    }
    this.graphics.delete(f);
  }

  private setXStep(pathObject: Path, x: number, y: number, length: number) {
    pathObject.add(new MoveTo({
      x: x,
      y: y - length
    }));
    pathObject.add(new LineTo({
      x: x,
      y: y + length
    }));
  }
  private setYStep(pathObject: Path, x: number, y: number, length: number) {
    pathObject.add(new MoveTo({
      x: x - length,
      y: y
    }));
    pathObject.add(new LineTo({
      x: x + length,
      y: y
    }));
  }

  private drawAxis(showSteps: boolean = true) {

    // TODO - calculate step according min/max ruler size and set unit

    let unit = this._rulerStep * this._physicalUnitSize;

    let localCenter = {
      x: this._size.width / 2,
      y: this._size.height / 2
    }

    let stepSize = 3.5;
    let subStepSize = 1.5;

    this._xAxisPathView.style.strokeWidth = "1";
    this._xAxisPathView.style.strokeColor = "red";
    let xAxisPathObject = new Path();
    xAxisPathObject.add(new MoveTo({x: 0, y: localCenter.y}));
    xAxisPathObject.add(new LineTo({x: this._size.width, y: localCenter.y}));

    this._yAxisPathView.style.strokeWidth = "1";
    this._yAxisPathView.style.strokeColor = "blue";
    let yAxisPathObject = new Path();
    yAxisPathObject.add(new MoveTo({x: localCenter.x, y: 0}));
    yAxisPathObject.add(new LineTo({x: localCenter.x, y: this._size.height}));

    if(showSteps) {
      /* negative x axis */
      for (let i = localCenter.x - unit; i >= -unit; i -= unit) {
        this.setXStep(xAxisPathObject, i, localCenter.y, stepSize);
        // for(let j = i + unit; j > i; j -= unit / 5) {
        //   this.setXStep(xAxisPathObject, j, localCenter.y, subStepSize);
        // }
      }
      /* positive x axis */
      for (let i = localCenter.x + unit; i <= this._size.width + unit; i += unit) {
        this.setXStep(xAxisPathObject, i, localCenter.y, stepSize);
        // for(let j = i - unit; j < i; j += unit / 5) {
        //   this.setXStep(xAxisPathObject, j, localCenter.y, subStepSize);
        // }
      }

      /* negative y axis */
      for (let i = localCenter.y - unit; i >= -unit; i -= unit) {
        this.setYStep(yAxisPathObject, localCenter.x, i, stepSize);
        // for(let j = i + unit; j > i; j -= unit / 5) {
        //   this.setYStep(yAxisPathObject, localCenter.x, j, subStepSize);
        // }
      }
      /* positive y axis */
      for (let i = localCenter.y + unit; i <= this._size.height + unit; i += unit) {
        this.setYStep(yAxisPathObject, localCenter.x, i, stepSize);
        // for(let j = i - unit; j < i; j += unit / 5) {
        //   this.setYStep(yAxisPathObject, localCenter.x, j, subStepSize);
        // }
      }
    }

    this._xAxisPathView.path = xAxisPathObject;
    this._yAxisPathView.path = yAxisPathObject;

    this._axisGroup.appendChild(this._xAxisPathView.SVG);
    this._axisGroup.appendChild(this._yAxisPathView.SVG);
  }

  private setPath(f: Function, graphic: Graphic) {
    let unit = this._physicalUnitSize;
    let graphicPath = new PathView(this._container);
    graphicPath.style.strokeWidth = graphic.width + "";
    graphicPath.style.strokeColor = graphic.color;
    let graphicPathObject = new Path();

    let maxX = (this._size.width / 2) / unit + 1;
    let x = -maxX;

    let step = 0.01;

    for(; x < maxX; x += step) {
      let visibleX = (this._size.width / 2) + x * unit;
      let visibleY = (this._size.height / 2) - (f(x) * unit);

      graphicPathObject.add(new LineTo({
        x: visibleX,
        y: visibleY
      }));
    }

    try {
      let firstPoint = graphicPathObject.get(0).position;
      graphicPathObject.replaceCommand(0, new MoveTo(firstPoint));
    } catch (e) {

    }
    graphicPath.path = graphicPathObject;

    graphic.path = graphicPath;
  }
  private recreateGraphic() {
    this._graphicGroup.innerHTML = "";
    this.drawAxis();
    this.graphics.forEach((graphic: Graphic, f: Function) => {
      this.setPath(f, graphic);
      this._graphicGroup.appendChild(graphic.path.SVG);
    });
  }

  public get copy(): GraphicView { /* TODO */
    return new GraphicView(this._container);
  }

  public override get points(): Point[] {
    let points = super.points;
    points.push(this.center)
    return points;
  }

  public get position(): Point {
    return {
      x: this._center.x - this._size.width / 2,
      y: this._center.y - this._size.height / 2
    };
  }
  public set position(delta: Point) {
    this._center.x += delta.x;
    this._center.y += delta.y;

    let position = this.position;
    this.setAttr({
      x: position.x,
      y: position.y
    });
  }
  public override get center(): Point {
    return this._center;
  }

  public get size(): Size {
    return this._size;
  }
  public drawSize(rect: Rect) {
    this.setSize(rect);
  }
  public setSize(rect: Rect): void {
    if (rect.width < 0) {
      rect.width = -rect.width;
      rect.x -= rect.width;
    }
    if (rect.height < 0) {
      rect.height = -rect.height;
      rect.y -= rect.height;
    }

    this._size.width = rect.width;
    this._size.height = rect.height;
    this._center.x = rect.x + rect.width / 2;
    this._center.y = rect.y + rect.height / 2;

    this.setAttr({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });

    this.recreateGraphic();
  }

  public override correct(refPoint: Point, lastRefPoint: Point) {
    let delta = this.getCorrectionDelta(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;
    this.position = delta;
  }

  public get boundingRect(): Rect {
    let position = this.position;
    return {x: position.x, y: position.y, width: this._size.width, height: this._size.height};
  }
  public get visibleBoundingRect(): Rect {
    let boundingRect = this.boundingRect;
    let left = boundingRect.x;
    let top = boundingRect.y;
    let right = boundingRect.x + boundingRect.width;
    let bottom = boundingRect.y + boundingRect.height;

    let rotatedPoints = Matrix.rotate(
      [
        {x: left, y: top},
        {x: right, y: top},
        {x: right, y: bottom},
        {x: left, y: bottom},
      ],
      this._refPoint,
      -this._angle
    );

    let minX = rotatedPoints[0].x;
    let minY = rotatedPoints[0].y;
    let maxX = rotatedPoints[0].x;
    let maxY = rotatedPoints[0].y;
    for(let i = 1; i < rotatedPoints.length; i++) {
      if(rotatedPoints[i].x < minX)
        minX = rotatedPoints[i].x;
      if(rotatedPoints[i].y < minY)
        minY = rotatedPoints[i].y;

      if(rotatedPoints[i].x > maxX)
        maxX = rotatedPoints[i].x;
      if(rotatedPoints[i].y > maxY)
        maxY = rotatedPoints[i].y;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  public isComplete(): boolean {
    return this._size.width >= 50 && this._size.height >= 30;
  }

  public toPath(): PathView { /* TODO */
    return new PathView(this._container);
  }
}
