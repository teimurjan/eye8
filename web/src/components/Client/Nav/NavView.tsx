/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { NextRouter } from 'next/router';
import * as React from 'react';
import { useIntl } from 'react-intl';

import { IViewProps as IProps } from 'src/components/Client/Nav/NavPresenter';
import { Anchor } from 'src/components/common-v2/Anchor/Anchor';
import { Button } from 'src/components/common-v2/Button/Button';
import { Menu } from 'src/components/common-v2/Menu/Menu';
import { useBoolean } from 'src/hooks/useBoolean';
import { mediaQueries } from 'src/styles/media';

interface ICategoryMenuItemProps {
  active: boolean;
  asPath: string;
  renderChildren: (renderProps: { collapsed: boolean }) => React.ReactNode;
  defaultCollpsed?: boolean;
  name: string;
  className?: string;
}

const CategoryMenuItem = ({
  className,
  asPath,
  renderChildren,
  name,
  defaultCollpsed = false,
}: ICategoryMenuItemProps) => {
  const { value: collapsed, toggle } = useBoolean(defaultCollpsed);
  const intl = useIntl();

  const onToggleClick: React.MouseEventHandler = React.useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    },
    [toggle],
  );

  const children = renderChildren({ collapsed });

  return (
    <Menu.Item className={className}>
      <Anchor
        css={css`
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          padding-right: 0.25rem !important;
          width: 100%;
        `}
        asPath={asPath}
        href="/categories/[id]/products"
        primary
      >
        {name}
        {children && (
          <Button
            onClick={onToggleClick}
            css={css`
              vertical-align: middle;
              margin-left: 10px;
            `}
            size="mini"
          >
            {collapsed ? intl.formatMessage({ id: 'common.more' }) : intl.formatMessage({ id: 'common.less' })}
          </Button>
        )}
      </Anchor>
      {children}
    </Menu.Item>
  );
};

interface ICategoryMenuListProps {
  categories: IProps['categories'];
  router: NextRouter;
  parentId?: number | null;
  level?: number;
  collapsed?: boolean;
}

const renderCategoryMenuList = ({
  categories,
  router,
  collapsed = false,
  parentId = null,
  level = 0,
}: ICategoryMenuListProps) => {
  const parentCategories = categories.filter(category => category.parent_category_id === parentId);
  if (parentCategories.length === 0) {
    return null;
  }

  return (
    <Menu.List collapsed={collapsed} direction="row">
      {parentCategories.map((parentCategory, i) => {
        const asPath = `/categories/${parentCategory.slug}/products`;
        return (
          <CategoryMenuItem
            css={css`
              margin-right: ${i !== parentCategories.length - 1 ? '20px' : undefined};
              @media ${mediaQueries.maxWidth768} {
                margin-right: 0;
              }
            `}
            key={parentCategory.id}
            active={router.asPath === asPath}
            asPath={asPath}
            name={parentCategory.name}
            defaultCollpsed={level > 1}
            renderChildren={({ collapsed: collapsed_ }) =>
              renderCategoryMenuList({
                categories,
                router,
                collapsed: collapsed_,
                parentId: parentCategory.id,
                level: level + 1,
              })
            }
          />
        );
      })}
    </Menu.List>
  );
};

export const NavView = ({ categories, router }: IProps & { router: NextRouter }) => {
  return (
    <Menu
      css={css`
        padding: 0 1.5rem;

        @media ${mediaQueries.maxWidth768} {
          width: 100%;
          padding: 0;
        }
      `}
    >
      {renderCategoryMenuList({ categories, router })}
    </Menu>
  );
};
