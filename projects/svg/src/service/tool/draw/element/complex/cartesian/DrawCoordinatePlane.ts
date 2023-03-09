import {MoveDrawer} from '../../../mode/MoveDrawer';
import {Style} from '../../../../../style/Style';
import {Point} from '../../../../../../model/Point';
import {GraphicFunction} from '../../../../../../element/complex/cartesian/GraphicView';
import {MoveDrawable} from '../../../type/MoveDrawable';
import {CoordinatePlaneView} from '../../../../../../element/complex/cartesian/CoordinatePlaneView';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../dataSource/constant/ElementType';

export class DrawCoordinatePlane extends MoveDrawer {
  public functions: {f: GraphicFunction; style: Style}[] = [];
  protected createDrawableElement(position: Point): MoveDrawable {
    const coordinatePlane: CoordinatePlaneView = new CoordinatePlaneView(this.drawTool.container, {overEvent: true, globalStyle: false}, {x: position.x, y: position.y, width: 1, height: 1});
    this.functions.forEach((f: {f: GraphicFunction; style: Style}) => {
      coordinatePlane.addFunction(f.f, f.style);
    });
    return coordinatePlane;
  }

  protected override onIsNotComplete(call: boolean): void {
    if (!this._drawableElement) {return;}
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 150,
      width: 300,
      height: 300
    });
    this._drawableElement.refPoint = this._drawableElement.center;
  }
  protected override onEnd(call: boolean): void {
  }

  public override start(call: boolean): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.COORDINATE_PLANE_TOOL_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.COORDINATE_PLANE_TOOL_OFF);
    }
  }

  public _new(): DrawCoordinatePlane {
    return new DrawCoordinatePlane(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.COORDINATE_PLANE;
  }
}
