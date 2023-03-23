import {PathCommand} from '../../PathCommand';
import {Point} from '../../../Point';

export class Arc extends PathCommand {
  private _rx: number;
  private _ry: number;
  private _x_axis_rotation: number;
  private _large_arc_flag: number;
  private _sweep_flag: number;

  public constructor(rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, point: Point, close: boolean = false, absolute: boolean = false) {
    super(point, close, absolute);
    this._rx = rx;
    this._ry = ry;
    this._x_axis_rotation = xAxisRotation;
    this._large_arc_flag = largeArcFlag;
    this._sweep_flag = sweepFlag;
  }

  public get rx(): number {
    return this._rx;
  }
  public set rx(value: number) {
    this._rx = value;
  }

  public get ry(): number {
    return this._ry;
  }
  public set ry(ry: number) {
    this._ry = ry;
  }

  public get xAxisRotation(): number {
    return this._x_axis_rotation;
  }
  public set xAxisRotation(xAxisRotation: number) {
    this._x_axis_rotation = xAxisRotation;
  }

  public get largeArcFlag(): number {
    return this._large_arc_flag;
  }
  public set largeArcFlag(largeArcFlag: number) {
    this._large_arc_flag = largeArcFlag;
  }

  public get sweepFlag(): number {
    return this._sweep_flag;
  }
  public set sweepFlag(sweepFlag: number) {
    this._sweep_flag = sweepFlag;
  }

  public override get position(): Point {
    return super.position;
  }
  public override set position(position: Point) {
    this._point.x = position.x;
    this._point.y = position.y;
  }

  public get copy(): Arc {
    return new Arc(this._rx, this._ry, this._x_axis_rotation, this._large_arc_flag, this._sweep_flag, {
      x: this._point.x,
      y: this._point.y
    });
  }

  public toString(): string {
    return (this.absolute ? 'a ' : 'A ') +
      this._rx + ' ' + this._ry + ' ' +
      this._x_axis_rotation + ' ' +
      this._large_arc_flag + ' ' +
      this._sweep_flag + ' ' +
      this._point.x + ' ' + this._point.y + (this.close ? ' Z' : '');
  }
}
