import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom'; // Import withRouter
import { bool, func, object, number, string } from 'prop-types';
import classNames from 'classnames';

import { FormattedMessage, intlShape } from '../../../../util/reactIntl';
import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { propTypes } from '../../../../util/types';
import {
  Avatar,
  InlineTextButton,
  LinkedLogo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
} from '../../../../components';

import TopbarSearchForm from '../TopbarSearchForm/TopbarSearchForm';

import css from './TopbarDesktop.module.css';

const TopbarDesktop = props => {
  const {
    className,
    appConfig,
    currentUser,
    currentPage,
    rootClassName,
    currentUserHasListings,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues,
    location, // Destructure location prop provided by withRouter
  } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const marketplaceName = appConfig.marketplaceName;
  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const classes = classNames(rootClassName || css.root, className);

  // Determine if the current page is the landing page based on the pathname
  const isLandingPage = location.pathname === '/';

  const search = !isLandingPage ? (
    <TopbarSearchForm
      className={css.searchLink}
      desktopInputRoot={css.topbarSearchWithLeftPadding}
      onSubmit={onSearchSubmit}
      initialValues={initialSearchFormValues}
      appConfig={appConfig}
    />
  ) : null; // Only render TopbarSearchForm if not on landing page

  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null
  const inboxLink = authenticatedOnClientSide ? (
    <NamedLink
      className={css.inboxLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.inbox}>
        <FormattedMessage id="TopbarDesktop.inbox" />
        {notificationDot}
      </span>
    </NamedLink>
  ) : null;

  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  const profileMenu = authenticatedOnClientSide ? (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="ManageListingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.yourListingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.profileSettingsLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  ) : null;

  const signupLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="SignupPage" className={css.signupLink}>
      <span className={css.signup}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );

  const loginLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="LoginPage" className={css.loginLink}>
      <span className={css.login}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );

  const signupBusinessLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="bSignupPage" className={css.loginLink}>
      <span className={css.login}>
        Business
      </span>
    </NamedLink>
  );

  return (
<nav className={classes}>
  {isLandingPage ? (
    <>
      <div className={css.leftContent}>
        {/* Empty or minimal content since logo will be centered */}
      </div>
      <div className={css.logoContainer}>
        {/* Logo centered for the landing page */}
        <LinkedLogo
          className={css.logoLink}
          layout="desktop"
          alt={intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName })}
        />
      </div>
      <div className={css.rightContent}>
        {/* Other elements like search, create listing, inbox link, profile menu, auth links */}
        {search}
      { /* <NamedLink className={css.createListingLink} name="NewListingPage">
          <span className={css.createListing}>
            <FormattedMessage id="TopbarDesktop.createListing" />
          </span>
  </NamedLink>*/}
        {inboxLink}
        {profileMenu}
        <div className={css.authLinks}>
        {signupBusinessLink}
          {signupLink}
          {loginLink}
        </div>
      </div>
    </>
  ) : (
    <>
      <div className={css.leftContent}>
        {/* For non-landing pages, include the logo and possibly other elements here */}
        <LinkedLogo
          className={css.logoLink}
          layout="desktop"
          alt={intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName })}
        />
        {search}
      </div>
      <div className={css.rightContent}>
        {/* Adjust content as needed, possibly moving some elements from leftContent here if needed */}
        <NamedLink className={css.createListingLink} name="NewListingPage">
          <span className={css.createListing}>
            <FormattedMessage id="TopbarDesktop.createListing" />
          </span>
        </NamedLink>
        {inboxLink}
        {profileMenu}
        <div className={css.authLinks}>
          {signupBusinessLink}
          {signupLink}
          {loginLink}
        </div>
      </div>
    </>
  )}
</nav>

  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
  appConfig: null,
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  notificationCount: number,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
  appConfig: object,
  // Add the React Router's location object to propTypes
  location: object.isRequired,
};

// Wrap TopbarDesktop with withRouter to get access to the location prop
export default withRouter(TopbarDesktop);