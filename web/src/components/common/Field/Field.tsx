import * as React from "react";

import classNames from "classnames";

export interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Field = ({ children, className, ...props }: IProps) => (
  <div className={classNames("field", className)} {...props}>
    {children}
  </div>
);
