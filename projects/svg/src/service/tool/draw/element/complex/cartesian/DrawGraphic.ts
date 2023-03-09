import {MoveDrawer} from '../../../mode/MoveDrawer';
import {GraphicFunction, GraphicView} from '../../../../../../element/complex/cartesian/GraphicView';
import {Point} from '../../../../../../model/Point';
import {MoveDrawable} from '../../../type/MoveDrawable';
import {ElementType} from '../../../../../../dataSource/constant/ElementType';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';

export class DrawGraphic extends MoveDrawer {
  public f: GraphicFunction = (x: number) => x;
  protected createDrawableElement(position: Point): MoveDrawable {
    return new GraphicView(
      this.drawTool.container,
      {overEvent: true, globalStyle: true},
      {x: position.x, y: position.y, width: 1, height: 1},
      {x: 1, y: 1},
      this.f
    );
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
      this.drawTool.container.__call__(SVGEvent.GRAPHIC_TOOL_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.GRAPHIC_TOOL_OFF);
    }
  }

  public _new(): DrawGraphic {
    return new DrawGraphic(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.GRAPHIC;
  }
}
