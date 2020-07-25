import React, { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { classNames, getDataAttrs, getSlots, emit } from '../utils/utils';
import {
  colorClasses,
  linkActionsAttrs,
  linkActionsClasses,
  linkRouterAttrs,
  linkRouterClasses,
} from '../utils/mixins';
import { useIcon } from '../utils/use-icon';
import { f7ready, f7 } from '../utils/f7';

/* dts-props
  id?: string | number;
  className?: string;
  style?: React.CSSProperties;
  toggle? : boolean
  itemToggle? : boolean
  selectable? : boolean
  selected? : boolean
  opened? : boolean
  label? : string
  loadChildren? : boolean
  link? : boolean | string
  COLOR_PROPS
  LINK_ACTIONS_PROPS
  LINK_ROUTER_PROPS
  LINK_ICON_PROPS
  onClick? : (event?: any) => void
  onTreeviewOpen? : (el?: HTMLElement) => void
  onTreeviewClose? : (el?: HTMLElement) => void
  onTreeviewLoadChildren? : (el?: HTMLElement, done?: any) => void
*/

const TreeviewItem = forwardRef((props, ref) => {
  const {
    className,
    id,
    style,
    toggle,
    itemToggle,
    selectable,
    selected,
    opened,
    label,
    loadChildren,
    link,
  } = props;

  const dataAttrs = getDataAttrs(props);

  const elRef = useRef(null);

  const onClick = (event) => {
    emit(props, 'click', event);
  };
  const onOpen = (el) => {
    if (elRef.current !== el) return;
    emit(props, 'treeviewOpen', el);
  };
  const onClose = (el) => {
    if (elRef.current !== el) return;
    emit(props, 'treeviewClose', el);
  };
  const onLoadChildren = (el, done) => {
    if (elRef.current !== el) return;
    emit(props, 'treeviewLoadChildren', el, done);
  };

  useImperativeHandle(ref, () => ({
    el: elRef.current,
  }));

  const onMount = () => {
    if (!elRef.current) return;
    f7ready(() => {
      f7.on('treeviewOpen', onOpen);
      f7.on('treeviewClose', onClose);
      f7.on('treeviewLoadChildren', onLoadChildren);
    });
  };

  const onDestroy = () => {
    if (!f7) return;
    f7.off('treeviewOpen', onOpen);
    f7.off('treeviewClose', onClose);
    f7.off('treeviewLoadChildren', onLoadChildren);
  };

  useEffect(() => {
    onMount();
    return onDestroy;
  }, []);

  const slots = getSlots(props);
  const hasChildren =
    (slots.default && slots.default.length) ||
    (slots.children && slots.children.length) ||
    (slots['children-start'] && slots['children-start'].length);
  const needToggle = typeof toggle === 'undefined' ? hasChildren : toggle;

  const iconEl = useIcon(props);

  const TreeviewRootTag = link || link === '' ? 'a' : 'div';

  const classes = classNames(
    className,
    'treeview-item',
    {
      'treeview-item-opened': opened,
      'treeview-load-children': loadChildren,
    },
    colorClasses(props),
  );

  const itemRootClasses = classNames(
    'treeview-item-root',
    {
      'treeview-item-selectable': selectable,
      'treeview-item-selected': selected,
      'treeview-item-toggle': itemToggle,
    },
    linkRouterClasses(props),
    linkActionsClasses(props),
  );

  let href = link;
  if (link === true) href = '#';
  if (link === false) href = undefined; // no href attribute
  const itemRootAttrs = {
    href,
    ...linkRouterAttrs(props),
    ...linkActionsAttrs(props),
  };

  return (
    <div id={id} style={style} className={classes} ref={elRef} {...dataAttrs}>
      <TreeviewRootTag onClick={onClick} className={itemRootClasses} {...itemRootAttrs}>
        <slot name="root-start" />
        {needToggle && <div className="treeview-toggle"></div>}
        <div className="treeview-item-content">
          <slot name="content-start" />
          {iconEl}
          <slot name="media" />
          <div className="treeview-item-label">
            <slot name="label-start" />
            {label}
            <slot name="label" />
          </div>
          <slot name="content" />
          <slot name="content-end" />
        </div>
        <slot name="root" />
        <slot name="root-end" />
      </TreeviewRootTag>
      {hasChildren && (
        <div className="treeview-item-children">
          <slot name="children-start" />
          <slot />
          <slot name="children" />
        </div>
      )}
    </div>
  );
});

TreeviewItem.displayName = 'f7-treeview-item';

export default TreeviewItem;
