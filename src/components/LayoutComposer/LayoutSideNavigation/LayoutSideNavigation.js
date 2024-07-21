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
    ...rest
  } = props;
  console.log('props', user.id.uuid);
  const classes = classNames(rootClassName || css.root, className);
  const containerClasses = classNames(
    containerClassName || css.container,
    user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && css.container2
  );

  const mainClasses = classNames(
    css.main,
    mainColumnClassName,
    user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && 'customFont',  // Conditionally apply customFont class
    user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && css.main2
  );

  // TODO: since responsiveAreas are still experimental,
  //       we don't separate "aside" through layoutComposer
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
              <aside className={classNames(css.sideNav, sideNavClassName)}>
                {useAccountSettingsNav ? (
                  <LayoutWrapperAccountSettingsSideNav currentPage={currentPage} />
                ) : null}
                {user.id.uuid === '668fb70a-dd46-44f6-94f0-eea88dd089a5' && sideNavContent}
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
};

export default LayoutSideNavigation;
