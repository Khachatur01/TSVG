export enum SVGEvent {
  STROKE_WIDTH_CHANGE,
  STROKE_DASH_ARRAY_CHANGE,
  STROKE_COLOR_CHANGE,
  FILL_COLOR_CHANGE,
  FONT_SIZE_CHANGE,
  FONT_COLOR_CHANGE,
  FONT_BACKGROUND_CHANGE,
  STYLE_CHANGE,

  POINTER_STROKE_WIDTH_CHANGE,
  POINTER_STROKE_DASH_ARRAY_CHANGE,
  POINTER_STROKE_COLOR_CHANGE,
  POINTER_FILL_COLOR_CHANGE,

  DRAWER_CHANGED,
  TOOL_ON,
  TOOL_OFF,
  ERASER_TOOl_ON,
  ERASER_TOOl_OFF,
  SELECT_TOOl_ON,
  SELECT_TOOl_OFF,
  DRAG_TOOL_ON,
  DRAG_TOOL_OFF,
  HIGHLIGHT_TOOl_ON,
  HIGHLIGHT_TOOl_OFF,
  POINTER_TOOl_ON,
  POINTER_TOOl_OFF,
  EDIT_COORDINATE_PLANE_TOOL_ON,
  EDIT_COORDINATE_PLANE_TOOL_OFF,
  EDIT_NODE_TOOl_ON,
  EDIT_NODE_TOOl_OFF,
  ELLIPSE_TOOL_ON,
  ELLIPSE_TOOL_OFF,
  CIRCLE_TOOL_ON,
  CIRCLE_TOOL_OFF,
  RECTANGLE_TOOL_ON,
  RECTANGLE_TOOL_OFF,
  ISOSCELES_TRIANGLE_TOOL_ON,
  ISOSCELES_TRIANGLE_TOOL_OFF,
  RIGHT_TRIANGLE_TOOL_ON,
  RIGHT_TRIANGLE_TOOL_OFF,
  GRAPHIC_TOOL_ON,
  GRAPHIC_TOOL_OFF,
  RAY_TOOL_ON,
  RAY_TOOL_OFF,
  LINE_TOOL_ON,
  LINE_TOOL_OFF,
  POLYLINE_TOOL_ON,
  POLYLINE_TOOL_OFF,
  POLYGON_TOOL_ON,
  POLYGON_TOOL_OFF,
  FREE_HAND_TOOL_ON,
  FREE_HAND_TOOL_OFF,
  TEXT_TOOL_ON,
  ASSET_EDIT,
  ASSET_EDIT_COMMIT,
  TEXT_TYPING,
  TEXT_TYPING_COMMIT,
  TEXT_BOX_REMOVED,
  TEXT_TOOL_OFF,
  VIDEO_TOOL_ON,
  VIDEO_TOOL_OFF,
  IMAGE_TOOL_ON,
  IMAGE_TOOL_OFF,
  ASSET_TOOL_ON,
  ASSET_TOOL_OFF,
  COORDINATE_PLANE_TOOL_ON,
  COORDINATE_PLANE_TOOL_OFF,
  COORDINATE_PLANE2_TOOL_ON,
  COORDINATE_PLANE2_TOOL_OFF,
  NUMBER_LINE_TOOL_ON,
  NUMBER_LINE_TOOL_OFF,
  NUMBER_LINE_TOOL2_ON,
  NUMBER_LINE_TOOL2_OFF,
  TABLE_TOOL_ON,
  TABLE_TOOL_OFF,
  EDIT_TABLE_TOOL_ON,
  EDIT_TABLE_TOOL_OFF,

  GRID_ON,
  GRID_OFF,
  SNAP_ON,
  SNAP_SIDE_CHANGE,
  SNAP_OFF,
  GROUP,
  UNGROUP,

  POINTER_MOVE,
  POINTER_CHANGE,
  ELEMENTS_FOCUSED,
  ELEMENTS_BLURRED,
  ALL_FOCUSED,
  ALL_BLURRED,
  PERFECT_MODE_ON,
  PERFECT_MODE_OFF,

  SELECT_AREA_MOUSE_DOWN,
  SELECT_AREA_MOUSE_MOVE,
  SELECT_AREA_MOUSE_UP,

  HIGHLIGHT_MOUSE_DOWN,
  HIGHLIGHT_MOUSE_MOVE,
  HIGHLIGHT_MOUSE_UP,
  HIGHLIGHTED,

  ELEMENT_ADDED,

  DRAW_MOUSE_DOWN,
  DRAW_MOUSE_MOVE,
  DRAW_MOUSE_UP,
  STOP_CLICK_DRAWING,
  ELEMENT_CREATED,
  END_DRAWING,

  DRAG_MOUSE_DOWN,
  DRAG_MOUSE_MOVE,
  DRAG_MOUSE_UP,
  ELEMENTS_DRAGGED,
  SET_ELEMENTS_POSITION,

  NODE_EDIT_MOUSE_DOWN,
  NODE_EDIT_MOUSE_MOVE,
  NODE_EDIT_MOUSE_UP,
  NODE_EDITED,

  TABLE_EDIT_MOUSE_DOWN,
  TABLE_EDIT_MOUSE_MOVE,
  TABLE_EDIT_MOUSE_UP,
  TABLE_EDITED,
  TABLE_RECREATED,
  SET_TABLE,
  ADD_TABLE_ROW,
  ADD_TABLE_COL,
  REMOVE_TABLE_ROW,
  REMOVE_TABLE_COL,
  MODIFY_TABLE_ROW,
  MODIFY_TABLE_COL,

  COORDINATE_PLANE2_EDITED,
  NUMBER_LINE2_EDITED,

  REF_POINT_VIEW_MOUSE_DOWN,
  REF_POINT_VIEW_MOUSE_MOVE,
  REF_POINT_VIEW_MOUSE_UP,
  REF_POINT_CHANGED,

  RECENTER_REFERENCE_POINT,

  ROTATE_MOUSE_DOWN,
  ROTATE_MOUSE_MOVE,
  ROTATE_MOUSE_UP,
  ELEMENTS_ROTATED,

  RESIZE_MOUSE_DOWN,
  RESIZE_MOUSE_MOVE,
  RESIZE_MOUSE_UP,
  ELEMENTS_RESIZED,

  COPY,
  CUT,
  PASTE,
  COPY_TEXT,
  CUT_TEXT,
  PASTE_TEXT,
  TO_TOP,
  TO_BOTTOM,
  ELEMENTS_DELETED,
  CLICKED_ON_CONTAINER
}
