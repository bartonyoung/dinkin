import React from 'react';
import App from './app';
import { render, screen } from '@testing-library/react';

it('should render the component', () => {
    render(<App/>);

    const welcomeMessage = screen.getByText(/welcome to react boilerplate/i);

    expect(welcomeMessage).toBeDefined();
});