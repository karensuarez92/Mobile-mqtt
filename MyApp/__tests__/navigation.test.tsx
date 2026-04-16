/**
 * Unit tests for the navigation module.
 *
 * These tests focus on the module's structure rather than the internal
 * behavior of React Navigation (which has its own test suite). We render
 * the exported components with lightweight mocks for React Navigation to
 * ensure the stack is wired up as expected.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { View } from 'react-native';

jest.mock('@react-navigation/native', () => {
  const { View: RNView } = jest.requireActual('react-native');
  return {
    __esModule: true,
    NavigationContainer: ({ children }: { children: React.ReactNode }) => (
      <RNView testID="navigation-container">{children}</RNView>
    ),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const { View: RNView } = jest.requireActual('react-native');
  const Navigator = ({ children }: { children: React.ReactNode }) => (
    <RNView testID="stack-navigator">{children}</RNView>
  );
  const Screen = ({
    name,
    component: Component,
  }: {
    name: string;
    component: React.ComponentType;
  }) => (
    <RNView testID={`stack-screen-${name}`}>
      <Component />
    </RNView>
  );
  return {
    __esModule: true,
    createNativeStackNavigator: () => ({ Navigator, Screen }),
  };
});

// Stub the Home screen so we don't exercise the mqtt connect logic here.
jest.mock('../src/screens/home/Home', () => {
  const { View: RNView, Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    Home: () => (
      <RNView testID="home-stub">
        <Text>Home stub</Text>
      </RNView>
    ),
  };
});

import Navigation, { RootStack } from '../src/navigation/navigation';

const findByTestId = (
  tree: ReactTestRenderer.ReactTestRenderer,
  id: string,
) =>
  tree.root.findAll(
    node => typeof node.type === 'string' && node.props?.testID === id,
  );

describe('navigation', () => {
  it('RootStack mounts a native stack navigator with the Home screen', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<RootStack />);
    });

    expect(findByTestId(tree, 'stack-navigator')).toHaveLength(1);
    expect(findByTestId(tree, 'stack-screen-Home')).toHaveLength(1);
    expect(findByTestId(tree, 'home-stub')).toHaveLength(1);
  });

  it('Navigation wraps RootStack in a NavigationContainer', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Navigation />);
    });

    expect(findByTestId(tree, 'navigation-container')).toHaveLength(1);
    expect(findByTestId(tree, 'stack-navigator')).toHaveLength(1);
    expect(findByTestId(tree, 'stack-screen-Home')).toHaveLength(1);
  });

  it('exports Navigation as the default export and RootStack as a named export', () => {
    expect(typeof Navigation).toBe('function');
    expect(typeof RootStack).toBe('function');
    // Rendered output is a View (from the NavigationContainer mock).
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Navigation />);
    });
    expect(tree.root.findAllByType(View).length).toBeGreaterThan(0);
  });
});
