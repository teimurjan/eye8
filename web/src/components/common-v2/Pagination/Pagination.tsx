/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import times from 'lodash/times';

import { Button } from 'src/components/common-v2/Button/Button';

interface IProps {
  length: number;
  page: number;
  onChange?: (page: number) => void;
}

export const Pagination = ({ length, page, onChange }: IProps) => {
  return (
    <div
      css={css`
        display: flex;
      `}
    >
      {times(length).map(i => (
        <Button
          key={i}
          css={css`
            margin: 0 10px;
          `}
          active={i + 1 === page}
          circled
          onClick={onChange ? () => onChange(i + 1) : undefined}
        >
          {i + 1}
        </Button>
      ))}
    </div>
  );
};
