/* eslint-disable react/jsx-boolean-value */
import React from "react";
import _ from "lodash";
import GridLayout, { WidthProvider } from "react-grid-layout";

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0 // eslint-disable-line
        const v = c === 'x' ? r : (r & 0x3) | 0x8 // eslint-disable-line
        return v.toString(16)
    })
}

class ShowcaseLayout extends React.Component {
  constructor(props) {
    super(props)

    this.state.layout = [
      <div key={1} data-grid={{i: '1', x: 0, y: 0, w: 6, h: 2}}>1</div>,
      <div key={2} data-grid={{i: '2', x: 6, y: 0, w: 6, h: 2}}>2</div>,
      <div key="nested-layout" data-grid={{i: 'nested-layout', x: 0, y: 2, w: 12, h: 4, nested: true, isResizable: false}}>
        <GridLayout
          id="nested-layout"
          key={4}
          nested
          cols={12}
          width={props.width}
          // TODO apply layout changes for nested grids
          // TODO calculate grid height based on the items
          // onLayoutChange={this.onLayoutChange}
          onMoveToParent={this.onMoveToParent}
          onMoveFromParent={this.onMoveFromParent}
          measureBeforeMount={true}
          useCSSTransforms={true}
          compactType="vertical"
          preventCollision={false}
          onDragStart={(layout, oldItem, newItem, placeholder, e) => {
              e.stopPropagation()
          }}
        >
          <div key={5} data-grid={{i: '5', x: 6, y: 0, w: 6, h: 2}}>5</div>
          <div key={6} data-grid={{i: '6', x: 0, y: 0, w: 6, h: 2}}>6</div>
          <div key={7} data-grid={{i: '7', x: 6, y: 2, w: 6, h: 2}}>7</div>
          <div key={8} data-grid={{i: '8', x: 0, y: 2, w: 6, h: 2}}>8</div>
        </GridLayout>
      </div>
    ]
  }

  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
  };

  state = {
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: false,
    layout: []
  };

  onMoveToParent = (gridItem, nestedId) => {
    const { layout } = this.state
    const key = uuid()

    const nestedItemIndex = layout.findIndex(item => item.props['data-grid'].i === nestedId)
    const nestedItem = layout[nestedItemIndex]
    const nestedGrid = React.Children.only(nestedItem.props.children)
    const indexToRemove = nestedGrid.props.children.findIndex(item => item.props['data-grid'].i === gridItem.i)
    const nestedGridChildren = [...React.Children.toArray(nestedGrid.props.children)]
    nestedGridChildren.splice(indexToRemove, 1)

    const newNewstedItem = React.cloneElement(
      nestedItem,
      {},
      React.cloneElement(
        nestedGrid,
        {},
        nestedGridChildren
      )
    )
    layout[nestedItemIndex] = newNewstedItem
    layout.push(<div key={key} data-grid={gridItem}>{key}</div>)

    this.setState({ layout })
  }

  onMoveFromParent = gridItem => { // eslint-disable-line
    // TODO
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  generateDOM() {
    return _.map(this.state.layouts.lg, function(l, i) {
      return (
        <div key={i} className={l.static ? "static" : ""}>
          {l.static ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              Static - {i}
            </span>
          ) : (
            <span className="text">{i}</span>
          )}
        </div>
      );
    });
  }

  onBreakpointChange = breakpoint => {
    this.setState({
      currentBreakpoint: breakpoint
    });
  };

  onCompactTypeChange = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical" ? null : "horizontal";
    this.setState({ compactType });
  };

  onLayoutChange = newLayout => {
    const { layout: oldLayout } = this.state
    const layout = []

    newLayout.forEach((item, index) => {
      const oldItem = oldLayout[index]
      layout.push(React.cloneElement(
        oldItem,
        {
          'data-grid': item
        },
        oldItem.props.children
      ))
    })

    this.setState({ layout })
  };

  onNewLayout = () => {
    this.setState({
      layouts: { lg: generateLayout() }
    });
  };

  render() {
    const { width } = this.props
    const { layout, mounted } = this.state

    return (
      <div>
        <div>
          Current Breakpoint: {this.state.currentBreakpoint} ({
            this.props.cols[this.state.currentBreakpoint]
          }{" "}
          columns)
        </div>
        <div>
          Compaction type:{" "}
          {_.capitalize(this.state.compactType) || "No Compaction"}
        </div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <button onClick={this.onCompactTypeChange}>
          Change Compaction Type
        </button>
        <GridLayout
          id="root-layout"
          mounted={mounted}
          cols={12}
          width={width}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={true}
          useCSSTransforms={true}
          compactType={this.state.compactType}
          preventCollision={!this.state.compactType}
          onMoveToParent={this.onMoveToParent}
          onMoveFromParent={this.onMoveFromParent}
        >
          {layout.map(item => item)}
        </GridLayout>
      </div>
    );
  }
}

module.exports = WidthProvider(ShowcaseLayout);

function generateLayout() {
  return _.map(_.range(0, 25), function(item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: (_.random(0, 5) * 2) % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      static: Math.random() < 0.05
    };
  });
}

if (require.main === module) {
  require("../test-hook.jsx")(module.exports);
}
