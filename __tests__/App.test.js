import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

const mockJson = {
  items: [
    { id: '1', title: 'Eggs A', price: 3.5, retailer: 'Store A' },
    { id: '2', title: 'Eggs B', price: 2.0, retailer: 'Store B' },
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
