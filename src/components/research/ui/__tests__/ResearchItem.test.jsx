import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ResearchItem from '../ResearchItem';
import researchCoreReducer from '@/redux/slices/researchCoreSlice';
import researchChatReducer from '@/redux/slices/researchChatSlice';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock dependencies if needed
vi.mock('next/image', () => ({
  default: (props) => <img {...props} alt={props.alt} />,
}));

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const store = configureStore({
  reducer: {
    researchCore: researchCoreReducer,
    researchChat: researchChatReducer,
  },
});

describe('ResearchItem', () => {
  it('renders without crashing', () => {
    const research = {
      _id: '1',
      query: 'Test',
      selectedTab: 0,
      sources: [],
      images: [],
      result: 'Content'
    };

    render(
      <Provider store={store}>
        <ResearchItem
            research={research}
            headerHeight={20}
            setHeaderHeight={() => {}}
            isLastData={true}
        />
      </Provider>
    );
  });
});
