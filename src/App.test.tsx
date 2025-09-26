import { render, screen } from '@testing-library/react';
import App from './App';

test('renders coordinate converter', () => {
  render(<App />);
  const titleElement = screen.getByText(/Latitude\/Longitude to UTM Converter/i);
  expect(titleElement).toBeInTheDocument();
});
