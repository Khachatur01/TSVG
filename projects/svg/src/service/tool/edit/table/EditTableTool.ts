import {Tool} from "../../Tool";
import {Point} from "../../../../model/Point";
import {Cursor} from "../../../../dataSource/constant/Cursor";
import {Focus} from "../../../edit/group/Focus";
import {Container} from "../../../../Container";
import {TableView} from "../../../../element/complex/TableView";
import {ElementView} from "../../../../element/ElementView";
import {Event} from "../../../../dataSource/constant/Event";
import {TableGrip} from "./TableGrip";
import {Table} from "../../../../dataSource/constant/Table";
import {DrawTool} from "../../draw/DrawTool";

export class EditTableTool extends Tool {
  protected override _cursor: Cursor = Cursor.EDIT_NODE;
  public __topBorderGrip__: TableGrip | undefined;
  public __leftBorderGrip__: TableGrip | undefined;
  public __rowGrips__: TableGrip[] = [];
  public __colGrips__: TableGrip[] = [];
  private _editableElement: TableView | null = null;
  public focus: Focus;
  public showGrips: boolean = true;

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.focus = focus;
  }

  public makeMouseDown(position: Point, call: boolean, additional: {order: number, type: Table}): void {
    switch (additional.type) {
      case Table.ROW:
        if (additional.order == -1) {
          this.__topBorderGrip__?.makeMouseDown(position, call);
        } else {
          this.__rowGrips__[additional.order].makeMouseDown(position, call);
        }
        break;
      case Table.COL:
        if (additional.order == -1) {
          this.__leftBorderGrip__?.makeMouseDown(position, call);
        } else {
          this.__colGrips__[additional.order].makeMouseDown(position, call);
        }
        break;
    }
  }
  public makeMouseMove(position: Point, call: boolean, additional: {order: number, type: Table}): void {
    switch (additional.type) {
      case Table.ROW:
        if (additional.order == -1) {
          this.__topBorderGrip__?.makeMouseMove(position, call);
        } else {
          this.__rowGrips__[additional.order].makeMouseMove(position, call);
        }
        break;
      case Table.COL:
        if (additional.order == -1) {
          this.__leftBorderGrip__?.makeMouseMove(position, call);
        } else {
          this.__colGrips__[additional.order].makeMouseMove(position, call);
        }
        break;
    }
  }
  public makeMouseUp(position: Point, call: boolean, additional: {order: number, type: Table}): void {
    switch (additional.type) {
      case Table.ROW:
        if (additional.order == -1) {
          this.__topBorderGrip__?.makeMouseUp(position, call);
        } else {
          this.__rowGrips__[additional.order].makeMouseUp(position, call);
        }
        break;
      case Table.COL:
        if (additional.order == -1) {
          this.__leftBorderGrip__?.makeMouseUp(position, call);
        } else {
          this.__colGrips__[additional.order].makeMouseUp(position, call);
        }
        break;
    }
  }

  public get editableElement(): TableView | null {
    return this._editableElement;
  }
  public set editableElement(editableElement: TableView | null) {
    if (!editableElement) return;
    this.removeEditableElement();

    this.focus.appendChild(editableElement, false, false);
    this._editableElement = editableElement;

    this.__topBorderGrip__ = new TableGrip(this._container, this, Table.ROW, -1, this._editableElement.topBorder);
    this.__topBorderGrip__.__on__();
    this.__leftBorderGrip__ = new TableGrip(this._container, this, Table.COL, -1, this._editableElement.leftBorder);
    this.__leftBorderGrip__.__on__();

    if (this.showGrips) {
      this._container.__nodesGroup__.appendChild(this.__leftBorderGrip__.SVG);
      this._container.__nodesGroup__.appendChild(this.__topBorderGrip__.SVG);
    }

    for (let i = 0; i < this._editableElement.rows.length; i++) {
      let line = this._editableElement.rows[i].line;
      if (line) {
        let tableGrip = new TableGrip(this._container, this, Table.ROW, i, line);
        this.__rowGrips__.push(tableGrip);
        if (this.showGrips) {
          this._container.__nodesGroup__.appendChild(tableGrip.SVG);
        }
      }
      this.__rowGrips__[i].__on__();
    }
    for (let i = 0; i < this._editableElement.cols.length; i++) {
      let line = this._editableElement.cols[i].line;
      if (line) {
        let tableGrip = new TableGrip(this._container, this, Table.COL, i, line);
        this.__colGrips__.push(tableGrip);
        if (this.showGrips) {
          this._container.__nodesGroup__.appendChild(tableGrip.SVG);
        }
      }
      this.__colGrips__[i].__on__();
    }
  }
  public removeEditableElement() {
    this._container.__nodesGroup__.innerHTML = "";
    this.__topBorderGrip__?.__off__();
    this.__leftBorderGrip__?.__off__();
    this.__rowGrips__.forEach(rowGrip => {
      rowGrip.__off__();
    })
    this.__colGrips__.forEach(colGrip => {
      colGrip.__off__();
    })
    this.__rowGrips__ = [];
    this.__colGrips__ = [];

    if (!this._editableElement) return;

    this.focus.removeChild(this._editableElement, false);
    this._editableElement = null;
  }

  public override on(call: boolean = true): void {
    super.on(call);
    this.focus.children.forEach((child: ElementView) => {
      if (child instanceof TableView) {
        this.editableElement = child;
      }
    });
    this._container.blur();

    if (call) {
      this._container.__call__(Event.EDIT_TABLE_TOOL_ON);
    }
  }
  public override off(call: boolean = true): void {
    super.off();
    this.focus.clear();
    this.removeEditableElement();

    if (call) {
      this._container.__call__(Event.EDIT_TABLE_TOOL_OFF);
    }
  }
}
