/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import './spaces_popover_list.scss';

import {
  EuiButtonEmpty,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFieldSearch,
  EuiPopover,
  EuiText,
} from '@elastic/eui';
import React, { Component, memo } from 'react';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { SPACE_SEARCH_COUNT_THRESHOLD } from '@kbn/spaces-plugin/common';
import type { Space, SpacesApiUi } from '@kbn/spaces-plugin/public';

interface Props {
  spaces: Space[];
  buttonText: string;
  spacesApiUi: SpacesApiUi;
}

interface State {
  searchTerm: string;
  allowSpacesListFocus: boolean;
  isPopoverOpen: boolean;
}

export class SpacesPopoverList extends Component<Props, State> {
  public state = {
    searchTerm: '',
    allowSpacesListFocus: false,
    isPopoverOpen: false,
  };

  public render() {
    const button = (
      <EuiButtonEmpty size={'xs'} onClick={this.onButtonClick}>
        <span className="secSpacesPopoverList__buttonText">{this.props.buttonText}</span>
      </EuiButtonEmpty>
    );

    return (
      <EuiPopover
        id={'spacesPopoverList'}
        button={button}
        isOpen={this.state.isPopoverOpen}
        closePopover={this.closePopover}
        panelPaddingSize="none"
        anchorPosition="downLeft"
        ownFocus
      >
        {this.getMenuPanel()}
      </EuiPopover>
    );
  }

  private getMenuPanel = () => {
    const { searchTerm } = this.state;

    const items = this.getVisibleSpaces(searchTerm).map(this.renderSpaceMenuItem);

    const panelProps = {
      className: 'spcMenu',
      title: i18n.translate('xpack.security.management.editRole.spacesPopoverList.popoverTitle', {
        defaultMessage: 'Spaces',
      }),
      watchedItemProps: ['data-search-term'],
    };

    if (this.props.spaces.length >= SPACE_SEARCH_COUNT_THRESHOLD) {
      return (
        <EuiContextMenuPanel {...panelProps}>
          {this.renderSearchField()}
          {this.renderSpacesListPanel(items, searchTerm)}
        </EuiContextMenuPanel>
      );
    }

    return <EuiContextMenuPanel {...panelProps} items={items} />;
  };

  private onButtonClick = () => {
    this.setState({
      isPopoverOpen: !this.state.isPopoverOpen,
      searchTerm: '',
    });
  };

  private closePopover = () => {
    this.setState({
      isPopoverOpen: false,
      searchTerm: '',
    });
  };

  private getVisibleSpaces = (searchTerm: string): Space[] => {
    const { spaces } = this.props;

    let filteredSpaces = spaces;
    if (searchTerm) {
      filteredSpaces = spaces.filter((space) => {
        const { name, description = '' } = space;
        return (
          name.toLowerCase().indexOf(searchTerm) >= 0 ||
          description.toLowerCase().indexOf(searchTerm) >= 0
        );
      });
    }

    return filteredSpaces;
  };

  private renderSpacesListPanel = (items: JSX.Element[], searchTerm: string) => {
    if (items.length === 0) {
      return (
        <EuiText color="subdued" className="eui-textCenter">
          <FormattedMessage
            id="xpack.security.management.editRole.spacesPopoverList.noSpacesFoundTitle"
            defaultMessage=" no spaces found "
          />
        </EuiText>
      );
    }

    return (
      <EuiContextMenuPanel
        key={`spcMenuList`}
        data-search-term={searchTerm}
        className="spcMenu__spacesList"
        initialFocusedItemIndex={this.state.allowSpacesListFocus ? 0 : undefined}
        items={items}
      />
    );
  };

  private renderSearchField = () => {
    return (
      <div key="manageSpacesSearchField" className="spcMenu__searchFieldWrapper">
        {
          <EuiFieldSearch
            placeholder={i18n.translate(
              'xpack.security.management.editRole.spacesPopoverList.findSpacePlaceholder',
              {
                defaultMessage: 'Find a space',
              }
            )}
            incremental={true}
            onSearch={this.onSearch}
            onKeyDown={this.onSearchKeyDown}
            onFocus={this.onSearchFocus}
            compressed
          />
        }
      </div>
    );
  };

  private onSearchKeyDown = (e: any) => {
    //  9: tab
    // 13: enter
    // 40: arrow-down
    const focusableKeyCodes = [9, 13, 40];

    const keyCode = e.keyCode;
    if (focusableKeyCodes.includes(keyCode)) {
      // Allows the spaces list panel to recieve focus. This enables keyboard and screen reader navigation
      this.setState({
        allowSpacesListFocus: true,
      });
    }
  };

  private onSearchFocus = () => {
    this.setState({
      allowSpacesListFocus: false,
    });
  };

  private onSearch = (searchTerm: string) => {
    this.setState({
      searchTerm: searchTerm.trim().toLowerCase(),
    });
  };

  private renderSpaceMenuItem = (space: Space): JSX.Element => {
    const LazySpaceAvatar = memo(this.props.spacesApiUi.components.getSpaceAvatar);
    const icon = <LazySpaceAvatar space={space} size={'s'} />; // wrapped in a Suspense above
    return (
      <EuiContextMenuItem
        key={space.id}
        icon={icon}
        toolTipTitle={space.description && space.name}
        toolTipContent={space.description}
      >
        {space.name}
      </EuiContextMenuItem>
    );
  };
}
