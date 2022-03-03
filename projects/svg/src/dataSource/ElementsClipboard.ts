import {ElementView} from "../element/ElementView";

export class ElementsClipboard {
  private static xElements: ElementView[];

  public static get(): ElementView[] {
    return ElementsClipboard.xElements;
  }
  public static save(xElements: ElementView[]): void {
    ElementsClipboard.xElements = xElements;
  }
  public static clear(): void {
    ElementsClipboard.xElements = [];
  }
}
