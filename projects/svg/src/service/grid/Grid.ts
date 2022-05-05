import {Container} from "../../Container";
import {ElementView} from "../../element/ElementView";
import {Point} from "../../model/Point";
import {Path} from "../../model/path/Path";
import {MoveTo} from "../../model/path/point/MoveTo";
import {LineTo} from "../../model/path/line/LineTo";
import {Event} from "../../dataSource/constant/Event";

export class Grid {
  private readonly container: Container;
  private readonly ___group__: SVGGElement;
  private _snapSide: number = 20; /* default */
  private strokeWidth: number = 1; /* default */
  private strokeColor: string = "#ddd"; /* default */
  private _isGrid: boolean = false;
  private _isSnap: boolean = false;

  public constructor(container: Container) {
    this.container = container;
    this.___group__ = document.createElementNS(ElementView.svgURI, "g");
    this.___group__.id = "grid";
  }

  public get __group__(): SVGGElement {
    return this.___group__;
  }

  public snapOn(call: boolean = true) {
    if (this._isGrid) {
      this._isSnap = true;

      if (call) {
        this.container.__call__(Event.SNAP_ON);
      }
    }
  }
  public snapOff() {
    this._isSnap = false;
    this.container.__call__(Event.SNAP_OFF);
  }
  public isSnap(): boolean {
    return this._isSnap;
  }

  public gridOn(call: boolean = true) {
    this.___group__.innerHTML = "";
    this._snapSide = Math.floor(this._snapSide);
    this._isGrid = true;
    let width: number = this.container.HTML.clientWidth;
    let height: number = this.container.HTML.clientHeight;

    let grid = document.createElementNS(ElementView.svgURI, "path");
    grid.style.shapeRendering = "optimizeSpeed";
    grid.style.strokeWidth = this.strokeWidth + "";
    grid.style.stroke = this.strokeColor;

    let path = new Path();

    for (let i = this._snapSide; i < width; i += this._snapSide) {
      path.add(new MoveTo({x: i, y: 0}));
      path.add(new LineTo({x: i, y: height}));
    }
    for (let i = this._snapSide; i < height; i += this._snapSide) {
      path.add(new MoveTo({x: 0, y: i}));
      path.add(new LineTo({x: width, y: i}));
    }

    grid.setAttribute("d", path.toString());
    this.___group__.appendChild(grid);

    if (call) {
      this.container.__call__(Event.GRID_ON);
    }
  }
  public gridOff(call: boolean = true) {
    this.___group__.innerHTML = "";
    this._isGrid = false;

    if (call) {
      this.container.__call__(Event.GRID_OFF);
    }
  }
  public isGrid(): boolean {
    return this._isGrid;
  }

  public getSnapPoint(point: Point) {
    if (!this._isSnap)
      return point;

    let x = Math.round(point.x / this._snapSide) * this._snapSide;
    let y = Math.round(point.y / this._snapSide) * this._snapSide;
    return {x: x, y: y};
  }

  public getSnapSide(): number {
    return this._snapSide;
  }

  public setSnapSide(squareSide: number, call: boolean = true) {
    this._snapSide = squareSide;
    if (this._isGrid) {
      this.gridOff(false); /* not call grid off callback */
      this.gridOn(false); /* not call grid on callback */
    }
    if (call) {
      this.container.__call__(Event.SNAP_SIDE_CHANGE,
        {snapSide: squareSide}
      );
    }
  }
}
