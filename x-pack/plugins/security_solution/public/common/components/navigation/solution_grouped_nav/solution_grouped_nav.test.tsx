/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SecurityPageName } from '../../../../app/types';
import { TestProviders } from '../../../mock';
import { NavItem } from './solution_grouped_nav_item';
import { SolutionGroupedNav, SolutionGroupedNavProps } from './solution_grouped_nav';

const mockUseShowTimeline = jest.fn((): [boolean] => [false]);
jest.mock('../../../utils/timeline/use_show_timeline', () => ({
  useShowTimeline: () => mockUseShowTimeline(),
}));

const mockItems: NavItem[] = [
  {
    id: SecurityPageName.dashboardsLanding,
    label: 'Dashboards',
    href: '/dashboards',
    items: [
      {
        id: SecurityPageName.overview,
        label: 'Overview',
        href: '/overview',
        description: 'Overview description',
      },
    ],
  },
  {
    id: SecurityPageName.alerts,
    label: 'Alerts',
    href: '/alerts',
  },
];

const renderNav = (props: Partial<SolutionGroupedNavProps> = {}) =>
  render(<SolutionGroupedNav items={mockItems} selectedId={SecurityPageName.alerts} {...props} />, {
    wrapper: TestProviders,
  });

describe('SolutionGroupedNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all main items', () => {
    const result = renderNav();
    expect(result.getByText('Dashboards')).toBeInTheDocument();
    expect(result.getByText('Alerts')).toBeInTheDocument();
  });

  describe('links', () => {
    it('should contain correct href in links', () => {
      const result = renderNav();
      expect(
        result
          .getByTestId(`groupedNavItemLink-${SecurityPageName.dashboardsLanding}`)
          .getAttribute('href')
      ).toBe('/dashboards');
      expect(
        result.getByTestId(`groupedNavItemLink-${SecurityPageName.alerts}`).getAttribute('href')
      ).toBe('/alerts');
    });

    it('should call onClick callback if link clicked', () => {
      const mockOnClick = jest.fn((ev) => {
        ev.preventDefault();
      });
      const items = [
        ...mockItems,
        {
          id: SecurityPageName.threatHuntingLanding,
          label: 'Threat Hunting',
          href: '/threat_hunting',
          onClick: mockOnClick,
        },
      ];
      const result = renderNav({ items });
      result.getByTestId(`groupedNavItemLink-${SecurityPageName.threatHuntingLanding}`).click();
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('panel button toggle', () => {
    it('should render the group button only for grouped items', () => {
      const result = renderNav();
      expect(
        result.getByTestId(`groupedNavItemButton-${SecurityPageName.dashboardsLanding}`)
      ).toBeInTheDocument();
      expect(
        result.queryByTestId(`groupedNavItemButton-${SecurityPageName.alerts}`)
      ).not.toBeInTheDocument();
    });

    it('should render the group panel when button is clicked', () => {
      const result = renderNav();
      expect(result.queryByTestId('groupedNavPanel')).not.toBeInTheDocument();

      result.getByTestId(`groupedNavItemButton-${SecurityPageName.dashboardsLanding}`).click();
      expect(result.getByTestId('groupedNavPanel')).toBeInTheDocument();
      expect(result.getByText('Overview')).toBeInTheDocument();
    });

    it('should close the group panel when the same button is clicked', () => {
      const result = renderNav();
      result.getByTestId(`groupedNavItemButton-${SecurityPageName.dashboardsLanding}`).click();
      expect(result.getByTestId('groupedNavPanel')).toBeInTheDocument();

      result.getByTestId(`groupedNavItemButton-${SecurityPageName.dashboardsLanding}`).click();

      waitFor(() => {
        expect(result.queryByTestId('groupedNavPanel')).not.toBeInTheDocument();
      });
    });

    it('should open other group panel when other button is clicked while open', () => {
      const items = [
        ...mockItems,
        {
          id: SecurityPageName.threatHuntingLanding,
          label: 'Threat Hunting',
          href: '/threat_hunting',
          items: [
            {
              id: SecurityPageName.users,
              label: 'Users',
              href: '/users',
              description: 'Users description',
            },
          ],
        },
      ];
      const result = renderNav({ items });

      result.getByTestId(`groupedNavItemButton-${SecurityPageName.dashboardsLanding}`).click();
      expect(result.getByTestId('groupedNavPanel')).toBeInTheDocument();
      expect(result.getByText('Overview')).toBeInTheDocument();

      result.getByTestId(`groupedNavItemButton-${SecurityPageName.threatHuntingLanding}`).click();
      expect(result.queryByTestId('groupedNavPanel')).toBeInTheDocument();
      expect(result.getByText('Users')).toBeInTheDocument();
    });
  });
});
