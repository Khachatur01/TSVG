import {Tool} from '../../Tool';
import {Container} from '../../../../Container';
import {PointedView} from '../../../../element/shape/pointed/PointedView';
import {ElementView} from '../../../../element/ElementView';
import {Point} from '../../../../model/Point';
import {Node} from './Node';
import {SVGEvent} from '../../../../dataSource/constant/SVGEvent';
import {Focus} from '../../../edit/group/Focus';
import {Cursor} from '../../../../dataSource/constant/Cursor';

export class EditNodeTool extends Tool {
  protected override _cursor: Cursor = Cursor.EDIT_NODE;
  private nodes: Node[] = [];
  private _editableElement: PointedView | null = null;
  public focus: Focus;
  public showNodes: boolean = true;

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.focus = focus;

    this.addMouseEvents = this.addMouseEvents.bind(this);
    this.removeMouseEvents = this.removeMouseEvents.bind(this);

    this._container.addCallBack(SVGEvent.ELEMENT_ADDED, ({element}: any) => {
      /* if edit node tool is on, add click event to a newly added element */
      if (this._isOn) {
        this.addMouseEvents(element);
      }
    });
  }

  public makeMouseDown(position: Point, call: boolean, order: number): void {
    this.nodes[order].makeMouseDown(position, call);
  }
  public makeMouseMove(position: Point, call: boolean, order: number): void {
    this.nodes[order].makeMouseMove(position, call);
  }
  public makeMouseUp(position: Point, call: boolean, order: number): void {
    this.nodes[order].makeMouseUp(position, call);
  }

  private set refPoint(refPoint: Point) {
    this._container.__nodesGroup__.style.transformOrigin = refPoint.x + 'px ' + refPoint.y + 'px';
  }
  private rotate(angle: number): void {
    this._container.__nodesGroup__.style.transform = 'rotate(' + angle + 'deg)';
  }

  public get editableElement(): PointedView | null {
    return this._editableElement;
  }
  public set editableElement(editableElement: PointedView | null) {
    if (!editableElement) {
      return;
    }
    this.removeEditableElement();

    this.focus.appendChild(editableElement, false, false);
    this._editableElement = editableElement;
    this._editableElement.__onFocus__();

    let order: number = 0;
    const points: Point[] = editableElement.points;
    for (const point of points) {
      const node: Node = new Node(this._container, this, point, order++);
      node.__on__();
      this.nodes.push(node);
      if (this.showNodes) {
        this._container.__nodesGroup__.appendChild(node.SVG);
      }
    }

    this.refPoint = editableElement.refPoint;
    this.rotate(editableElement.angle);
  }
  public removeEditableElement(): void {
    this._container.__nodesGroup__.innerHTML = '';
    this.nodes = [];
    if (!this._editableElement) {
      return;
    }

    this.focus.removeChild(this._editableElement, false);
    this._editableElement = null;
  }

  private clickEvent(event: MouseEvent | TouchEvent): void {
    const elementId: {ownerId: string; index: number} | null = ElementView.parseId((event.target as SVGElement).id);
    const element: ElementView | null = elementId && this._container.getElementById(elementId.ownerId, elementId.index, true);

    if (this._editableElement !== element) {
      this._container.blur();
      if (this._isOn) {
        this._container.tools.drawTool.setDrawer(this._container.drawers.free);
        this._container.tools.drawTool.on();
      }
      return;
    }
  }
  private addMouseEvents(element: ElementView): void {
    element.SVG.addEventListener('mousedown', this.clickEvent);
    element.SVG.addEventListener('touchstart', this.clickEvent);
  }
  private removeMouseEvents(element: ElementView): void {
    element.SVG.removeEventListener('mousedown', this.clickEvent);
    element.SVG.removeEventListener('touchstart', this.clickEvent);
  }

  public override on(call: boolean = true): boolean {
    if (!super.on(call)) {
      return false;
    }

    this._container.elementsDeep.forEach(this.addMouseEvents);
    this.focus.children.forEach((child: ElementView) => {
      if (child instanceof PointedView) {
        this.editableElement = child;
      }
    });
    this._container.blur();

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(SVGEvent.EDIT_NODE_TOOl_ON);
    }
    return true;
  }
  public override off(call: boolean = true): boolean {
    if (!super.off(call)) {
      return false;
    }

    this._container.elementsDeep.forEach(this.removeMouseEvents);
    this.focus.clear();
    this.removeEditableElement();

    if (call) {
      this._container.__call__(SVGEvent.EDIT_NODE_TOOl_OFF);
    }
    return true;
  }
}
