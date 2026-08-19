import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the thundercall signup form', () => {
  render(<App />);
  expect(screen.getByText(/Sign up for ThunderCall/i)).toBeInTheDocument();
  expect(screen.getByRole('button', {name: /submit/i})).toBeInTheDocument();
});
