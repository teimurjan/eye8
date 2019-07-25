import * as React from "react";

import { RouteComponentProps } from "react-router";
import * as yup from "yup";

import * as schemaValidator from "src/components/SchemaValidator";
import { IContextValue as AdminFeatureTypesStateContextValue } from "src/state/AdminFeatureTypesState";
import { IContextValue as IntlStateContextValue } from "src/state/IntlState";
import { getFieldName, parseFieldName } from "../../IntlField";

export interface IProps
  extends RouteComponentProps<any>,
    AdminFeatureTypesStateContextValue,
    IntlStateContextValue {
  View: React.ComponentClass<IViewProps> | React.SFC<IViewProps>;
}

export interface IViewProps {
  isOpen: boolean;
  create: (values: { names: { [key: string]: string } }) => any;
  isLoading: boolean;
  error: string | undefined;
  close: () => any;
  availableLocales: IntlStateContextValue["intlState"]["availableLocales"];
  validate: (values: object) => object | Promise<object>;
}

const DEFAULT_SCHEMA_VALIDATOR = {
  validate: () => ({ NOT: "INITIALIZED" })
};

export const FEATURE_TYPE_NAME_FIELD_KEY = "name";

export class AdminFeatureTypesCreatePresenter extends React.Component<IProps> {
  private validator: schemaValidator.ISchemaValidator = DEFAULT_SCHEMA_VALIDATOR;

  public componentDidMount() {
    this.initValidator();
  }

  public componentDidUpdate(prevProps: IProps) {
    const { intlState: newIntlState } = this.props;
    const { intlState: oldIntlState } = prevProps;

    if (
      newIntlState.availableLocales.length > 0 &&
      oldIntlState.availableLocales.length === 0
    ) {
      this.initValidator();
    }
  }

  public render() {
    const {
      View,
      adminFeatureTypesState: { isCreateLoading, createError },
      intlState: { availableLocales }
    } = this.props;

    return (
      <View
        isOpen={true}
        create={this.create}
        error={createError}
        isLoading={isCreateLoading}
        close={this.close}
        availableLocales={availableLocales}
        validate={this.validator.validate}
      />
    );
  }

  private initValidator = () => {
    const { intlState } = this.props;
    this.validator = new schemaValidator.SchemaValidator(
      yup.object().shape(
        intlState.availableLocales.reduce(
          (acc, locale) => ({
            ...acc,
            [getFieldName(
              FEATURE_TYPE_NAME_FIELD_KEY,
              locale
            )]: yup.string().required("common.errors.field.empty")
          }),
          {}
        )
      )
    );
  };

  private close = () => this.props.history.goBack();

  private create: IViewProps["create"] = async values => {
    const {
      adminFeatureTypesState: { createFeatureType }
    } = this.props;

    const formattedValues = Object.keys(values).reduce(
      (acc, fieldName) => {
        const { key, id } = parseFieldName(fieldName);
        if (key === FEATURE_TYPE_NAME_FIELD_KEY) {
          return { ...acc, names: { ...acc.names, [id]: values[fieldName] } };
        }

        return acc;
      },
      {
        names: {},
      }
    );

    const isCreated = await createFeatureType(formattedValues);

    if (isCreated) {
      this.close();
    }
  };
}
