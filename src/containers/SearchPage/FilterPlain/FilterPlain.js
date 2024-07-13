import React, { Component } from 'react';
import { bool, func, node, object, string } from 'prop-types';
import classNames from 'classnames';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';

import IconPlus from '../IconPlus/IconPlus';
import FilterForm from '../FilterForm/FilterForm';
import SeatFilter from '../SearchResultsPanel/SeatFilter';

import css from './FilterPlain.module.css';

class FilterPlainComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      px:
        props.initialValues && props.initialValues.px !== undefined ? props.initialValues.px : null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
    this.handlePxChange = this.handlePxChange.bind(this);
  }

  handleChange(values) {
    const { onSubmit } = this.props;
    const { px } = this.state;
    const updatedValues = { ...values, px };
    onSubmit(updatedValues);
  }

  handleClear() {
    const { onSubmit, onClear } = this.props;

    if (onClear) {
      onClear();
    }

    console.log('Form cleared');
    this.setState({ px: null });
    this.updateURLParams(null);
    onSubmit(null);
  }

  toggleIsOpen() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  handlePxChange(newPx) {
    this.setState({ px: newPx }, () => {
      this.updateURLParams(this.state.px);
      this.handleChange(this.props.initialValues);
    });
  }

  updateURLParams(px) {
    const url = new URL(window.location);
    if (px === null) {
      url.searchParams.delete('px');
    } else {
      url.searchParams.set('px', px);
    }
    window.history.replaceState({}, '', url);
  }

  render() {
    const {
      rootClassName,
      className,
      plainClassName,
      id,
      label,
      labelSelection,
      labelSelectionSeparator,
      isSelected,
      children,
      initialValues,
      keepDirtyOnReinitialize,
      contentPlacementOffset,
    } = this.props;
    const classes = classNames(rootClassName || css.root, className);
    const currentPath = window.location.pathname === '/ts';
    return (
      <div className={classes}>
        <div className={css.filterHeader}>
          <button className={css.labelButton} onClick={this.toggleIsOpen}>
            <span className={css.labelButtonContent}>
              <span className={css.labelWrapper}>
                <span className={css.label}>
                  {label}
                  {labelSelection && labelSelectionSeparator ? labelSelectionSeparator : null}
                  {labelSelection ? (
                    <span className={css.labelSelected}>{labelSelection}</span>
                  ) : null}
                </span>
              </span>
              <span className={css.openSign}>
                <IconPlus isOpen={this.state.isOpen} isSelected={isSelected} />
              </span>
            </span>
          </button>
        </div>
        <div
          id={id}
          className={classNames(plainClassName, css.plain, { [css.isOpen]: this.state.isOpen })}
          ref={node => {
            this.filterContent = node;
          }}
        >
          <FilterForm
            id={`${id}.form`}
            liveEdit
            contentPlacementOffset={contentPlacementOffset}
            onChange={this.handleChange}
            initialValues={{ ...initialValues, px: this.state.px }}
            keepDirtyOnReinitialize={keepDirtyOnReinitialize}
          >
            {children}

            {currentPath && (
              <SeatFilter
                px={this.state.px}
                onPxChange={this.handlePxChange}
                intl={this.props.intl}
              />
            )}
          </FilterForm>
          <button className={css.clearButton} onClick={this.handleClear}>
            <FormattedMessage id={'FilterPlain.clear'} />
          </button>
        </div>
      </div>
    );
  }
}

FilterPlainComponent.defaultProps = {
  rootClassName: null,
  className: null,
  plainClassName: null,
  initialValues: null,
  keepDirtyOnReinitialize: false,
  labelSelection: null,
  labelSelectionSeparator: null,
};

FilterPlainComponent.propTypes = {
  rootClassName: string,
  className: string,
  plainClassName: string,
  id: string.isRequired,
  onSubmit: func.isRequired,
  label: node.isRequired,
  labelSelection: node,
  labelSelectionSeparator: node,
  isSelected: bool.isRequired,
  children: node.isRequired,
  initialValues: object,
  keepDirtyOnReinitialize: bool,

  // form injectIntl
  intl: intlShape.isRequired,
};

const FilterPlain = injectIntl(FilterPlainComponent);

export default FilterPlain;
