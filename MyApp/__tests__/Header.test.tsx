/**
 * Unit tests for the Header component.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, View } from 'react-native';

import { Header } from '../src/screens/Header/Header';
import { Colors } from '../src/utils/helpers/colors';

describe('Header', () => {
  const flattenStyle = (style: unknown): Record<string, unknown> => {
    if (Array.isArray(style)) {
      return style.reduce<Record<string, unknown>>(
        (acc, s) => ({ ...acc, ...flattenStyle(s) }),
        {},
      );
    }
    return (style as Record<string, unknown>) ?? {};
  };

  it('renders without crashing', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Header />);
    });
    expect(tree).toBeDefined();
    expect(tree!.toJSON()).toBeTruthy();
  });

  it('displays the expected text content', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Header />);
    });
    const textNode = tree.root.findByType(Text);
    expect(textNode.props.children).toBe('Hola soy el header');
  });

  it('applies the purple background color from the palette', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Header />);
    });
    const viewNode = tree.root.findByType(View);
    const style = flattenStyle(viewNode.props.style);
    expect(style.backgroundColor).toBe(Colors.morado);
    expect(style.height).toBe(50);
    expect(style.flexDirection).toBe('row');
  });
});
