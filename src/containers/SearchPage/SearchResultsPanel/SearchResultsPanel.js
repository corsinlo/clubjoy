import React from 'react';
import { array, bool, node, object, string } from 'prop-types';
import classNames from 'classnames';

import { propTypes } from '../../../util/types';
import { ListingCard, PaginationLinks } from '../../../components';
import EventForm from '../../../components/EventForm/EventForm';
import css from './SearchResultsPanel.module.css';

const SearchResultsPanel = props => {
  const {
    className,
    rootClassName,
    listings,
    pagination,
    search,
    setActiveListing,
    isMapVariant,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const isTeamBuilding = location.pathname.startsWith('/ts');
  const paginationLinks =
    pagination && pagination.totalPages > 1 ? (
      <PaginationLinks
        className={css.pagination}
        pageName="SearchPage"
        pageSearchParams={search}
        pagination={pagination}
      />
    ) : null;

  const cardRenderSizes = isMapVariant => {
    if (isMapVariant) {
      // Panel width relative to the viewport
      const panelMediumWidth = 50;
      const panelLargeWidth = 62.5;
      return [
        '(max-width: 767px) 100vw',
        `(max-width: 1023px) ${panelMediumWidth}vw`,
        `(max-width: 1920px) ${panelLargeWidth / 2}vw`,
        `${panelLargeWidth / 3}vw`,
      ].join(', ');
    } else {
      // Panel width relative to the viewport
      const panelMediumWidth = 50;
      const panelLargeWidth = 62.5;
      return [
        '(max-width: 549px) 100vw',
        '(max-width: 767px) 50vw',
        `(max-width: 1439px) 26vw`,
        `(max-width: 1920px) 18vw`,
        `14vw`,
      ].join(', ');
    }
  };

  return (
    <div className={classes}>
      <div className={isMapVariant ? css.listingCardsMapVariant : css.listingCards}>
        {isTeamBuilding
          ? listings
              .filter(ll => ll.attributes.publicData?.listingType === 'teambuilding')
              .map(l => (
                <ListingCard
                  className={css.listingCard}
                  key={l.id.uuid}
                  listing={l}
                  renderSizes={cardRenderSizes(isMapVariant)}
                  setActiveListing={setActiveListing}
                  min={l.attributes.publicData?.min}
                  max={l.attributes.publicData?.max}
                  isTeamBuilding={l.attributes.publicData.listingType}
                />
              ))
          : listings
              .filter(ll => ll.attributes.publicData?.listingType !== 'teambuilding')
              .map(l => (
                <ListingCard
                  className={css.listingCard}
                  key={l.id.uuid}
                  listing={l}
                  renderSizes={cardRenderSizes(isMapVariant)}
                  setActiveListing={setActiveListing}
                  min={l.attributes.publicData?.min}
                  max={l.attributes.publicData?.max}
                  isTeamBuilding={l.attributes.publicData.listingType}
                />
              ))}
        {isTeamBuilding? <EventForm/>:null}
        {props.children}
      </div>
      {paginationLinks}
    </div>
  );
};

SearchResultsPanel.defaultProps = {
  children: null,
  className: null,
  listings: [],
  pagination: null,
  rootClassName: null,
  search: null,
  isMapVariant: true,
};

SearchResultsPanel.propTypes = {
  children: node,
  className: string,
  listings: array,
  pagination: propTypes.pagination,
  rootClassName: string,
  search: object,
  isMapVariant: bool,
};

export default SearchResultsPanel;
