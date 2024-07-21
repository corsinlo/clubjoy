import React, { useState } from 'react';
import { bool, arrayOf, number, shape } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER, propTypes } from '../../util/types';
import { ensureCurrentUser, ensureUser } from '../../util/data';
import { withViewport } from '../../util/uiHelpers';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import {
  Heading,
  H2,
  H4,
  Page,
  AvatarLarge,
  NamedLink,
  ListingCard,
  Reviews,
  ButtonTabNavHorizontal,
  LayoutSideNavigation,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';

import css from './ProfilePage.module.css';
import '../../styles/fonts.css'

const MAX_MOBILE_SCREEN_WIDTH = 768;

export const AsideContent = props => {
  const { user, displayName, isCurrentUser } = props;

  const asideContentClasses = classNames(css.asideContent, {
    [css.asideContent2]: user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5',
  });

  const avatarClasses = classNames(css.avatar, {
    [css.avatar2]: user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5',
  });

  return (
    <div className={asideContentClasses}>
      <AvatarLarge className={avatarClasses} user={user} disableProfileLink />
      <H2 as="h1" className={css.mobileHeading}>
        {user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={css.padmaTitle}>{displayName}</span>
            <span className={css.subtitles}>7-8 settembre</span>
            <span className={css.subtitles}>viaggio sensoriale nella natura</span>
          </div>
        ) : (
          displayName ? (
            <FormattedMessage id="ProfilePage.mobileHeading" values={{ name: displayName }} />
          ) : null
        )}
      </H2>
      {isCurrentUser ? (
        <>
          <NamedLink className={css.editLinkMobile} name="ProfileSettingsPage">
            <FormattedMessage id="ProfilePage.editProfileLinkMobile" />
          </NamedLink>
          <NamedLink className={css.editLinkDesktop} name="ProfileSettingsPage">
            <FormattedMessage id="ProfilePage.editProfileLinkDesktop" />
          </NamedLink>
        </>
      ) : null}
    </div>
  );
};

export const ReviewsErrorMaybe = props => {
  const { queryReviewsError } = props;
  return queryReviewsError ? (
    <p className={css.error}>
      <FormattedMessage id="ProfilePage.loadingReviewsFailed" />
    </p>
  ) : null;
};

export const MobileReviews = props => {
  const { reviews, queryReviewsError, userRole, user } = props;
  const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);
  const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);
  return (
    <div className={css.mobileReviews}>
      {userRole === 'provider' && (
        <H4 as="h2" className={css.mobileReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsFromMyCustomersTitle"
            values={{ count: reviewsOfProvider.length }}
          />
        </H4>
      )}
      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />

      <Reviews reviews={reviewsOfProvider} />
      <H4 as="h2" className={css.mobileReviewsTitle}>
        <FormattedMessage
          id="ProfilePage.reviewsAsACustomerTitle"
          values={{ count: reviewsOfCustomer.length }}
        />
      </H4>
      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />
      <Reviews reviews={reviewsOfCustomer} />
    </div>
  );
};

export const DesktopReviews = props => {
  const [showReviewsType, setShowReviewsType] = useState(REVIEW_TYPE_OF_PROVIDER);
  const { reviews, queryReviewsError, userRole, displayName, user } = props;

  const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);
  const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);
  const isReviewTypeProviderSelected = showReviewsType === REVIEW_TYPE_OF_PROVIDER;
  const isReviewTypeCustomerSelected = showReviewsType === REVIEW_TYPE_OF_CUSTOMER;
  let desktopReviewTabs = [
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsFromMyCustomersTitle"
            values={{ count: reviewsOfProvider.length }}
          />
        </Heading>
      ),
      selected: isReviewTypeProviderSelected,
      onClick: () => setShowReviewsType(REVIEW_TYPE_OF_PROVIDER),
    },
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsAsACustomerTitle"
            values={{ count: reviewsOfCustomer.length }}
          />
        </Heading>
      ),
      selected: isReviewTypeCustomerSelected,
      onClick: () => setShowReviewsType(REVIEW_TYPE_OF_CUSTOMER),
    },
  ];
  if (userRole !== 'provider') {
    desktopReviewTabs = desktopReviewTabs.filter(
      tab => tab.selected !== isReviewTypeProviderSelected
    );
  }

  const desktopReviewsClasses = classNames(css.desktopReviews, {
    [css.desktopReviews2]: user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5',
  });

  return (
    <div className={desktopReviewsClasses}>
      <div className={css.desktopReviewsWrapper}>
        <ButtonTabNavHorizontal className={css.desktopReviewsTabNav} tabs={desktopReviewTabs} />

        <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />
        {isReviewTypeProviderSelected ? (
          <Reviews reviews={reviewsOfProvider} />
        ) : userRole === 'provider' ? (
          <Reviews reviews={reviewsOfCustomer} />
        ) : null}
      </div>
    </div>
  );
};

export const MainContent = props => {
  const {
    userShowError,
    bio,
    displayName,
    listings,
    queryListingsError,
    reviews,
    queryReviewsError,
    viewport,
    userRole,
    user,
  } = props;

  const isAuthorDefined = !!props.user?.attributes?.profile.publicData?.providerName;
  const providerName = isAuthorDefined ? props.user.attributes.profile.publicData.providerName : '';

  const hasListings = listings.length > 0;
  const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH;
  const hasBio = !!bio;

  const listingsContainerClasses = classNames(css.listingsContainer, {
    [css.withBioMissingAbove]: !hasBio,
    [css.withBioMissingAbove2]: user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && !hasBio,
  });

  const desktopHeadingClasses = classNames(css.desktopHeading, {
    [css.desktopHeading2]: user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5',
  });

  if (userShowError || queryListingsError) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProfilePage.loadingDataFailed" />
      </p>
    );
  }
  return (
    <div>
      {isAuthorDefined ? (
        <H2 as="h1" className={desktopHeadingClasses}>
          {user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' ? (

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={css.padmaTitle}>{providerName}</span>
              <span className={css.subtitles}>7-8 settembre</span>
            </div>

          ) : (
            providerName
          )}
        </H2>
      ) : (
        <H2 as="h1" className={desktopHeadingClasses}>
          {user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={css.padmaTitle}>{displayName}</span>
              <span className={css.subtitles}>7-8 settembre</span>
            </div>
          ) : (
            displayName
          )}
        </H2>
      )}
      {user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' ? (
        <H2 as="h1" className={desktopHeadingClasses}>
          <span className={css.subtitles}>viaggio sensoriale nella natura</span>
        </H2>
      ) : (
        <H2 as="h1" className={desktopHeadingClasses}>
          <FormattedMessage id="ProfilePage.desktopHeading" values={{ name: displayName }} />
        </H2>
      )}

      {user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' ? (
        <p className={css.padmaBio}>{bio}</p>
      ) : (
        hasBio ? <p className={css.bio}>{bio}</p> : null
      )}
      {hasListings ? (
        <div className={listingsContainerClasses}>
          {user.id.uuid !== '668fb70a-dd46-44f6-94f0-eea88dd089a5' &&
            (<H4 as="h2" className={css.listingsTitle}>
              <FormattedMessage id="ProfilePage.listingsTitle" values={{ count: listings.length }} />
            </H4>)}
          <ul className={css.listings}>
            {listings.map(l => (
              <li className={css.listing} key={l.id.uuid}>
                <ListingCard listing={l} showAuthorInfo={false} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {isMobileLayout ? (
        <MobileReviews
          reviews={reviews}
          queryReviewsError={queryReviewsError}
          userRole={userRole}
          user={user}
        />
      ) : (
        <DesktopReviews
          reviews={reviews}
          queryReviewsError={queryReviewsError}
          userRole={userRole}
          displayName={displayName}
          user={user}
        />
      )}
    </div>
  );
};

const ProfilePageComponent = props => {
  const config = useConfiguration();
  const { scrollingDisabled, currentUser, userShowError, user, intl, ...rest } = props;
  const userRole = currentUser?.attributes?.profile?.publicData?.role;
  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const profileUser = ensureUser(user);
  const isCurrentUser =
    ensuredCurrentUser.id && profileUser.id && ensuredCurrentUser.id.uuid === profileUser.id.uuid;
  const { bio, displayName } = profileUser?.attributes?.profile || {};

  const schemaTitleVars = { name: displayName, marketplaceName: config.marketplaceName };
  const schemaTitle = intl.formatMessage({ id: 'ProfilePage.schemaTitle' }, schemaTitleVars);

  if (userShowError && userShowError.status === 404) {
    return <NotFoundPage />;
  }
  return (
    <Page
      scrollingDisabled={scrollingDisabled}
      title={schemaTitle}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'ProfilePage',
        name: schemaTitle,
      }}
    >
      <LayoutSideNavigation
        sideNavClassName={css.aside}
        displayname={displayName}
        user={user}
        topbar={<TopbarContainer currentPage="ProfilePage" />}
        sideNav={
          user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' ? (
            <AsideContent
              user={user}
              isCurrentUser={isCurrentUser}
              displayName={displayName}
              userRole={userRole}
            />
          ) : null
        }
        footer={<FooterContainer />}
      >
        {user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' &&
          (<AsideContent
            user={user}
            isCurrentUser={isCurrentUser}
            displayName={displayName}
            userRole={userRole}
          />)}
        <MainContent
          bio={bio}
          displayName={displayName}
          userShowError={userShowError}
          {...rest}
          user={user}
          userRole={userRole}
        />
      </LayoutSideNavigation>
    </Page>
  );
};

ProfilePageComponent.defaultProps = {
  currentUser: null,
  user: null,
  userShowError: null,
  queryListingsError: null,
  reviews: [],
  queryReviewsError: null,
};

ProfilePageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUser: propTypes.currentUser,
  user: propTypes.user,
  userShowError: propTypes.error,
  queryListingsError: propTypes.error,
  listings: arrayOf(propTypes.listing).isRequired,
  reviews: arrayOf(propTypes.review),
  queryReviewsError: propTypes.error,

  // form withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    userId,
    userShowError,
    queryListingsError,
    userListingRefs,
    reviews,
    queryReviewsError,
  } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{ type: 'user', id: userId }]);
  const user = userMatches.length === 1 ? userMatches[0] : null;
  const listings = getMarketplaceEntities(state, userListingRefs);
  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    user,
    userShowError,
    queryListingsError,
    listings,
    reviews,
    queryReviewsError,
  };
};

const ProfilePage = compose(
  connect(mapStateToProps),
  withViewport,
  injectIntl
)(ProfilePageComponent);

export default ProfilePage;
