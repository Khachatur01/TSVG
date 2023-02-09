/* eslint-disable @typescript-eslint/naming-convention */
import {Container} from '../../Container';
import {ElementView} from '../../element/ElementView';
import {Point} from '../../model/Point';
import {Path} from '../../model/path/Path';
import {MoveTo} from '../../model/path/point/MoveTo';
import {LineTo} from '../../model/path/line/LineTo';
import {SVGEvent} from '../../dataSource/constant/SVGEvent';

export class Grid {
  private readonly container: Container;
  private readonly _group: SVGGElement;
  private _snapSide = 20; /* default */
  private strokeWidth = 1; /* default */
  private strokeColor = '#ddd'; /* default */
  private _isGridOn = false;
  private _isSnapOn = false;

  public constructor(container: Container) {
    this.container = container;
    this._group = document.createElementNS(ElementView.svgURI, 'g');
    this._group.id = 'grid';
  }

  public get __group__(): SVGGElement {
    return this._group;
  }

  public snapOn(call: boolean = true) {
    if (this._isGridOn) {
      this._isSnapOn = true;

      if (call) {
        this.container.__call__(SVGEvent.SNAP_ON);
      }
    }
  }
  public snapOff() {
    this._isSnapOn = false;
    this.container.__call__(SVGEvent.SNAP_OFF);
  }
  public isSnapOn(): boolean {
    return this._isSnapOn;
  }

  public gridOn(call: boolean = true) {
    this._group.innerHTML = '';
    this._snapSide = Math.floor(this._snapSide);
    this._isGridOn = true;
    const width: number = this.container.HTML.clientWidth;
    const height: number = this.container.HTML.clientHeight;

    const grid = document.createElementNS(ElementView.svgURI, 'path');
    grid.style.shapeRendering = 'geometricPrecision';
    grid.style.strokeWidth = this.strokeWidth + '';
    grid.style.stroke = this.strokeColor;

    const path = new Path();

    for (let i = this._snapSide; i < width; i += this._snapSide) {
      path.add(new MoveTo({x: i + 0.5, y: 0}));
      path.add(new LineTo({x: i + 0.5, y: height}));
    }
    for (let i = this._snapSide; i < height; i += this._snapSide) {
      path.add(new MoveTo({x: 0, y: i + 0.5}));
      path.add(new LineTo({x: width, y: i + 0.5}));
    }

    grid.setAttribute('d', path.toString());
    this._group.appendChild(grid);

    if (call) {
      this.container.__call__(SVGEvent.GRID_ON);
    }
  }
  public gridOff(call: boolean = true) {
    this._group.innerHTML = '';
    this._isGridOn = false;

    if (call) {
      this.container.__call__(SVGEvent.GRID_OFF);
    }
  }
  public isGridOn(): boolean {
    return this._isGridOn;
  }

  public getSnapPoint(point: Point) {
    if (!this._isSnapOn) {
      return point;
    }

    const x = Math.round(point.x / this._snapSide) * this._snapSide;
    const y = Math.round(point.y / this._snapSide) * this._snapSide;
    return {x, y};
  }

  public getSnapSide(): number {
    return this._snapSide;
  }

  public setSnapSide(squareSide: number, call: boolean = true) {
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
