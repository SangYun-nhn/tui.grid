import { h, Component } from 'preact';
import { BodyRows } from './bodyRows';
import { ColGroup } from './colGroup';
import { Side, Row, ColumnInfo } from '../store/types';
import { cls } from '../helper/common';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  data: Row[];
  columns: ColumnInfo[];
  bodyHeight: number;
  totalRowHeight: number;
  scrollTop: number;
  offsetY: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

// only updates when these props are changed
// for preventing unnecessary rendering when scroll changes
const PROPS_FOR_UPDATE: (keyof StoreProps)[] = [
  'data',
  'columns',
  'bodyHeight',
  'totalRowHeight',
  'offsetY'
];

class BodyAreaComp extends Component<Props> {
  el?: HTMLElement;

  shouldComponentUpdate(nextProps: Props) {
    const currProps = this.props;
    return PROPS_FOR_UPDATE.some((propName) => nextProps[propName] !== currProps[propName]);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.el!.scrollTop = nextProps.scrollTop;
  }

  render({ side, bodyHeight, totalRowHeight, offsetY, dispatch }: Props) {
    const areaStyle = { overflow: 'scroll', height: `${bodyHeight}px` };
    const containerStyle = { height: `${totalRowHeight}px` };
    const tableStyle = { overflow: 'visible', top: `${offsetY}px` };

    const onScroll = (ev: UIEvent) => {
      const { scrollLeft, scrollTop } = ev.srcElement!;

      if (this.props.side === 'R') {
        dispatch('setScrollLeft', scrollLeft);
      }
      dispatch('setScrollTop', scrollTop);
    };

    return (
      <div
        class={cls('body-area')}
        style={areaStyle}
        onScroll={onScroll}
        ref={(el) => (this.el = el)}
      >
        <div class={cls('body-container')} style={containerStyle}>
          <div class={cls('table-container')} style={tableStyle}>
            <table class={cls('table')}>
              <ColGroup side={side} />
              <BodyRows side={side} />
            </table>
            <div class={cls('layer-selection')} style="display: none;" />
          </div>
        </div>
      </div>
    );
  }
}

export const BodyArea = connect<StoreProps, OwnProps>((store, { side }) => {
  const { data, column, dimension, viewport } = store;
  const { bodyHeight, totalRowHeight } = dimension;
  const { offsetY, scrollTop } = viewport;

  return {
    data,
    columns: column.visibleColumns[side],
    bodyHeight,
    totalRowHeight,
    scrollTop,
    offsetY
  };
})(BodyAreaComp);