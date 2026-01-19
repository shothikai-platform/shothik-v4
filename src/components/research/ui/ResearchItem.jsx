"use client";

import { memo, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { setResearchSelectedTab } from "@/redux/slices/researchCoreSlice";
import HeaderTitle from "./HeaderTitle";
import TabsPanel from "./TabPanel";
import ResearchDataArea from "./ResearchDataArea";

/**
 * ResearchItem Component
 *
 * ⚡ Performance Optimization:
 * This component is memoized to prevent unnecessary re-renders of the entire research list
 * when interacting with a single item (e.g., switching tabs).
 *
 * Previously, the parent component defined inline handlers in the render loop, causing
 * all items to re-render on any state change. Now, each item manages its own tab selection
 * callback or uses a stable callback ref.
 */
const ResearchItem = memo(
  ({ research, isLastData, headerHeight, setHeaderHeight }) => {
    const dispatch = useDispatch();
    const itemRef = useRef(null);

    const handleTabChange = useCallback(
      (newValue) => {
        dispatch(
          setResearchSelectedTab({
            researchId: research._id,
            selectedTab: newValue,
          }),
        );
        // Scroll to the research item when its tab is clicked
        if (itemRef.current) {
          itemRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      },
      [dispatch, research._id],
    );

    return (
      <div ref={itemRef}>
        <div className="bg-background sticky top-0 z-10">
          <HeaderTitle
            headerHeight={headerHeight}
            setHeaderHeight={setHeaderHeight}
            query={research.query}
            researchItem={research}
          />
          <TabsPanel
            selectedTab={research.selectedTab}
            sources={research.sources}
            images={research.images}
            onTabChange={handleTabChange}
          />
        </div>

        {/* data area */}
        <ResearchDataArea
          selectedTab={research.selectedTab}
          research={research}
          isLastData={isLastData}
          onSwitchTab={handleTabChange}
        />
      </div>
    );
  },
);

ResearchItem.displayName = "ResearchItem";

export default ResearchItem;
