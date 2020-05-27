import classNames from 'classnames';
import * as React from 'react';

export interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  color?: string;
}

export const Notification = ({ children, className, color, ...props }: IProps) => (
  <div className={classNames('notification', className, color)} {...props}>
    {children}
  </div>
);