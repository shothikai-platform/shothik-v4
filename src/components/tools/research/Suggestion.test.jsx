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

    const titleElements = screen.getAllByText('Suggested questions');
    expect(titleElements.length).toBeGreaterThan(0);
    expect(titleElements[0]).toBeTruthy();

    const q1Elements = screen.getAllByRole('button', { name: 'What is AI?' });
    expect(q1Elements.length).toBeGreaterThan(0);

    const q2Elements = screen.getAllByRole('button', { name: 'How does LLM work?' });
    expect(q2Elements.length).toBeGreaterThan(0);
  });

  it('calls handleSuggestedQuestionClick when a question is clicked', () => {
    render(
      <Suggestion
        suggestedQuestions={mockQuestions}
        handleSuggestedQuestionClick={mockHandleClick}
      />
    );

    // This query now verifies both the element text AND its role as a button
    const questions = screen.getAllByRole('button', { name: 'What is AI?' });
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
    // Ensure all question buttons have the correct type attribute

    const q1Buttons = buttons.filter(b => b.textContent === 'What is AI?');
    expect(q1Buttons.length).toBeGreaterThan(0);
    expect(q1Buttons[0].getAttribute('type')).toBe('button');
  });
});
