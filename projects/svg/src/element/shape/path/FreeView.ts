import {PathCursor, PathProperties, PathView} from './PathView';
import {Container} from '../../../Container';
import {Path} from '../../../model/path/Path';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {Cursor} from '../../../dataSource/constant/Cursor';

export class FreeCursor extends PathCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT_NODE] = 'auto';
  }
}

export interface FreeProperties extends PathProperties {}

export class FreeView extends PathView {
  protected override _type: ElementType = ElementType.FREE;

  constructor(container: Container, properties: FreeProperties = {}, path: Path = new Path(), ownerId?: string, index?: number) {
    super(container, {}, path, ownerId, index);
    this.setProperties(properties);
  }
}
