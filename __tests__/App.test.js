import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

cconst mockJson = {
  results: [
    {
      id: 'milk-1',
      name: 'Whole Milk 1 Gallon',
      store: 'Store A',
      upc: '111111111111',
      current_price: 3.49,
    },
    {
      id: 'eggs-1',
      name: 'Large Eggs, Dozen',
      store: 'Store B',
      upc: '222222222222',
      current_price: 2.59,
    },
    {
      id: 'bread-1',
      name: 'White Sandwich Bread, 20oz',
      store: 'Store C',
      upc: '333333333333',
      current_price: 1.99,
    },
    {
      id: 'rice-1',
      name: 'Long Grain Rice, 2 lb',
      store: 'Store A',
      upc: '444444444444',
      current_price: 2.79,
    },
    {
      id: 'apples-1',
      name: 'Gala Apples, 3 lb Bag',
      store: 'Store D',
      upc: '555555555555',
      current_price: 4.49,
    },
    {
      id: 'bananas-1',
      name: 'Bananas, 1 lb',
      store: 'Store B',
      upc: '666666666666',
      current_price: 0.69,
    },
    {
      id: 'chicken-1',
      name: 'Boneless Skinless Chicken Breast, 1 lb',
      store: 'Store C',
      upc: '777777777777',
      current_price: 5.99,
    },
    {
      id: 'beef-1',
      name: 'Ground Beef 80/20, 1 lb',
      store: 'Store A',
      upc: '888888888888',
      current_price: 4.89,
    },
    {
      id: 'cheese-1',
      name: 'Cheddar Cheese Block, 8 oz',
      store: 'Store D',
      upc: '999999999999',
      current_price: 3.29,
    },
    {
      id: 'broccoli-1',
      name: 'Fresh Broccoli Crown, 1 lb',
      store: 'Store B',
      upc: '101010101010',
      current_price: 1.79,
    },
  ],
};

test('submits a query and shows cheapest offer badge', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockJson,
  });

  const { getByText, getByPlaceholderText, queryByText } = render(<App />);

  expect(getByText(/Price Compare/i)).toBeTruthy();

  const input = getByPlaceholderText(/large eggs, UPC, SKU/i);
  fireEvent.changeText(input, 'eggs');

  const button = getByText(/Compare/i);
  fireEvent.press(button);

  expect(getByText(/Fetching offers/i)).toBeTruthy();

  await waitFor(() => {
    expect(queryByText(/Fetching offers/i)).toBeNull();
  });

  expect(getByText('Store B')).toBeTruthy();
  expect(getByText('Cheapest')).toBeTruthy();
});
