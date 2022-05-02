import {ForeignObjectView} from "../ForeignObjectView";
import {Container} from "../../../Container";
import {Event} from "../../../dataSource/constant/Event";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {ElementCursor} from "../../ElementView";
import {Rect} from "../../../model/Rect";

export class TextBoxCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "auto"; /* fixme on select tool cursor is text */
  }
}

export class TextBoxView extends ForeignObjectView {
  protected override _type: ElementType = ElementType.TEXT_BOX;
  protected override _content: HTMLTextAreaElement;

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, removeOnEmpty: boolean = true, ownerId?: string, index?: number) {
    super(container, rect, ownerId, index);

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

    if (removeOnEmpty) {
      this._container.addCallBack(Event.EDIT_TOOl_OFF, () => {
        if (this._content.value == "")
          this._container.remove(this);
      });
    }

    this.style.setDefaultStyle();
    this.addEditCallBack();
  }

  public get text(): string {
    return this._content.value;
  }
  public set text(text: string) {
    this._content.value = text;
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
      if (this._container.editTool.isOn()) {
        this._container.__call__(Event.TEXT_TYPING_COMMIT, {
          text: this._content.value,
          element: this
        });
      }
    });
  }

  public override get copy(): TextBoxView {
    let copy = super.copy as TextBoxView;
    copy.text = this.text;
    return copy;
  }

  public override isComplete(): boolean {
    return this._rect.width > 15 && this._rect.height > 15;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["text"] = this._content.value;
    json["content"] = undefined;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.text = json.text;
  };
}
