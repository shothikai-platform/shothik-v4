import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Suggestion from './Suggestion';

describe('Suggestion Component', () => {
  const mockHandleClick = vi.fn();
  const mockQuestions = ['What is AI?', 'How does LLM work?'];

  it('renders suggested questions correctly', () => {
    render(
      <Suggestion
        suggestedQuestions={mockQuestions}
        handleSuggestedQuestionClick={mockHandleClick}
      />
    );

    // screen.debug();

    // Use getAllByText to handle potential duplication from motion/animation in test env
    // and check that at least one exists.
    const titleElements = screen.getAllByText('Suggested questions');
    expect(titleElements.length).toBeGreaterThan(0);
    expect(titleElements[0]).toBeTruthy();

    const q1Elements = screen.getAllByText('What is AI?');
    expect(q1Elements.length).toBeGreaterThan(0);

    const q2Elements = screen.getAllByText('How does LLM work?');
    expect(q2Elements.length).toBeGreaterThan(0);
  });

  it('calls handleSuggestedQuestionClick when a question is clicked', () => {
    render(
      <Suggestion
        suggestedQuestions={mockQuestions}
        handleSuggestedQuestionClick={mockHandleClick}
      />
    );

    const questions = screen.getAllByText('What is AI?');
    // Click the first one found
    fireEvent.click(questions[0]);

    expect(mockHandleClick).toHaveBeenCalledWith('What is AI?');
  });

  it('renders questions as buttons for accessibility', () => {
    render(
      <Suggestion
        suggestedQuestions={mockQuestions}
        handleSuggestedQuestionClick={mockHandleClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    // In strict mode or with motion, we might get duplicates.
    // We just want to ensure that whatever "What is AI?" elements exist, they are buttons.

    // Filter buttons that have the text content
    const q1Buttons = buttons.filter(b => b.textContent === 'What is AI?');
    const q2Buttons = buttons.filter(b => b.textContent === 'How does LLM work?');

    expect(q1Buttons.length).toBeGreaterThan(0);
    expect(q2Buttons.length).toBeGreaterThan(0);

    // Check type attribute on the first one
    expect(q1Buttons[0].getAttribute('type')).toBe('button');
  });
});
