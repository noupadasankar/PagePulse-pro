import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuditForm } from '@/components/audit/AuditForm';
import MetricCard from '@/components/audit/MetricCard';
import ScoreGauge from '@/components/audit/ScoreGauge';
import { useAuditHistory } from '@/hooks/useAuditHistory';
import { getStatusColor, getStatusLabel } from '@/lib/metric-helpers';
import { cn } from '@/lib/utils';

describe('AuditForm', () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input and submit button', () => {
    render(<AuditForm onSubmit={mockSubmit} isLoading={false} />);
    expect(screen.getByPlaceholderText(/enter any website url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze now/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid URL', async () => {
    render(<AuditForm onSubmit={mockSubmit} isLoading={false} />);
    const input = screen.getByPlaceholderText(/enter any website url/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'not-a-url' } });
      fireEvent.click(screen.getByRole('button', { name: /analyze now/i }));
    });
    await vi.waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with URL when form is submitted', async () => {
    render(<AuditForm onSubmit={mockSubmit} isLoading={false} />);
    const input = screen.getByPlaceholderText(/enter any website url/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /analyze now/i }));
    });
    await vi.waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('https://example.com');
    });
  });

  it('disables form when isLoading is true', () => {
    render(<AuditForm onSubmit={mockSubmit} isLoading={true} />);
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
    expect(screen.getByPlaceholderText(/enter any website url/i)).toBeDisabled();
  });
});

describe('metric-helpers', () => {
  it('returns correct color for green status', () => {
    expect(getStatusColor('green')).toBe('text-green-500');
  });

  it('returns correct color for amber status', () => {
    expect(getStatusColor('amber')).toBe('text-amber-500');
  });

  it('returns correct color for red status', () => {
    expect(getStatusColor('red')).toBe('text-red-500');
  });

  it('returns correct label for each status', () => {
    expect(getStatusLabel('green')).toBe('Good');
    expect(getStatusLabel('amber')).toBe('Warning');
    expect(getStatusLabel('red')).toBe('Critical');
  });
});

describe('cn utility', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
  });

  it('handles object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});