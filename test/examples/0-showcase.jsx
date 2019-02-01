/* eslint-disable react/jsx-boolean-value */
import React from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { utils } from 'react-grid-layout'

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0 // eslint-disable-line
        const v = c === 'x' ? r : (r & 0x3) | 0x8 // eslint-disable-line
        return v.toString(16)
    })
}

const calculateHeight = (layout, padding, margin = [10, 10], rowHeight = 150) => {
  const nbRow = utils.bottom(layout)
  const containerPaddingY = padding
    ? padding[1]
    : margin[1]

  const nestedHeight = (
    nbRow * rowHeight +
    (nbRow - 1) * margin[1] +
    containerPaddingY * 2
  )
  const nestedRow = Math.floor(nestedHeight / rowHeight)

  return { nestedHeight, nestedRow }
}

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
      ]}/* ,
      {i: '9', x: 0, y: 4, w: 6, h: 2},
      {i: '10', x: 6, y: 4, w: 6, h: 2},
      {i: '11', x: 0, y: 6, w: 6, h: 2},
      {i: '12', x: 6, y: 6, w: 6, h: 2}, */
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

    if (!nestedGrid.length) {
      layout.splice(nestedItemIndex, 1)
    }

    return nestedGrid
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

    return layout
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
    const { layout } = this.state

    if (nestedId) {
      const nestedItemIndex = layout.findIndex(item => item.i === nestedId)
      const { nestedHeight, nestedRow } = calculateHeight(newLayout)

      if (nestedItemIndex !== -1) {
        if (nestedHeight !== layout[nestedItemIndex].nestedHeight) {
          // height changed set new identifier so parent grid know it needs to update
          layout[nestedItemIndex].i = uuid()
        }
        layout[nestedItemIndex].h = nestedRow
        layout[nestedItemIndex].nestedHeight = nestedHeight
        layout[nestedItemIndex].items = newLayout
      }

      this.setState({ layout })
    } else {
      newLayout.forEach((item, index) => {
        if (item.nested) {
          item.items = layout[index].items
        }
      })
      
      this.setState({ layout: newLayout })
    }
  }

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
            if (item.nested && item.items) {
              return (
                <div key={item.i} data-grid={item}>
                  <GridLayout
                    id={item.i}
                    key={4}
                    nested
                    height={item.nestedHeight}
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

if (require.main === module) {
  require("../test-hook.jsx")(module.exports);
}
