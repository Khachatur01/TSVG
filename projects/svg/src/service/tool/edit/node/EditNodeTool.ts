import {Tool} from "../../Tool";
import {Container} from "../../../../Container";
import {PointedView} from "../../../../element/shape/pointed/PointedView";
import {ElementView} from "../../../../element/ElementView";
import {Point} from "../../../../model/Point";
import {Node} from "./Node";
import {Event} from "../../../../dataSource/constant/Event";
import {Focus} from "../../../edit/group/Focus";
import {Cursor} from "../../../../dataSource/constant/Cursor";
import {DrawTool} from "../../draw/DrawTool";

export class EditNodeTool extends Tool {
  protected override _cursor: Cursor = Cursor.EDIT_NODE;
  private nodes: Node[] = [];
  private _editableElement: PointedView | null = null;
  public focus: Focus;
  public showNodes: boolean = true;

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.focus = focus;
  }

  public makeMouseDown(position: Point, call: boolean, order: number) {
    this.nodes[order].makeMouseDown(position, call);
  }
  public makeMouseMove(position: Point, call: boolean, order: number) {
    this.nodes[order].makeMouseMove(position, call);
  }
  public makeMouseUp(position: Point, call: boolean, order: number) {
    this.nodes[order].makeMouseUp(position, call);
  }

  private set refPoint(refPoint: Point) {
    this._container.__nodesGroup__.style.transformOrigin = refPoint.x + "px " + refPoint.y + "px";
  }
  private rotate(angle: number) {
    this._container.__nodesGroup__.style.transform = "rotate(" + angle + "deg)";
  }

  public get editableElement(): PointedView | null {
    return this._editableElement;
  }
  public set editableElement(editableElement: PointedView | null) {
    if (!editableElement) return;
    this.removeEditableElement();

    this.focus.appendChild(editableElement, false, false);
    this._editableElement = editableElement;
    this._editableElement.__onFocus__();

    let order = 0;
    let points = editableElement.points;
    for (let point of points) {
      let node: Node = new Node(this._container, this, point, order++);
      node.__on__();
      this.nodes.push(node);
      if (this.showNodes) {
        this._container.__nodesGroup__.appendChild(node.SVG);
      }
    }

    this.refPoint = editableElement.refPoint;
    this.rotate(editableElement.angle);
  }
  public removeEditableElement() {
    this._container.__nodesGroup__.innerHTML = "";
    this.nodes = [];
    if (!this._editableElement) return;

    this.focus.removeChild(this._editableElement, false);
    this._editableElement = null;
  }

  public override on(call: boolean = true): void {
    super.on(call);
    this.focus.children.forEach((child: ElementView) => {
      if (child instanceof PointedView) {
        this.editableElement = child;
      }
    });
    this._container.blur();

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(Event.EDIT_NODE_TOOl_ON);
    }
  }
  public override off(call: boolean = true): void {
    super.off();
    this.focus.clear();
    this.removeEditableElement();

    if (call) {
      this._container.__call__(Event.EDIT_NODE_TOOl_OFF);
    }
  }
}
