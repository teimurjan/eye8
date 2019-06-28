import * as React from "react";

import classNames from "classnames";

export interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Pagination = ({ children, className, ...props }: IProps) => (
  <div className={classNames("pagination", className)} {...props}>
    {children}
  </div>
);