/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import * as React from 'react';

import { mediaQueries } from 'src/styles/media';

export interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const NAVBAR_HEIGHT_PX = 70;
export const NAVBAR_HEIGHT_MOBILE_PX = 70;

export const Navbar = ({ children, className, ...props }: IProps) => {
  const theme = useTheme<ClientUITheme>();

  return (
    <nav
      css={css`
        display: flex;
        align-items: center;
        position: fixed;
        border-bottom: 1px solid ${theme.borderColor};
        background-color: ${theme.headerBackgroundColor};
        z-index: 1;
        height: ${NAVBAR_HEIGHT_PX}px;
        width: 100%;

        @media ${mediaQueries.maxWidth768} {
          height: ${NAVBAR_HEIGHT_MOBILE_PX}px;
        }
      `}
      className={className}
      {...props}
    >
      {children}
    </nav>
  );
};

interface ISectionProps {
  className?: string;
  children: React.ReactNode;
}

const Section = ({ className, children }: ISectionProps) => (
  <div
    className={className}
    css={css`
      display: flex;
      justify-content: center;
      align-items: center;

      & > * {
        margin-left: 20px;
      }

      @media ${mediaQueries.maxWidth768} {
        margin-right: 10px;

        & > * {
          margin-left: 7.5px;
        }
      }
    `}
  >
    {children}
  </div>
);

Navbar.Section = Section;