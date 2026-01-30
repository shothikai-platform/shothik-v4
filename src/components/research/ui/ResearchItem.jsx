"use client";

import { setResearchSelectedTab } from "@/redux/slices/researchCoreSlice";
import React, { memo, useRef } from "react";
import HeaderTitle from "./HeaderTitle";
import ResearchDataArea from "./ResearchDataArea";
import TabsPanel from "./TabPanel";

function ResearchItem({ research, isLastData, dispatch }) {
  const itemRef = useRef(null);

  const handleTabChange = (newTab) => {
    dispatch(
      setResearchSelectedTab({
        researchId: research._id,
        selectedTab: newTab,
      }),
    );
    // Scroll to the research item when its tab is clicked or switched
    if (itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div ref={itemRef}>
      <div className="bg-background sticky top-0 z-10">
        <HeaderTitle query={research.query} researchItem={research} />
        <TabsPanel
          selectedTab={research.selectedTab}
          sources={research.sources}
          images={research.images}
          onTabChange={handleTabChange}
        />
      </div>

      <ResearchDataArea
        selectedTab={research.selectedTab}
        research={research}
        isLastData={isLastData}
        onSwitchTab={handleTabChange}
      />
    </div>
  );
}

// Wrap in React.memo to prevent re-renders when parent state (like other items) changes.
// We rely on shallow comparison of props: 'research' object identity, 'isLastData' boolean, and 'dispatch' function stability.
export default memo(ResearchItem);
