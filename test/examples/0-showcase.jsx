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

/*

<GridLayout
  id="nested-layout"
  key={4}
  nested
  cols={12}
  width={props.width}
  onLayoutChange={this.handleLayoutChange('nested-layout')}
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

</GridLayout>

 */

class ShowcaseLayout extends React.Component {
  constructor(props) {
    super(props)

    this.state.layout = [
      {i: '1', x: 0, y: 0, w: 6, h: 2},
      {i: '2', x: 6, y: 0, w: 6, h: 2},
      {i: 'nested-layout', x: 0, y: 2, w: 12, h: 4, nested: true, isResizable: false, items: [
        {i: '5', x: 6, y: 0, w: 6, h: 2},
        {i: '6', x: 0, y: 0, w: 6, h: 2},
        {i: '7', x: 6, y: 2, w: 6, h: 2},
        {i: '8', x: 0, y: 2, w: 6, h: 2}
      ]}
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
    layout: [],
    shiftKeyPressed: false
  };

  onMoveToParent = (gridItem, nestedId) => {
    const { layout } = this.state
    const key = uuid()

    const nestedItemIndex = layout.findIndex(item => item.i === nestedId)
    const nestedItem = layout[nestedItemIndex]
    const nestedGrid = nestedItem.items

    // remove item from nested grid
    const indexToRemove = nestedGrid.findIndex(item => item.i === gridItem.i)
    nestedGrid.splice(indexToRemove, 1)

    // insert item into parent grid
    layout[nestedItemIndex].items = nestedGrid
    layout.push({
      ...gridItem,
      i: key
    })

    this.setState({ layout })
  }

  onMoveFromParent = (gridItem, nestedId) => {
    const { layout } = this.state
    const key = uuid()

    const nestedItemIndex = layout.findIndex(item => item.i === nestedId)
    const nestedItem = layout[nestedItemIndex]
    const nestedGrid = nestedItem.items

    // insert element to nested grid
    nestedGrid.push({
      ...gridItem,
      i: key
    })
    layout[nestedItemIndex].items = nestedGrid

    // remove item from parent grid
    const indexToRemove = layout.findIndex(item => item.i === gridItem.i)
    layout.splice(indexToRemove, 1)

    this.setState({ layout })
  }

  componentDidMount() {
    this.setState({ mounted: true });

    window.addEventListener('mousemove', e => this.handleShiftKeyPress(e))
    window.addEventListener('keydown', e => this.handleShiftKeyPress(e))
    window.addEventListener('keyup', e => this.handleShiftKeyPress(e))
  }

  handleShiftKeyPress = e => {
    const { shiftKeyPressed } = this.state

    if (!e) {
      e = window.event
    }

    window.shiftKeyPressed = !!e.shiftKey // TODO pass this through props chain or from global state

    if (e.shiftKey && !shiftKeyPressed) {
      this.setState({ shiftKeyPressed: true })
    } else if (!e.shiftKey && shiftKeyPressed) {
      this.setState({ shiftKeyPressed: false })
    }
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

  handleLayoutChange = nestedId => newLayout => {
    let { layout: oldLayout } = this.state
    let nestedItemIndex = null
    let nestedItem = null
    let parentLayout = []

    if (nestedId) {
      nestedItemIndex = oldLayout.findIndex(item => item.i === nestedId)
      nestedItem = oldLayout[nestedItemIndex]
      parentLayout = oldLayout
      oldLayout = nestedItem.items
    }

    const layout = newLayout.map((item, index) => {
        const oldItem = oldLayout[index]

        if (oldItem && oldItem.i === item.i) {
            return {
                ...oldItem,
                ...item
            }
        }

        return item
    })

    if (nestedId) {
      parentLayout[nestedItemIndex].items = layout
      this.setState({ layout: parentLayout })
    } else {
      this.setState({ layout })
    }
  }

  onNewLayout = () => {
    this.setState({
      layouts: { lg: generateLayout() }
    });
  };

  render() {
    const { width } = this.props
    const { layout, mounted, shiftKeyPressed } = this.state

    return (
      <div>
        {shiftKeyPressed && <div>Shift: { shiftKeyPressed.toString() }</div>}
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
          onLayoutChange={this.handleLayoutChange()}
          measureBeforeMount={true}
          useCSSTransforms={true}
          compactType={this.state.compactType}
          preventCollision={!this.state.compactType}
          onMoveToParent={this.onMoveToParent}
          onMoveFromParent={this.onMoveFromParent}
          shiftKeyPressed={shiftKeyPressed}
        >
          {layout.map(item => {
            if (item.nested && item.items && item.items.length) {
              return (
                <div key={item.i} data-grid={item}>
                  <GridLayout
                    id={item.i}
                    key={4}
                    nested
                    cols={12}
                    width={width}
                    onLayoutChange={this.handleLayoutChange(item.i)}
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
                    {item.items.map(nestedItem => <div key={nestedItem.i} data-grid={nestedItem}>{nestedItem.i}</div>)}
                  </GridLayout>
                </div>
              )
            } else {
              return <div key={item.i} data-grid={item}>{item.i}</div>
            }
          })}
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
