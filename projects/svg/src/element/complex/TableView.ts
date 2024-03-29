import {ComplexView} from '../type/ComplexView';
import {ElementType} from '../../dataSource/constant/ElementType';
import {Point} from '../../model/Point';
import {Rect} from '../../model/Rect';
import {ElementCursor, ElementProperties, ElementView} from '../ElementView';
import {PathView} from '../shape/path/PathView';
import {Container} from '../../Container';
import {MoveDrawable} from '../../service/tool/draw/type/MoveDrawable';
import {LineView} from '../shape/pointed/LineView';
import {SVGEvent} from '../../dataSource/constant/SVGEvent';
import {RectangleView} from '../shape/pointed/polygon/rectangle/RectangleView';

interface TableRow {
  height: number;
  line?: LineView;
}

interface TableCol {
  width: number;
  line?: LineView;
}

export class TableCursor extends ElementCursor {}

export interface TableProperties extends ElementProperties {}

export class TableView extends ComplexView implements MoveDrawable {
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'g');
  protected _type: ElementType = ElementType.TABLE;
  public override readonly rotatable: boolean = false;

  private _lastRows: TableRow[] = [];
  private _lastCols: TableCol[] = [];
  private _resizingRect: Rect = {x: 0, y: 0, width: 0, height: 0};

  private _rows: TableRow[] = [];
  private _cols: TableCol[] = [];
  private readonly background: RectangleView;
  private readonly _topBorderLine: LineView;
  private readonly _leftBorderLine: LineView;

  public constructor(container: Container,
                     properties: TableProperties = {},
                     rect: Rect = {x: 0, y: 0, width: 1, height: 1},
                     cols: number = 0, rows: number = 0,
                     ownerId?: string, index?: number) {

    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.background = new RectangleView(this._container, {overEvent: false, globalStyle: false}, rect);
    this.background.style.strokeWidth = '0';
    this._topBorderLine = new LineView(
      this._container,
      {overEvent: false, globalStyle: false},
      {x: rect.x, y: rect.y}, {x: rect.x + rect.width, y: rect.y}
    );
    this._leftBorderLine = new LineView(
      this._container,
      {overEvent: false, globalStyle: false},
      {x: rect.x, y: rect.y}, {x: rect.x, y: rect.y + rect.height}
    );

    this.recreate(rect, rows, cols, false);

    this.svgElement.appendChild(this.background.SVG);
    this.svgElement.appendChild(this._topBorderLine.SVG);
    this.svgElement.appendChild(this._leftBorderLine.SVG);

    this.__fixRect__();

    this.setProperties(properties);
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point): void {
    const delta: Point = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x === 0 && delta.y === 0) {
      return;
    }

    this._rect.x += delta.x;
    this._rect.y += delta.y;

    this.__updateView__();
  }

  public __drag__(delta: Point): void {
    this._rect.x += delta.x;
    this._rect.y += delta.y;
    this.background.__drag__(delta);
    this._topBorderLine.__drag__(delta);
    this._leftBorderLine.__drag__(delta);
    this._rows.forEach((row: TableRow) => {
      row.line?.__drag__(delta);
    });
    this._cols.forEach((col: TableCol) => {
      col.line?.__drag__(delta);
    });
  }

  public getRowsHeight(from: number = 0, to: number = this._rows.length): number {
    let height: number = 0;
    if (from > to) {
      while (from <= to) {
        if (this._rows[from]) {
          height += this._rows[from].height;
        }
        from++;
      }
    } else {
      while (to <= from) {
        if (this._rows[to]) {
          height += this._rows[to].height;
        }
        to++;
      }
    }
    return height;
  }
  public getColsWidth(from: number = 0, to: number = this._cols.length): number {
    let width: number = 0;
    while (from <= to) {
      width += this._cols[from].width;
      from++;
    }
    return width;
  }

  public get topBorder(): LineView {
    return this._topBorderLine;
  }
  public get leftBorder(): LineView {
    return this._leftBorderLine;
  }
  public get rows(): TableRow[] {
    return this._rows;
  }
  public get cols(): TableCol[] {
    return this._cols;
  }
  public addRow(height: number, after?: number, call: boolean = true): void {
    this._rect.height += height;
    if (!after || after > this._rows.length - 1) {
      after = this._rows.length - 1;
    }
    this._rows.splice(after + 1, 0, {height});
    this.__rerenderView__();

    if (this._container.tools.editTableTool.isOn()) {
      this._container.tools.editTableTool.editableElement = this;
    } else if (this._container.focused.children.has(this)) {
      this._container.focused.__fit__();
    }
    if (call) {
      this._container.__call__(SVGEvent.ADD_TABLE_ROW, {height, after, element: this});
    }
  }
  public removeRow(index?: number, call: boolean = true): void {
    if (this._rows.length > 0) {
      if (!index || index > this._rows.length - 1) {
        index = this._rows.length - 1;
      }
      this._rect.height -= this._rows[index].height;
      this._rows.splice(index, 1);
      this.__rerenderView__();

      if (this._container.tools.editTableTool.isOn()) {
        this._container.tools.editTableTool.editableElement = this;
      } else if (this._container.focused.children.has(this)) {
        this._container.focused.__fit__();
      }
      if (call) {
        this._container.__call__(SVGEvent.REMOVE_TABLE_ROW, {index, element: this});
      }
    }
  }
  public addCol(width: number, after?: number, call: boolean = true): void {
    this._rect.width += width;
    if (!after || after > this._cols.length - 1) {
      after = this._cols.length - 1;
    }
    this._cols.splice(after + 1, 0, {width});
    this.__rerenderView__();

    if (this._container.tools.editTableTool.isOn()) {
      this._container.tools.editTableTool.editableElement = this;
    } else if (this._container.focused.children.has(this)) {
      this._container.focused.__fit__();
    }
    if (call) {
      this._container.__call__(SVGEvent.ADD_TABLE_COL, {width, after, element: this});
    }
  }
  public removeCol(index?: number, call: boolean = true): void {
    if (this._cols.length > 0) {
      if (!index || index > this._cols.length - 1) {
        index = this._cols.length - 1;
      }
      this._rect.width -= this._cols[index].width;
      this._cols.splice(index, 1);
      this.__rerenderView__();

      if (this._container.tools.editTableTool.isOn()) {
        this._container.tools.editTableTool.editableElement = this;
      } else if (this._container.focused.children.has(this)) {
        this._container.focused.__fit__();
      }
      if (call) {
        this._container.__call__(SVGEvent.REMOVE_TABLE_COL, {index, element: this});
      }
    }
  }
  public modifyRow(index: number, height: number): number {
    const minHeight: number = parseInt(this.style.strokeWidth) + 2;
    if (index === -1) { /* modify top border */
      if (height > minHeight) {
        const oldHeight: number = this._rows[index + 1].height;
        const deltaHeight: number = height - oldHeight;
        this._rows[index + 1].height = height;
        this._rect.y -= deltaHeight;
        this._rect.height += deltaHeight;
        this.__updateView__();
      }
      return this._rows[index + 1].height;
    } else {
      const oldHeight: number = this._rows[index].height;
      const deltaHeight: number = height - oldHeight;

      const previousRowY: number | undefined = index === 0 ? this._rect.y : this._rows[index - 1].line?.getPoint(0).y;
      const thisRowY: number | undefined = this._rows[index].line?.getPoint(0).y;
      const nextRowY: number | undefined = index === this._rows.length - 1 ? this._rect.y + this._rect.height : this._rows[index + 1].line?.getPoint(0).y;

      if (!(previousRowY && thisRowY && nextRowY)) {
        return this._rows[index].height;
      }

      if (previousRowY + minHeight < thisRowY + deltaHeight && (index === this._rows.length - 1 || thisRowY + deltaHeight < nextRowY - minHeight)) {
        this._rows[index].height = height;
        if (index === this._rows.length - 1) {
          this._rect.height += deltaHeight;
        } else {
          this._rows[index + 1].height -= deltaHeight;
        }
      }

      this.__updateView__();
      return this._rows[index].height;
    }
  }
  public modifyCol(index: number, width: number): number {
    const minWidth: number = parseInt(this.style.strokeWidth) + 2;
    if (index === -1) { /* modify left border */
      if (width > minWidth) {
        const oldWidth: number = this._cols[index + 1].width;
        const deltaWidth: number = width - oldWidth;
        this._cols[index + 1].width = width;
        this._rect.x -= deltaWidth;
        this._rect.width += deltaWidth;
        this.__updateView__();
      }
      return this._cols[index + 1].width;
    } else {
      const oldWidth: number = this._cols[index].width;
      const deltaWidth: number = width - oldWidth;

      const previousRowX: number | undefined = index === 0 ? this._rect.x : this._cols[index - 1].line?.getPoint(0).x;
      const thisColX: number | undefined = this._cols[index].line?.getPoint(0).x;
      const nextColX: number | undefined = index === this._cols.length - 1 ? this._rect.x + this._rect.width : this._cols[index + 1].line?.getPoint(0).x;

      if (!(previousRowX && thisColX && nextColX)) {
        return this._cols[index].width;
      }

      if (previousRowX + minWidth < thisColX + deltaWidth && (index === this._cols.length - 1 || thisColX + deltaWidth < nextColX - minWidth)) {
        this._cols[index].width = width;
        if (index === this._cols.length - 1) {
          this._rect.width += deltaWidth;
        } else {
          this._cols[index + 1].width -= deltaWidth;
        }
      }

      this.__updateView__();
      return this._cols[index].width;
    }
  }

  public recreate(rect: Rect, rows: number, cols: number, call: boolean = true): void {
    this._rows = [];
    this._cols = [];

    rect = ElementView.normalizeRect(rect);

    this._rect = rect;

    if (rows > 0) {
      const height: number = rect.height / rows;
      for (let i: number = 0; i < rows; i++) {
        this._rows.push({height});
      }
    }
    if (cols > 0) {
      const width: number = rect.width / cols;
      for (let i: number = 0; i < cols; i++) {
        this._cols.push({width});
      }
    }
    this.__rerenderView__();

    if (call) {
      this._container.__call__(SVGEvent.TABLE_RECREATED, {rows, cols, element: this});
    }
  }

  public setTable(rect: Rect, rows: TableRow[], cols: TableCol[], call: boolean = true): void {
    this._rows = rows;
    this._cols = cols;
    this._rect = rect;
    this.__rerenderView__();

    if (call) {
      this._container.__call__(SVGEvent.SET_TABLE, {rows, cols, element: this});
    }
  }

  public __drawSize__(rect: Rect): void {
    this.recreate(rect, this._rows.length, this._cols.length, false);
  }

  public override __setRect__(rect: Rect): void {
    let dw: number = 1;
    let dh: number = 1;

    if (this._lastRect.width !== 0) {
      dw = rect.width / (this._lastRect.width);
    }
    if (this._lastRect.height !== 0) {
      dh = rect.height / (this._lastRect.height);
    }

    for (let i: number = 0; i < this._lastRows.length; i++) {
      this._rows[i].height = Math.abs(this._lastRows[i].height * dh);
    }
    for (let i: number = 0; i < this._lastCols.length; i++) {
      this._cols[i].width = Math.abs(this._lastCols[i].width * dw);
    }

    /*
    * When changes resizing direction(fe. width: -20 -> 20 or height: 20 -> -20), columns or rows should be reversed.
    * */
    if (rect.width * this._resizingRect.width < 0) {
      this._cols.reverse();
      this._lastCols.reverse();
    }
    if (rect.height * this._resizingRect.height < 0) {
      this._rows.reverse();
      this._lastRows.reverse();
    }
    this._resizingRect = Object.assign({}, rect);

    if (rect.width < 0) {
      rect.x += rect.width;
      rect.width = -rect.width;
    }
    if (rect.height < 0) {
      rect.y += rect.height;
      rect.height = -rect.height;
    }
    this._rect = rect;

    this.__updateView__();
  }

  /** remove old table and draw new */
  public __rerenderView__(): void {
    this.svgElement.innerHTML = '';
    this.svgElement.appendChild(this.background.SVG);
    this.svgElement.appendChild(this._topBorderLine.SVG);
    this.svgElement.appendChild(this._leftBorderLine.SVG);

    this.background.__drawSize__(this._rect);
    this._topBorderLine.replacePoint(0, {x: this._rect.x, y: this._rect.y});
    this._topBorderLine.replacePoint(1, {x: this._rect.x + this._rect.width, y: this._rect.y});
    this._leftBorderLine.replacePoint(0, {x: this._rect.x, y: this._rect.y});
    this._leftBorderLine.replacePoint(1, {x: this._rect.x, y: this._rect.y + this._rect.height});

    let currentHeight: number = 0;
    for (const item of this._rows) {
      currentHeight += item.height;
      const line: LineView = new LineView(this._container,
        {overEvent: false, globalStyle: false},
        {x: this._rect.x, y: currentHeight + this._rect.y},
        {x: this._rect.x + this._rect.width, y: currentHeight + this._rect.y});
      item.line = line;
      this.svgElement.appendChild(line.SVG);
    }

    let currentWidth: number = 0;
    for (const item of this._cols) {
      currentWidth += item.width;
      const line: LineView = new LineView(this._container,
        {overEvent: false, globalStyle: false},
        {x: currentWidth + this._rect.x, y: this._rect.y},
        {x: currentWidth + this._rect.x, y: this._rect.y + this._rect.height});
      item.line = line;
      this.svgElement.appendChild(line.SVG);
    }
  }
  /** modify table lineViews only */
  public __updateView__(): void {
    this.background.__drawSize__(this._rect);
    this._topBorderLine.replacePoint(0, {x: this._rect.x, y: this._rect.y});
    this._topBorderLine.replacePoint(1, {x: this._rect.x + this._rect.width, y: this._rect.y});
    this._leftBorderLine.replacePoint(0, {x: this._rect.x, y: this._rect.y});
    this._leftBorderLine.replacePoint(1, {x: this._rect.x, y: this._rect.y + this._rect.height});

    let currentHeight: number = 0;
    for (const item of this._rows) {
      currentHeight += item.height;
      item.line?.replacePoint(0, {x: this._rect.x, y: currentHeight + this._rect.y});
      item.line?.replacePoint(1, {x: this._rect.x + this._rect.width, y: currentHeight + this._rect.y});
    }

    let currentWidth: number = 0;
    for (const item of this._cols) {
      currentWidth += item.width;
      item.line?.replacePoint(0, {x: currentWidth + this._rect.x, y: this._rect.y});
      item.line?.replacePoint(1, {x: currentWidth + this._rect.x, y: this._rect.y + this._rect.height});
    }
  }

  public override set cursor(cursor: string) {
    this.svgElement.style.cursor = cursor;
    this._rows.forEach((row: TableRow) => {
      if (row.line?.SVG.style) {
        row.line.SVG.style.cursor = cursor;
      }
    });
    this._cols.forEach((col: TableCol) => {
      if (col.line?.SVG.style) {
        col.line.SVG.style.cursor = cursor;
      }
    });
  }

  public override __fixRect__(): void {
    super.__fixRect__();
    this.background.__fixRect__();
    this._topBorderLine.__fixRect__();
    this._leftBorderLine.__fixRect__();

    this._lastRows = [];
    for (const item of this._rows) {
      this._lastRows.push({height: item.height});
      item.line?.__fixRect__();
    }
    this._lastCols = [];
    for (const item of this._cols) {
      this._lastCols.push({width: item.width});
      item.line?.__fixRect__();
    }
    this._resizingRect = {x: 0, y: 0, width: 0, height: 0};
  }

  public get copyRows(): TableRow[] {
    const rowsCopy: TableRow[] = [];
    this._rows.forEach((row: TableRow) => {
      rowsCopy.push({height: row.height});
    });
    return rowsCopy;
  }
  public get copyCols(): TableCol[] {
    const colsCopy: TableCol[] = [];
    this._cols.forEach((col: TableCol) => {
      colsCopy.push({width: col.width});
    });
    return colsCopy;
  }

  public isComplete(): boolean {
    return this._rect.width > 0 && this._rect.height > 0 && this._rows.length > 0 && this._cols.length > 0;
  }

  public toPath(): PathView {
    /* TODO */
    return new PathView(this._container);
  }

  public override toJSON(): any {
    const json: any = super.toJSON();
    json.rows = this.copyRows;
    json._cols = this.copyCols;
    return json;
  }
  public override fromJSON(json: any): void {
    super.fromJSON(json);
    this._rows = json.rows;
    this._cols = json._cols;
    this.__rerenderView__();
  };
}
