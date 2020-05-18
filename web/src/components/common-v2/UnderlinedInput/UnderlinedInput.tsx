/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import * as React from 'react';
import InputMask from 'react-input-mask';

import { HelpText } from 'src/components/common-v2/HelpText/HelpText';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDebounce } from 'src/hooks/useDebounce';

export interface IProps {
  error?: string;
  className?: string;
  type?: string;
  placeholder: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  mask?: string;
  containerRef?: React.Ref<HTMLDivElement>;
}

const VERTICAL_PADDING_PX = 7.5;
const HORIZONTAL_PADDING_PX = 2.5;

export const UnderlinedInput = React.forwardRef<HTMLInputElement, IProps>(
  ({ containerRef, className, error, placeholder, onFocus, autoFocus, onBlur, mask = '', ...props }, ref) => {
    const theme = useTheme<CSSThemeV2>();
    const { value: isFocused, setNegative: blur, setPositive: focus } = useBoolean();

    // Debounce error so it does not disappear till the closing transition is finished
    const debouncedError = useDebounce(error, 300);

    const onFocus_: IProps['onFocus'] = React.useCallback(
      e => {
        focus();
        onFocus && onFocus(e);
      },
      [focus, onFocus],
    );
    const onBlur_: IProps['onBlur'] = React.useCallback(
      e => {
        blur();
        onBlur && onBlur(e);
      },
      [blur, onBlur],
    );

    return (
      <div
        ref={containerRef}
        css={css`
          padding: 2.5px 0;
        `}
      >
        <div
          className={className}
          data-focused={isFocused}
          data-has-error={!!error}
          css={css`
            position: relative;
            overflow: hidden;

            &::after {
              content: '';
              background: linear-gradient(to right, ${theme.primaryColor} 50%, ${theme.borderColor} 50%);
              transition: transform 500ms, color 200ms;
              transform: translateX(-50%);
              position: absolute;
              bottom: 0;
              left: 0;
              height: 1px;
              width: 200%;
            }

            &[data-focused='true']::after {
              transform: translateX(0%);
            }

            &[data-has-error='true']::after {
              background: ${theme.dangerColor};
            }
          `}
        >
          <InputMask
            disabled={false}
            mask={mask}
            autoFocus={autoFocus}
            css={css`
              border: none;
              padding: ${VERTICAL_PADDING_PX + 15}px ${HORIZONTAL_PADDING_PX}px ${VERTICAL_PADDING_PX}px
                ${HORIZONTAL_PADDING_PX}px;
              font-size: 16px;
              background: transparent;
              width: 100%;

              &:focus {
                outline: none;
              }
            `}
            onFocus={onFocus_}
            onBlur={onBlur_}
            inputRef={ref}
            {...props}
          />
          <span
            css={css`
              position: absolute;
              left: ${HORIZONTAL_PADDING_PX}px;
              bottom: ${VERTICAL_PADDING_PX}px;
              pointer-events: none;
              transition: all 400ms;
              font-size: 16px;
              transform: translateY(0) scale(1);
              transform-origin: 0 50%;
              color: ${theme.textSecondaryColor};

              [data-focused='true'] > & {
                color: ${theme.textColor};
                transform: translateY(-20px) scale(0.65);
              }

              input:not([value='']) ~ & {
                transform: translateY(-20px) scale(0.65);
                color: ${theme.textColor};
              }
            `}
          >
            {placeholder}
          </span>
        </div>
        <HelpText
          color="danger"
          css={css`
            display: block;
            max-height: 1px;
            transition: max-height 300ms;
            padding: 0 ${HORIZONTAL_PADDING_PX}px;
            overflow: hidden;

            [data-has-error='true'] ~ & {
              max-height: 30px;
            }
          `}
        >
          {error ? error : debouncedError}
        </HelpText>
      </div>
    );
  },
);
