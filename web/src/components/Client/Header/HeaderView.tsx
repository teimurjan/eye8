/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import Link from 'next/link';
import * as React from 'react';
import { useIntl } from 'react-intl';

import { CartContainer } from 'src/components/Client/Cart/CartContainer';
import { NavContainer } from 'src/components/Client/Nav/NavContainer';
import { SearchContainer } from 'src/components/Client/Search/SearchContainer';
import { UserDropdownContainer as UserDropdown } from 'src/components/Client/UserDropdown/UserDropdownContainer';
import { Anchor } from 'src/components/common-v2/Anchor/Anchor';
import { Navbar } from 'src/components/common-v2/Navbar/Navbar';
import { Container } from 'src/components/common/Container/Container';
import { Popover } from 'src/components/common/Popover/Popover';
import { TriggerHoverProps as PopoverTriggerProps } from 'src/components/common/Popover/Popover';
import { mediaQueries } from 'src/styles/media';
import { withPublicURL } from 'src/utils/url';

const Trigger = React.forwardRef<HTMLAnchorElement, PopoverTriggerProps>((props, ref) => {
  const intl = useIntl();
  return (
    <Anchor ref={ref} {...props}>
      {intl.formatMessage({ id: 'Nav.categories.title' })}
    </Anchor>
  );
});

export const HeaderView = () => {
  const intl = useIntl();
  const theme = useTheme<CSSThemeV2>();

  return (
    <Navbar>
      <Container>
        <div
          css={css`
            display: flex;
            width: 100%;
          `}
        >
          <Link href="/">
            <a
              css={css`
                background: transparent !important;
              `}
              href="/"
              className="navbar-item"
            >
              <img
                alt={intl.formatMessage({ id: 'common.logo' })}
                css={css`
                  max-height: 3.5rem !important;

                  @media ${mediaQueries.maxWidth768} {
                    max-height: 2.5rem !important;
                    padding-top: 0;
                  }
                `}
                src={withPublicURL('icon/android-chrome-192x192.png')}
              />
            </a>
          </Link>
          <Navbar.Section
            css={css`
              margin-left: 10px;
            `}
          >
            <Popover TriggerComponent={Trigger} offset={[0, 14]} openOnHover>
              <Popover.Content
                css={css`
                  width: 100vw;
                  background: ${theme.backgroundSecondaryColor};
                  border-bottom: 1px solid ${theme.borderColor};
                  box-shadow: none;
                `}
              >
                <Container>
                  <NavContainer />
                </Container>
              </Popover.Content>
            </Popover>
          </Navbar.Section>
          <Navbar.Section
            css={css`
              margin-left: auto;
            `}
          >
            <SearchContainer />
            <UserDropdown />
            <CartContainer />
          </Navbar.Section>
        </div>
      </Container>
    </Navbar>
  );
};
