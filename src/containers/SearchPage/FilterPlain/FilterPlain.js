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
      moreThan8Checked: false,
      lessThan8Checked: false,
      px: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
    this.handleMoreThan8Change = this.handleMoreThan8Change.bind(this);
    this.handleLessThan8Change = this.handleLessThan8Change.bind(this);
  }

  handleChange(values) {
    const { onSubmit } = this.props;
    const { px } = this.state;
    const updatedValues = { ...values, px };
    console.log('Form values changed:', updatedValues);
    onSubmit(updatedValues);
  }

  handleClear() {
    const { onSubmit, onClear } = this.props;

    if (onClear) {
      console.log('Clear button clicked');
      onClear();
    }

    console.log('Form cleared');
    this.setState({ moreThan8Checked: false, lessThan8Checked: false, px: null });
    this.updateURLParams(null);
    onSubmit(null);
  }

  toggleIsOpen() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  handleMoreThan8Change() {
    const isChecked = !this.state.moreThan8Checked;
    console.log('More than 8 checkbox state changed:', isChecked);
    this.setState(
      {
        moreThan8Checked: isChecked,
        lessThan8Checked: isChecked ? false : this.state.lessThan8Checked,
        px: isChecked ? true : null,
      },
      () => {
        this.updateURLParams(this.state.px);
        this.handleChange(this.props.initialValues);
      }
    );
  }

  handleLessThan8Change() {
    const isChecked = !this.state.lessThan8Checked;
    console.log('Less than 8 checkbox state changed:', isChecked);
    this.setState(
      {
        moreThan8Checked: isChecked ? false : this.state.moreThan8Checked,
        lessThan8Checked: isChecked,
        px: isChecked ? false : null,
      },
      () => {
        this.updateURLParams(this.state.px);
        this.handleChange(this.props.initialValues);
      }
    );
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
            initialValues={initialValues}
            keepDirtyOnReinitialize={keepDirtyOnReinitialize}
          >
            {children}
            <SeatFilter
              moreThan8Checked={this.state.moreThan8Checked}
              lessThan8Checked={this.state.lessThan8Checked}
              onMoreThan8Change={this.handleMoreThan8Change}
              onLessThan8Change={this.handleLessThan8Change}
              intl={this.props.intl}
            />
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
