import React from 'react';

const _excluded = ["breakpointCols", "className", "columnClassName", "children", "columnAttrs", "column"];

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
const DEFAULT_COLUMNS = 2;

const reCalculateColumnCount = breakpointCols => {
  const windowWidth = window && window.innerWidth || Infinity;
  let breakpointColsObject = breakpointCols; // Allow passing a single number to `breakpointCols` instead of an object

  if (typeof breakpointColsObject !== "object") {
    breakpointColsObject = {
      default: parseInt(breakpointColsObject) || DEFAULT_COLUMNS
    };
  }

  let matchedBreakpoint = Infinity;
  let columns = breakpointColsObject.default || DEFAULT_COLUMNS;

  for (let breakpoint in breakpointColsObject) {
    const optBreakpoint = parseInt(breakpoint);
    const isCurrentBreakpoint = optBreakpoint > 0 && windowWidth <= optBreakpoint;

    if (isCurrentBreakpoint && optBreakpoint < matchedBreakpoint) {
      matchedBreakpoint = optBreakpoint;
      columns = breakpointColsObject[breakpoint];
    }
  }

  columns = Math.max(1, parseInt(columns) || 1);
  return columns;
};

const reCalculateColumnCountDebounce = (columnCountCallback, lastFrameRef) => {
  if (!window || !window.requestAnimationFrame) {
    // IE10+
    columnCountCallback();
  }

  if (window.cancelAnimationFrame) {
    // IE10+
    const lastFrame = lastFrameRef.current;
    window.cancelAnimationFrame(lastFrame);
  }

  lastFrameRef.current = window.requestAnimationFrame(columnCountCallback);
};

const itemsInColumns = (currentColumnCount, children) => {
  const itemsInColumns = new Array(currentColumnCount); // Force children to be handled as an array

  const items = React.Children.toArray(children);

  for (let i = 0; i < items.length; i++) {
    const columnIndex = i % currentColumnCount;

    if (!itemsInColumns[columnIndex]) {
      itemsInColumns[columnIndex] = [];
    }

    itemsInColumns[columnIndex].push(items[i]);
  }

  return itemsInColumns;
};

const logDeprecated = message => {
  console.error("[Masonry]", message);
};

const renderColumns = (children, currentColumnCount, column, columnAttrs = {}, columnClassName) => {
  const childrenInColumns = itemsInColumns(currentColumnCount, children);
  const columnWidth = `${100 / childrenInColumns.length}%`;
  let className = columnClassName;

  if (className && typeof className !== "string") {
    logDeprecated('The property "columnClassName" requires a string'); // This is a deprecated default and will be removed soon.

    if (typeof className === "undefined") {
      className = "my-masonry-grid_column";
    }
  }

  const columnAttributes = _objectSpread(_objectSpread(_objectSpread({}, column), columnAttrs), {}, {
    style: _objectSpread(_objectSpread({}, columnAttrs.style), {}, {
      width: columnWidth
    }),
    className
  });

  return childrenInColumns.map((items, i) => {
    return /*#__PURE__*/React.createElement("div", _extends({}, columnAttributes, {
      key: i
    }), items);
  });
};

const Masonry = _ref => {
  let {
    breakpointCols = undefined,
    // optional, number or object { default: number, [key: number]: number }
    className = undefined,
    // required, string
    columnClassName = undefined,
    // optional, string
    children = undefined,
    // Any React children. Typically an array of JSX items
    // Custom attributes, however it is advised against
    // using these to prevent unintended issues and future conflicts
    // ...any other attribute, will be added to the container
    columnAttrs = undefined,
    // object, added to the columns
    // Deprecated props
    // The column property is deprecated.
    // It is an alias of the `columnAttrs` property
    column = undefined
  } = _ref,
      rest = _objectWithoutProperties(_ref, _excluded);

  const [columnCount, setColumnCount] = React.useState(() => {
    let count;

    if (breakpointCols && breakpointCols.default) {
      count = breakpointCols.default;
    } else {
      count = parseInt(breakpointCols) || DEFAULT_COLUMNS;
    }

    return count;
  });
  const lastFrameRef = React.useRef();
  const columnCountCallback = React.useCallback(() => {
    const columns = reCalculateColumnCount(breakpointCols);

    if (columnCount !== columns) {
      setColumnCount(columns);
    }
  }, [breakpointCols, columnCount]);
  React.useLayoutEffect(() => {
    columnCountCallback();

    const handleWindowResize = () => {
      reCalculateColumnCountDebounce(columnCountCallback, lastFrameRef);
    }; // window may not be available in some environments


    if (window) {
      window.addEventListener("resize", handleWindowResize);
    }

    return () => {
      if (window) {
        window.removeEventListener("resize", handleWindowResize);
      }
    };
  }, [columnCountCallback]);
  let classNameOutput = className;

  if (typeof className !== "string") {
    logDeprecated('The property "className" requires a string'); // This is a deprecated default and will be removed soon.

    if (typeof className === "undefined") {
      classNameOutput = "my-masonry-grid";
    }
  }

  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    className: classNameOutput
  }), renderColumns(children, columnCount, column, columnAttrs, columnClassName));
};

export { Masonry as default };
