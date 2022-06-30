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

export class EditTableTool extends Tool {
  protected override _cursor: Cursor = Cursor.EDIT_NODE;
  private rowGrips: TableGrip[] = [];
  private colGrips: TableGrip[] = [];
  private _editableElement: TableView | null = null;
  public focus: Focus;

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.focus = focus;
  }

  public makeMouseDown(position: Point, call: boolean, additional: {order: number, type: Table}): void {
    switch (additional.type) {
      case Table.ROW:
        this.rowGrips[additional.order].makeMouseDown(position, call);
        break;
      case Table.COL:
        this.colGrips[additional.order].makeMouseDown(position, call);
        break;
    }
  }

  public makeMouseMove(position: Point, call: boolean, additional: {order: number, type: Table}): void {
    switch (additional.type) {
      case Table.ROW:
        this.rowGrips[additional.order].makeMouseMove(position, call);
        break;
      case Table.COL:
        this.colGrips[additional.order].makeMouseMove(position, call);
        break;
    }
  }

  public makeMouseUp(position: Point, call: boolean, additional: {order: number, type: Table}): void {
    switch (additional.type) {
      case Table.ROW:
        this.rowGrips[additional.order].makeMouseUp(position, call);
        break;
      case Table.COL:
        this.colGrips[additional.order].makeMouseUp(position, call);
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

    for (let i = 0; i < this._editableElement.rows.length; i++) {
      let line = this._editableElement.rows[i].line;
      if (line) {
        this.rowGrips.push(
          new TableGrip(this._container, this, Table.ROW, i, line)
        );
      }
      this.rowGrips[i].__on__();
    }
    for (let i = 0; i < this._editableElement.cols.length; i++) {
      let line = this._editableElement.cols[i].line;
      if (line) {
        this.colGrips.push(
          new TableGrip(this._container, this, Table.COL, i, line)
        );
      }
      this.colGrips[i].__on__();
    }
  }
  public removeEditableElement() {
    this.rowGrips.forEach(rowGrip => {
      rowGrip.__off__();
    })
    this.colGrips.forEach(colGrip => {
      colGrip.__off__();
    })
    this.rowGrips = [];
    this.colGrips = [];

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

    this._container.style.changeCursor(this.cursor);
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
