import {ClickDrawer} from '../mode/ClickDrawer';
import {Point} from '../../../../model/Point';
import {ElementView} from '../../../../element/ElementView';
import {Drawable} from '../type/Drawable';
import {SVGEvent} from '../../../../dataSource/constant/SVGEvent';

export abstract class DrawTwoPoint extends ClickDrawer {
  public override makeMouseDown(position: Point, call: boolean = true): void {
    super.makeMouseDown(position, call);
    if (this.clicksCount === 2) {
      this.stopDrawing();
    }
  }

  protected override stopClickDrawing(call: boolean = true): void {
    if (!this._drawableElement) {return;}

    if (this.clicksCount === 1) {
      this.drawTool.container.remove(this._drawableElement as unknown as ElementView, true, false);
    } else {
      this._drawableElement.refPoint = this._drawableElement.center;
      if (call) {
        const drawableElementCopy: Drawable = this._drawableElement.copy;
        drawableElementCopy.index = this._drawableElement.index;
        this.drawTool.container.__call__(SVGEvent.ELEMENT_CREATED, {element: drawableElementCopy});
      }
    }
    this.drawTool.container.tools.drawTool.__drawingEnd__();
    this._drawableElement = undefined;
    this.clicksCount = 0;
    if (call) {
      this.drawTool.container.__call__(SVGEvent.STOP_CLICK_DRAWING);
      this.drawTool.container.__call__(SVGEvent.END_DRAWING, {drawer: this});
    }
  }
}
