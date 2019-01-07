/** @jsx jsx */
import { jsx } from "@emotion/core";
import classNames from "classnames";
import * as React from "react";
import { InjectedIntlProps } from "react-intl";
import { textCenterMixin } from "src/styles/mixins";
import { Title } from "../../common/Title/Title";
import { LoginFormContainer } from "../LoginForm/LoginFormContainer";

export class LoginPage extends React.Component<InjectedIntlProps> {
  public render() {
    const { intl } = this.props;
    return (
      <div
        className={classNames(
          "column",
          "is-one-third-desktop",
          "is-offset-one-third-desktop",
          "is-full-mobile"
        )}
      >
        <Title css={textCenterMixin} size={3}>
          {intl.formatMessage({ id: "LoginPage.title" })}
        </Title>
        <LoginFormContainer />
      </div>
    );
  }
}