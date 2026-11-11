import { render, screen } from '@testing-library/react';
import App from './App';

test('renders LuxuryStay hospitality application without crashing', async () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Luxury/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
