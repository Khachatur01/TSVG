export enum Callback {
  STYLE_CHANGE, /* callback parameter (strokeWidth, fontBackground, strokeColor, fillColor, fontSize, fontColor, fontBackground) */

  SELECT_TOOl_ON,
  SELECT_TOOl_OFF,
  HIGHLIGHT_TOOl_ON,
  HIGHLIGHT_TOOl_OFF,
  POINTER_TOOl_ON,
  POINTER_TOOl_OFF,
  EDIT_TOOl_ON,
  NODE_EDIT_START,
  NODE_EDIT, /* callback parameter (position) */
  NODE_EDIT_END,
  EDIT_TOOl_OFF,
  CIRCLE_TOOL_ON,
  CIRCLE_TOOL_OFF,
  RECTANGLE_TOOL_ON,
  RECTANGLE_TOOL_OFF,
  ISOSCELES_TRIANGLE_TOOL_ON,
  ISOSCELES_TRIANGLE_TOOL_OFF,
  RIGHT_TRIANGLE_TOOL_ON,
  RIGHT_TRIANGLE_TOOL_OFF,
  LINE_TOOL_ON,
  LINE_TOOL_OFF,
  POLYLINE_TOOL_ON,
  POLYLINE_TOOL_OFF,
  POLYGON_TOOL_ON,
  POLYGON_TOOL_OFF,
  FREE_HAND_TOOL_ON,
  FREE_HAND_TOOL_OFF,
  TEXT_TOOL_ON,
  ASSET_EDIT, /* callback parameter (asset content) */
  TEXT_TYPING, /* callback parameter (text) */
  TEXT_TOOL_OFF,
  VIDEO_TOOL_ON,
  VIDEO_TOOL_OFF,
  IMAGE_TOOL_ON,
  IMAGE_TOOL_OFF,
  ASSET_TOOL_ON,
  ASSET_TOOL_OFF,
  GRAPHIC_TOOL_ON,
  GRAPHIC_TOOL_OFF,

  GRID_ON,
  GRID_OFF,
  SNAP_ON,
  SNAP_SIDE_CHANGE, /* callback parameter (side) */
  SNAP_OFF,
  GROUP,
  UNGROUP,

  ELEMENT_FOCUSED, /* callback parameter (element) */
  ELEMENT_BLURRED, /* callback parameter (element) */
  BLURRED,
  PERFECT_MODE_ON,
  PERFECT_MODE_OFF,
  DRAW_CLICK, /* callback parameter (position) */
  DRAW_MOVE, /* callback parameter (position) */
  DRAW_END,
  DRAG_TOOL_ON,
  DRAG_START,
  DRAG, /* callback parameter (position) for translation */
  DRAG_END, /* callback parameter (position) for drag */
  DRAG_TOOL_OFF,
  REF_POINT_VIEW_CHANGE_START,
  REF_POINT_VIEW_CHANGE, /* callback parameter (position) */
  REF_POINT_VIEW_CHANGE_END,
  REF_POINT_CHANGE, /* callback parameter (position) */
  ROTATE_START,
  ROTATE,
  ROTATE_END,
  RESIZE_START,
  RESIZE, /* callback parameter (rect) */
  RESIZE_END,
  COPY,
  CUT,
  PASTE,
  TO_TOP,
  TO_BOTTOM,
  ELEMENT_DELETED
}
