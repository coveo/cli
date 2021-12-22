import {render, screen} from '@testing-library/react';
import App from './App';

test('renders Coveo welcome page', () => {
  render(<App />);
  const linkElement = screen.getByText(/Welcome to Your Coveo React/i);
  expect(linkElement).toBeInTheDocument();
});
