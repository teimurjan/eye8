/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import classNames from 'classnames';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import { safeDocument } from 'src/utils/dom';

export const fadingCSS = css`
  & .modal-background {
    opacity: 0;
    transition: opacity 300ms ease-in-out;
  }

  &.fading-enter .modal-background {
    opacity: 0;
  }
  &.fading-enter-active .modal-background,
  &.fading-enter-done .modal-background {
    opacity: 1;
  }
  &.fading-exit .modal-background {
    opacity: 1;
  }
  &.fading-exit-active .modal-background,
  &.fading-exit-done .modal-background {
    opacity: 0;
  }

  & .modal-content {
    transform: scale(0);
    transition: transform 200ms ease-in-out;
  }

  &.fading-enter .modal-content {
    transform: scale(0);
  }
  &.fading-enter-active .modal-content,
  &.fading-enter-done .modal-content {
    transform: scale(1);
  }
  &.fading-exit .modal-content {
    transform: scale(1);
  }
  &.fading-exit-active .modal-content,
  &.fading-exit-done .modal-content {
    transform: scale(0);
  }
`;

export interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  isOpen: boolean;
}

export const Modal = ({ children, className, isOpen, ...props }: IProps) => {
  const modalRoot = safeDocument(d => d.getElementById('modalRoot'), null);

  return modalRoot
    ? ReactDOM.createPortal(
        <CSSTransition in={isOpen} timeout={300} classNames="fading" unmountOnExit mountOnEnter appear>
          <div css={fadingCSS} className={classNames('modal', 'is-active', className)} {...props}>
            {children}
          </div>
        </CSSTransition>,
        modalRoot,
      )
    : null;
};