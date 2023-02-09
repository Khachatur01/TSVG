import {Tool} from '../Tool';
import {Container} from '../../../Container';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';
import {PathView} from '../../../element/shape/path/PathView';
import {Path} from '../../../model/path/Path';
import {MoveTo} from '../../../model/path/point/MoveTo';
import {LineTo} from '../../../model/path/line/LineTo';
import {ElementView} from '../../../element/ElementView';
import {Point} from '../../../model/Point';
import {Cursor} from '../../../dataSource/constant/Cursor';

export class HighlightTool extends Tool {
  protected override _cursor: Cursor = Cursor.HIGHLIGHTER;
  private _timeout = 3000;
  private _color = '#7efca0AA';
  private _width = '20';
  private path: PathView;
  private group: SVGGElement;
  private _highlighting = false;

  public constructor(container: Container, group?: SVGGElement) {
    super(container);

    this.path = new PathView(container);

    if (group) {
      this.group = group;
    } else {
      this.group = document.createElementNS(ElementView.svgURI, 'g');
      this.group.id = 'highlight';
    }

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent) {
    this._container.HTML.addEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);

    const containerRect = this._container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = eventPosition;

    const startPosition = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseDown(startPosition);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent) {
    const containerRect = this._container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = eventPosition;

    const movePosition = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseMove(movePosition);
  };
  private mouseUpEvent() {
    this._container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);

    const containerRect = this._container.HTML.getBoundingClientRect();

    const position = {
      x: this._mouseCurrentPos.x - containerRect.left,
      y: this._mouseCurrentPos.y - containerRect.top
    };
    this.makeMouseUp(position);
  };

  public makeMouseDown(position: Point, call: boolean = true, settings?: any) {
    if (this._highlighting) {
      return;
    }
    const start = new Path();
    start.add(
      new MoveTo(position)
    );

    if (settings) {
      this._timeout = settings.timeout;
      this._color = settings.color;
      this._width = settings.width;
    }

    this.path = new PathView(this._container, {overEvent: false, globalStyle: false}, start);
    this.path.style.strokeWidth = this._width;
    this.path.style.strokeColor = this._color;
    this.path.style.fillColor = 'none';
    this.path.SVG.style.pointerEvents = 'none';

    this.group.appendChild(this.path.SVG);

    this._highlighting = true;
    if (call) {
      this._container.__call__(SVGEvent.HIGHLIGHT_MOUSE_DOWN, {position, element: this.path, settings: {timeout: this._timeout, color: this._color, width: this._width}});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true, path?: string) {
    if (path) {
      this.path?.setAttr({
        d: path
      });
    } else {
      this.path?.addCommand(new LineTo(position));
    }

    if (call) {
      this._container.__call__(SVGEvent.HIGHLIGHT_MOUSE_MOVE, {position, element: this.path});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true, path?: string) {
    if (path) {
      /*
         there is no need to parse path string, because highlight path should not be dragged or resized
         this.path?.path.fromString(path);
      */

      this.path?.setAttr({
        d: path
      });
    }

    const pathView = this.path;
    setTimeout(() => {
      if (pathView) {
        this.group.removeChild(pathView.SVG);
      }
    }, this._timeout);

    this._highlighting = false;
    if (call) {
      this._container.__call__(SVGEvent.HIGHLIGHT_MOUSE_UP, {position, element: this.path});
      this._container.__call__(SVGEvent.HIGHLIGHTED, {element: this.path, settings: {timeout: this._timeout, color: this._color, width: this._width}});
    }
  }
  public highlight(path: Path | string) {
    this.path = new PathView(this._container);

    if (path instanceof Path) {
      this.path.path = path;
    } else {
      this.path.setAttr({d: path});
    }

    this.path.style.strokeWidth = this._width;
    this.path.style.strokeColor = this._color;
    this.path.style.fillColor = 'none';
    this.path.SVG.style.pointerEvents = 'none';

    this.group.appendChild(this.path.SVG);

    const pathView = this.path;
    setTimeout(() => {
      if (pathView) {
        this.group.removeChild(pathView.SVG);
      }
    }, this._timeout);
  }

  public set timeout(milliseconds: number) {
    this._timeout = milliseconds;
  }
  public set color(color: string) {
    this._color = color;
  }
  public set width(width: number) {
    this._width = width + '';
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public get SVG(): SVGGElement {
    return this.group;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public set SVG(group: SVGGElement) {
    this.group = group;
  }

  public override on(call: boolean = true): boolean {
    if (!super.on(call)) {
      return false;
    }
    this._container.HTML.addEventListener('mousedown', this.mouseDownEvent);
    this._container.HTML.addEventListener('touchstart', this.mouseDownEvent);
    this._container.blur();

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(SVGEvent.HIGHLIGHT_TOOl_ON);
    }
    return true;
  }
  public override off(call: boolean = true): boolean {
    if (!super.off(call)) {
      return false;
    }
    this._container.HTML.removeEventListener('mousedown', this.mouseDownEvent);
    this._container.HTML.removeEventListener('touchstart', this.mouseDownEvent);

    if (call) {
      this._container.__call__(SVGEvent.HIGHLIGHT_TOOl_OFF);
    }
    return true;
  }
}
