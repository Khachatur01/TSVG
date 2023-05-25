import {ForeignObjectProperties, ForeignObjectView} from '../ForeignObjectView';
import {Container} from '../../../Container';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {ElementCursor} from '../../ElementView';
import {Rect} from '../../../model/Rect';
import {Cursor} from '../../../dataSource/constant/Cursor';

export class TextBoxCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.DRAW_TEXT_BOX] = 'text';
  }
}

export interface TextBoxProperties extends ForeignObjectProperties {}

export class TextBoxView extends ForeignObjectView {
  protected override _type: ElementType = ElementType.TEXT_BOX;
  protected override _content: HTMLTextAreaElement;
  private _lastCommittedText: string = '';
  public override defaultOutline: string = 'thin solid #ddd';
  public override erasable: boolean = true;

  protected override cutEvent: (event: ClipboardEvent) => void = (event: ClipboardEvent) => {
    const text: string | undefined = document.getSelection()?.toString();
    if (text) {
      this._container.focused.__clipboard__.text = text;

      this.replaceSelected('');
      event.preventDefault();
    }
  };
  protected override pasteEvent: (event: ClipboardEvent) => void = (event: ClipboardEvent) => {
    const paste: string = this.container.focused.__clipboard__.text;

    this.replaceSelected(paste);
    event.preventDefault();
  };

  protected override inputEvent: () => void = () => {
    this._container.__call__(SVGEvent.TEXT_TYPING, {text: this._content.value, element: this});
  };
  protected override blurEvent: () => void = () => {
    this._content.blur();
    this.__onBlur__();

    this._content.scrollTop = 0;
    if (this._content.value === '') {
      this._container.remove(this, true);
      this._container.__call__(SVGEvent.TEXT_BOX_REMOVED, {element: this});
    }

    /* if last committed text is equals to current text, don't call change callback */
    if (this._lastCommittedText !== this._content.value) {
      this._container.__call__(SVGEvent.TEXT_TYPING_COMMIT, {text: this._content.value, element: this});
      this._lastCommittedText = this._content.value;
    }
  };

  public constructor(container: Container, properties: TextBoxProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, {}, rect, ownerId, index);

    this.svgElement.style.outline = this.defaultOutline;
    this._content = document.createElement('textarea');
    this._content.style.width = '100%';
    this._content.style.height = '100%';
    this._content.style.resize = 'none';
    this._content.style.overflow = 'hidden';
    this._content.style.border = 'none';
    this._content.style.outline = 'none';
    this._content.spellcheck = false;
    this.svgElement.innerHTML = '';
    this.svgElement.appendChild(this._content);
    /* prevent from dropping elements inside */
    this._content.ondrop = () => false;

    this.addFocusEvent();

    this.safeClipboard = this._container.focused.__clipboard__.isSafe;

    this.setProperties(properties);
  }

  public get text(): string {
    return this._content.value;
  }
  public set text(text: string) {
    this._content.value = text;
  }

  public override get content(): HTMLTextAreaElement {
    return this._content;
  }

  public replaceSelected(text: string): void {
    const start: number = this._content.selectionStart;
    const end: number = this._content.selectionEnd;
    this.text = this.text.substring(0, start) + text + this.text.substring(end);
    const replacedTextEnd: number = start + text.length;
    this._content.setSelectionRange(replacedTextEnd, replacedTextEnd);
  }

  public override isComplete(): boolean {
    return this._rect.width > 15 && this._rect.height > 15;
  }

  public override toJSON(): any {
    const json: any = super.toJSON();
    json.content = undefined;
    json.text = this._content.value;
    return json;
  }
  public override fromJSON(json: any): void {
    super.fromJSON(json);
    this.text = json.text;
  };
}
