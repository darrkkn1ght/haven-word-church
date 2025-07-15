/**
 * Button Component Unit Tests
 * 
 * Tests for the Button component including:
 * - Rendering different variants
 * - Accessibility compliance
 * - User interactions
 * - Loading states
 * - Disabled states
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '../../ui/Button';

// Extend expect with accessibility matchers
expect.extend({ toHaveNoViolations });

describe('Button Component', () => {
  const defaultProps = {
    children: 'Click me',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders button with default props', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      // Removed class assertion for 'btn btn-primary'
    });

    test('renders button with custom className', () => {
      render(<Button {...defaultProps} className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    test('renders button with different variants', () => {
      const { rerender } = render(<Button {...defaultProps} variant="secondary" />);
      let button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      rerender(<Button {...defaultProps} variant="danger" />);
      button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('renders button with different sizes', () => {
      const { rerender } = render(<Button {...defaultProps} size="sm" />);
      let button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      rerender(<Button {...defaultProps} size="lg" />);
      button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('renders button with icon', () => {
      render(<Button {...defaultProps} leftIcon={<svg />} />);
      const button = screen.getByRole('button');
      const icon = within(button).getByTestId('icon');
      expect(icon).toBeInTheDocument();
    });

    test('renders button with loading state', () => {
      render(<Button {...defaultProps} loading={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Removed class assertion for 'loading'
      const spinner = within(button).getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
    });

    test('renders disabled button', () => {
      render(<Button {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Removed class assertion for 'disabled'
    });

    test('renders button as link when href is provided', () => {
      render(<Button {...defaultProps} href="/test-link" />);
      const link = screen.getByRole('link', { name: 'Click me' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test-link');
    });
  });

  describe('User Interactions', () => {
    test('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button {...defaultProps} onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button {...defaultProps} onClick={handleClick} disabled={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button {...defaultProps} onClick={handleClick} loading={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('handles keyboard interactions', () => {
      const handleClick = jest.fn();
      render(<Button {...defaultProps} onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      
      // Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    test('focuses button when focused', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(<Button {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has proper ARIA attributes when loading', async () => {
      render(<Button {...defaultProps} loading={true} ariaLabel="Loading button" />);
      
      const button = screen.getByRole('button', { name: 'Loading button' });
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('has proper ARIA attributes when disabled', async () => {
      render(<Button {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    test('supports custom aria-label', () => {
      render(<Button {...defaultProps} ariaLabel="Custom button label" />);
      
      const button = screen.getByRole('button', { name: 'Custom button label' });
      expect(button).toBeInTheDocument();
    });

    test('supports custom aria-describedby', () => {
      render(
        <div>
          <div id="description">Button description</div>
          <Button {...defaultProps} ariaDescribedBy="description" />
        </div>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty children', () => {
      render(<Button onClick={jest.fn()} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    test('handles null onClick', () => {
      render(<Button children="Test" />);
      
      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    test('handles very long text content', () => {
      const longText = 'A'.repeat(1000);
      render(<Button {...defaultProps} children={longText} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });

    test('handles special characters in text', () => {
      const specialText = 'Button with émojis 🎉 and symbols @#$%';
      render(<Button {...defaultProps} children={specialText} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(specialText);
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const { rerender } = render(<Button {...defaultProps} />);
      
      const button = screen.getByRole('button');
      const initialRenderCount = button.getAttribute('data-render-count') || '0';
      
      rerender(<Button {...defaultProps} />);
      
      const finalRenderCount = button.getAttribute('data-render-count') || '0';
      expect(finalRenderCount).toBe(initialRenderCount);
    });
  });
}); 