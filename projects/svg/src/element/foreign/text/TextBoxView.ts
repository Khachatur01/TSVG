import {ForeignObjectView} from "../ForeignObjectView";
import {Container} from "../../../Container";
import {Event} from "../../../dataSource/constant/Event";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementCursor} from "../../ElementView";
import {Rect} from "../../../model/Rect";
import {ElementProperties} from "../../../model/ElementProperties";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class TextBoxCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.DRAW_TEXT_BOX] = "text";
  }
}

export class TextBoxView extends ForeignObjectView {
  protected override _type: ElementType = ElementType.TEXT_BOX;
  protected override _content: HTMLTextAreaElement;
  private _lastCommittedText: string = "";

  public constructor(container: Container, properties: ElementProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, removeOnEmpty: boolean = true, ownerId?: string, index?: number) {
    super(container, {}, rect, ownerId, index);

    this._content = document.createElement("textarea");
    this._content.style.width = "100%";
    this._content.style.height = "100%";
    this._content.style.resize = "none";
    this._content.style.overflow = "hidden";
    this._content.style.border = "none";
    this._content.style.outline = "none";
    this._content.spellcheck = false;
    this.svgElement.innerHTML = "";
    this.svgElement.appendChild(this._content);
    /* prevent from dropping elements inside */
    this._content.ondrop = () => {return false};

    this.addEditCallBack();
    this.addFocusEvent();
    this.addCopyEvent();
    this.addCutEvent();
    this.addPasteEvent();

    if (removeOnEmpty) {
      this._container.addCallBack(Event.EDIT_NODE_TOOl_OFF, () => {
        if (this._content.value == "") {
          this._container.remove(this);
        }
      });
    }

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
  public override addEditCallBack() {
    this._content.addEventListener("input", () => {
      this._container.__call__(Event.TEXT_TYPING, {text: this._content.value, element: this}
      );
    });

    this._content.addEventListener('blur', () => {
      this._content.scrollTop = 0;
      if (this._content.value == "") {
        this._container.remove(this, true);
        this._container.selectTool.on();
      }
      /* Tool already changed to draw free. No need to check */
      /* if last committed text is equals to current text, don't call change callback */
      if (this._container.drawTool.isOn() && this._lastCommittedText !== this._content.value/* && this._container.drawTool.tool == this._container.drawTools.textBox*/) {
        this._lastCommittedText = this._content.value;
        this._container.__call__(Event.TEXT_TYPING_COMMIT, {text: this._content.value, element: this});
      }
    });
  }

  protected override addCutEvent() {
    this._content.addEventListener('cut', (event: ClipboardEvent) => {
      let text = document.getSelection()?.toString();
      if (text) {
        this._container.focused.__clipboard__.text = text;

        this.replaceSelected("");
      }
      event.preventDefault();
    });
  }
  protected override addPasteEvent() {
    this._content.addEventListener('paste', (event: ClipboardEvent) => {
      let paste = this.container.focused.__clipboard__.text;

      this.replaceSelected(paste);
      event.preventDefault();
    });
  }

  public replaceSelected(text: string) {
    let start = this._content.selectionStart;
    let end = this._content.selectionEnd;
    this.text = this.text.substring(0, start) + text + this.text.substring(end);
  }

  public override get copy(): TextBoxView {
    let copy: TextBoxView = Object.assign(new TextBoxView(this._container, this._properties), super.copy);
    copy._type = ElementType.TEXT_BOX;
    copy.text = this.text;
    return copy;
  }

  public override isComplete(): boolean {
    return this._rect.width > 15 && this._rect.height > 15;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["content"] = undefined;
    json["text"] = this._content.value;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.text = json.text;
  };
}
