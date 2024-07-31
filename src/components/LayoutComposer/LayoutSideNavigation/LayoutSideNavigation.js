import React from 'react';
import { bool, node, string } from 'prop-types';
import classNames from 'classnames';

import LayoutComposer from '../LayoutComposer';
import LayoutWrapperAccountSettingsSideNav from './LayoutWrapperAccountSettingsSideNav';

import css from './LayoutSideNavigation.module.css';
import '../../../styles/fonts.css';

// Commonly used layout
const LayoutSideNavigation = props => {
  const {
    className,
    rootClassName,
    containerClassName,
    mainColumnClassName,
    sideNavClassName,
    children,
    user,
    topbar: topbarContent,
    footer: footerContent,
    sideNav: sideNavContent,
    useAccountSettingsNav,
    currentPage,
    type, // Ensure you destructure type from props
    ...rest
  } = props;

  // Class handling depending on the type
  const classes = classNames(rootClassName || css.root, className);
  const containerClasses = classNames(
    containerClassName || css.container,
    type === 'inbox' ? css.containerInbox : user?.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && css.container2
  );
  const mainClasses = classNames(
    css.main,
    mainColumnClassName,
    type === 'inbox' ? 'inboxMain' : user?.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && 'customFont',  // Conditionally apply customFont class
    type === 'inbox' ? css.mainInbox : user?.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && css.main2
  );

  // Adjust the layout areas template string if needed
  const layoutAreas = `
    topbar
    main
    footer
  `;

  return (
    <LayoutComposer areas={layoutAreas} className={classes} {...rest}>
      {layoutProps => {
        const { Topbar, Main, Footer } = layoutProps;
        return (
          <>
            <Topbar as="header" className={css.topbar}>
              {topbarContent}
            </Topbar>
            <Main as="div" className={containerClasses}>
              <aside className={classNames(css.sideNav, sideNavClassName, type === 'inbox' && css.sideNavInbox)}>
                {useAccountSettingsNav && !type === 'inbox' ? (
                  <LayoutWrapperAccountSettingsSideNav currentPage={currentPage} />
                ) : null}
                {type !== 'inbox' && user?.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && sideNavContent}
                {type === 'inbox' && sideNavContent}
              </aside>
              <main className={mainClasses}>{children}</main>
            </Main>
            <Footer>{footerContent}</Footer>
          </>
        );
      }}
    </LayoutComposer>
  );
};

LayoutSideNavigation.displayName = 'LayoutSideNavigation';

LayoutSideNavigation.defaultProps = {
  className: null,
  rootClassName: null,
  sideNav: null,
  footer: null,
  useAccountSettingsNav: false,
  currentPage: null,
};

LayoutSideNavigation.propTypes = {
  className: string,
  rootClassName: string,
  children: node.isRequired,
  topbar: node.isRequired,
  sideNav: node,
  footer: node,
  useAccountSettingsNav: bool,
  currentPage: string,
  type: string, // Added type prop
};

export default LayoutSideNavigation;
