import {Container} from '../../Container';
import {ElementView} from '../../element/ElementView';
import {Point} from '../../model/Point';
import {Path} from '../../model/path/Path';
import {MoveTo} from '../../model/path/point/MoveTo';
import {LineTo} from '../../model/path/line/LineTo';
import {SVGEvent} from '../../dataSource/constant/SVGEvent';

export class Grid {
  private readonly container: Container;
  private _snapSide: number = 20; /* default */
  private strokeWidth: number = 1; /* default */
  private strokeColor: string = '#ddd'; /* default */
  private _isGridOn: boolean = false;
  private _isSnapOn: boolean = false;

  public constructor(container: Container) {
    this.container = container;
  }

  public snapOn(call: boolean = true): void {
    if (this._isGridOn) {
      this._isSnapOn = true;

      if (call) {
        this.container.__call__(SVGEvent.SNAP_ON);
      }
    }
  }
  public snapOff(): void {
    this._isSnapOn = false;
    this.container.__call__(SVGEvent.SNAP_OFF);
  }
  public isSnapOn(): boolean {
    return this._isSnapOn;
  }

  public gridOn(call: boolean = true): void {
    this.container.__gridGroup__.innerHTML = '';
    this._snapSide = Math.floor(this._snapSide);
    this._isGridOn = true;
    const width: number = this.container.HTML.clientWidth;
    const height: number = this.container.HTML.clientHeight;

    const grid: SVGPathElement = document.createElementNS(ElementView.svgURI, 'path');
    grid.style.shapeRendering = 'geometricPrecision';
    grid.style.strokeWidth = this.strokeWidth + '';
    grid.style.stroke = this.strokeColor;

    const path: Path = new Path();

    for (let i: number = this._snapSide; i < width; i += this._snapSide) {
      path.add(new MoveTo({x: i + 0.5, y: 0}));
      path.add(new LineTo({x: i + 0.5, y: height}));
    }
    for (let i: number = this._snapSide; i < height; i += this._snapSide) {
      path.add(new MoveTo({x: 0, y: i + 0.5}));
      path.add(new LineTo({x: width, y: i + 0.5}));
    }

    grid.setAttribute('d', path.toString());
    this.container.__gridGroup__.appendChild(grid);

    if (call) {
      this.container.__call__(SVGEvent.GRID_ON);
    }
  }
  public gridOff(call: boolean = true): void {
    this.container.__gridGroup__.innerHTML = '';
    this._isGridOn = false;

    if (call) {
      this.container.__call__(SVGEvent.GRID_OFF);
    }
  }
  public isGridOn(): boolean {
    return this._isGridOn;
  }

  public getSnapPoint(point: Point): Point {
    if (!this._isSnapOn) {
      return point;
    }

    const x: number = Math.round(point.x / this._snapSide) * this._snapSide;
    const y: number = Math.round(point.y / this._snapSide) * this._snapSide;
    return {x, y};
  }

  public getSnapSide(): number {
    return this._snapSide;
  }

  public setSnapSide(squareSide: number, call: boolean = true): void {
    this._snapSide = squareSide;
    if (this._isGridOn) {
      this.gridOff(false); /* not call grid off callback */
      this.gridOn(false); /* not call grid on callback */
    }
    if (call) {
      this.container.__call__(SVGEvent.SNAP_SIDE_CHANGE,
        {snapSide: squareSide}
      );
    }
  }
}
