import React from 'react';

const _excluded = ["breakpointCols", "gutter", "children"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
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

const renderColumns = (children, currentColumnCount, gutter) => {
  const childrenInColumns = itemsInColumns(currentColumnCount, children);
  const columnWidth = `${100 / childrenInColumns.length}%`;
  return childrenInColumns.map((items, i) => {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: columnWidth,
        marginLeft: gutter
      },
      key: i
    }, items);
  });
};

const Masonry = _ref => {
  let {
    breakpointCols = undefined,
    // optional, number or object { default: number, [key: number]: number }
    gutter = "0",
    children = undefined
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
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      marginLeft: `-${gutter}`,
      width: "auto"
    }
  }, rest), renderColumns(children, columnCount, gutter));
};

export { Masonry as default };
