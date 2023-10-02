import {ElementView} from "../../../../../projects/svg/src/element/ElementView";

export interface SVGClipboard {
  elements: Set<ElementView>;
  text: string;
  isSafe: boolean;
}
