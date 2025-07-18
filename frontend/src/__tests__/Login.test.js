// src/__tests__/Login.test.js
import { render, screen } from '@testing-library/react';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';

test('renders Login form heading', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
  expect(screen.getByText(/Login to Your Account/i)).toBeInTheDocument();
});
