// @flow
import { all, call, fork, takeEvery, put } from "redux-saga/effects";
import {
  CHANGE_LAYOUT,
  CHANGE_LAYOUT_MODE,
  CHANGE_LAYOUT_WIDTH,
  CHANGE_SIDEBAR_THEME,
  CHANGE_SIDEBAR_TYPE,
  CHANGE_TOPBAR_THEME,
  SHOW_RIGHT_SIDEBAR,
} from "./actionTypes";
import {
  changeSidebarType as changeSidebarTypeAction,
  changeTopbarTheme as changeTopbarThemeAction,
} from "./actions";

/**
 * Changes the body attribute
 */
function changeBodyAttribute(attribute: string, value: string | boolean): boolean {
  if (document.body) document.body.setAttribute(attribute, String(value));
  return true;
}

/**
 * Toggle the class on body
 */
function manageBodyClass(cssClass: string, action: "add" | "remove" | "toggle" = "toggle"): boolean {
  switch (action) {
    case "add":
      document.body.classList.add(cssClass);
      break;
    case "remove":
      document.body.classList.remove(cssClass);
      break;
    default:
      document.body.classList.toggle(cssClass);
      break;
  }
  return true;
}

interface Action<T> {
  type: string;
  payload: T;
}

/**
 * Changes the layout type
 */
function* changeLayout({ payload: layout }: Action<string>) {
  try {
    if (layout === "horizontal") {
      yield put(changeTopbarThemeAction("light"));
      document.body.removeAttribute("data-sidebar");
      document.body.removeAttribute("data-sidebar-size");
    } else {
      yield put(changeTopbarThemeAction("light"));
    }
    yield call(changeBodyAttribute, "data-layout", layout);
  } catch (error) {}
}

/**
 * Changes the layout mode
 */
function* changeLayoutMode({ payload: layoutMode }: Action<string>) {
  try {
    yield call(changeBodyAttribute, "data-bs-theme", layoutMode);
    yield put(changeTopbarThemeAction(layoutMode === "light" ? "light" : "dark"));
  } catch (error) {}
}

/**
 * Changes the layout width
 */
function* changeLayoutWidth({ payload: width }: Action<string>) {
  try {
    if (width === "boxed") {
      yield put(changeSidebarTypeAction("icon","true"));
      yield call(changeBodyAttribute, "data-layout-size", width);
      yield call(changeBodyAttribute, "data-layout-scrollable", false);
    } else if (width === "scrollable") {
      yield put(changeSidebarTypeAction("default","true"));
      yield call(changeBodyAttribute, "data-layout-scrollable", true);
    } else {
      yield put(changeSidebarTypeAction("default","true"));
      yield call(changeBodyAttribute, "data-layout-size", width);
      yield call(changeBodyAttribute, "data-layout-scrollable", false);
    }
  } catch (error) {}
}

/**
 * Changes the left sidebar theme
 */
function* changeLeftSidebarTheme({ payload: theme }: Action<string>) {
  try {
    yield call(changeBodyAttribute, "data-sidebar", theme);
  } catch (error) {}
}

/**
 * Changes the topbar theme
 */
function* changeTopbarTheme({ payload: theme }: Action<string>) {
  try {
    yield call(changeBodyAttribute, "data-topbar", theme);
  } catch (error) {}
}

interface SidebarPayload {
  sidebarType: string;
  isMobile: boolean;
}

/**
 * Changes the left sidebar type
 */
function* changeLeftSidebarType({ payload: { sidebarType, isMobile } }: Action<SidebarPayload>) {
  try {
    switch (sidebarType) {
      case "compact":
        yield call(changeBodyAttribute, "data-sidebar-size", "small");
        yield call(manageBodyClass, "sidebar-enable", "remove");
        yield call(manageBodyClass, "vertical-collpsed", "remove");
        break;
      case "icon":
        yield call(changeBodyAttribute, "data-sidebar-size", "");
        yield call(changeBodyAttribute, "data-keep-enlarged", "true");
        yield call(manageBodyClass, "vertical-collpsed", "add");
        break;
      case "condensed":
        yield call(manageBodyClass, "sidebar-enable", "add");
        if (window.screen.width >= 992) {
          yield call(manageBodyClass, "vertical-collpsed", "remove");
          yield call(manageBodyClass, "sidebar-enable", "remove");
          yield call(manageBodyClass, "vertical-collpsed", "add");
          yield call(manageBodyClass, "sidebar-enable", "add");
        } else {
          yield call(manageBodyClass, "sidebar-enable", "add");
          yield call(manageBodyClass, "vertical-collpsed", "add");
        }
        break;
      default:
        yield call(changeBodyAttribute, "data-sidebar-size", "");
        yield call(manageBodyClass, "sidebar-enable", "remove");
        if (!isMobile)
          yield call(manageBodyClass, "vertical-collpsed", "remove");
        break;
    }
  } catch (error) {}
}

/**
 * Show the right sidebar
 */
function* showRightSidebar() {
  try {
    yield call(manageBodyClass, "right-bar-enabled", "add");
  } catch (error) {}
}

/**
 * Watchers
 */
export function* watchChangeLayoutType() {
  yield takeEvery(CHANGE_LAYOUT, changeLayout);
}

export function* watchChangeLayoutModeType() {
  yield takeEvery(CHANGE_LAYOUT_MODE, changeLayoutMode);
}

export function* watchChangeLayoutWidth() {
  yield takeEvery(CHANGE_LAYOUT_WIDTH, changeLayoutWidth);
}

export function* watchChangeLeftSidebarTheme() {
  yield takeEvery(CHANGE_SIDEBAR_THEME, changeLeftSidebarTheme);
}

export function* watchChangeLeftSidebarType() {
  yield takeEvery(CHANGE_SIDEBAR_TYPE, changeLeftSidebarType);
}

export function* watchChangeTopbarTheme() {
  yield takeEvery(CHANGE_TOPBAR_THEME, changeTopbarTheme);
}

export function* watchShowRightSidebar() {
  yield takeEvery(SHOW_RIGHT_SIDEBAR, showRightSidebar);
}

function* LayoutSaga() {
  yield all([
    fork(watchChangeLayoutType),
    fork(watchChangeLayoutModeType),
    fork(watchChangeLayoutWidth),
    fork(watchChangeLeftSidebarTheme),
    fork(watchChangeLeftSidebarType),
    fork(watchShowRightSidebar),
    fork(watchChangeTopbarTheme),
  ]);
}

export default LayoutSaga;
