/** @jsx jsx */
import * as React from 'react';
import { Link } from 'react-router-dom';

import { css, jsx } from '@emotion/core';
import classNames from 'classnames';
import { IntlShape } from 'react-intl';

import logo from 'src/assets/images/logo.png';
import { Button } from 'src/components/common/Button/Button';
import { Container } from 'src/components/common/Container/Container';
import { LinkButton } from 'src/components/common/LinkButton/LinkButton';
import { Navbar } from 'src/components/common/Navbar/Navbar';
import { NavbarBrand } from 'src/components/common/NavbarBrand/NavbarBrand';
import { NavbarBurger } from 'src/components/common/NavbarBurger/NavbarBurger';
import { NavbarEnd } from 'src/components/common/NavbarEnd/NavbarEnd';
import { NavbarItem } from 'src/components/common/NavbarItem/NavbarItem';
import { NavbarMenu } from 'src/components/common/NavbarMenu/NavbarMenu';
import { NavbarStart } from 'src/components/common/NavbarStart/NavbarStart';

import { isUserAdmin } from 'src/helpers/user';

import { LanguageDropdownContainer as LanguageDropdown } from '../LanguageDropdown/LanguageDropdownContainer';
import { IViewProps as IProps } from './HeaderPresenter';
import { SearchContainer } from '../Search/SearchContainer';

export const HeaderView = ({ user, intl, onLogOutClick }: IProps & { intl: IntlShape }) => {
  const [isOpen, setOpen] = React.useState(false);

  const toggleOpen = () => setOpen(!isOpen);

  return (
    <Navbar
      css={css`
        height: 3.25rem;
      `}
    >
      <Container>
        <NavbarBrand>
          <Link className="navbar-item" to="/">
            <img
              css={css`
                max-height: 3rem !important;
              `}
              src={logo}
            />
          </Link>
          <NavbarBurger isActive={isOpen} onClick={toggleOpen} />
        </NavbarBrand>
        <NavbarMenu isActive={isOpen}>
          <NavbarStart>
            <NavbarItem>
              <SearchContainer />
            </NavbarItem>
          </NavbarStart>
          <NavbarEnd>
            <NavbarItem className={classNames('navbar-link is-uppercase is-arrowless')}>
              <LanguageDropdown />
            </NavbarItem>
            <NavbarItem>
              {user ? (
                <div className="buttons">
                  <Button onClick={onLogOutClick} color="is-primary">
                    {intl.formatMessage({ id: 'Header.logOut' })}
                  </Button>
                  {isUserAdmin(user) && (
                    <LinkButton color="is-info" to="/admin">
                      {intl.formatMessage({ id: 'Header.admin' })}
                    </LinkButton>
                  )}
                </div>
              ) : (
                <div className="buttons">
                  <LinkButton color="is-primary" to="/login">
                    {intl.formatMessage({ id: 'Header.logIn' })}
                  </LinkButton>
                  <LinkButton color="is-info" to="/signup">
                    {intl.formatMessage({ id: 'Header.signUp' })}
                  </LinkButton>
                </div>
              )}
            </NavbarItem>
          </NavbarEnd>
        </NavbarMenu>
      </Container>
    </Navbar>
  );
};