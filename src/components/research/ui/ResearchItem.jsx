"use client";

import React, { memo, useRef } from "react";
import { useDispatch } from "react-redux";
import { setResearchSelectedTab } from "@/redux/slices/researchCoreSlice";
import HeaderTitle from "./HeaderTitle";
import TabsPanel from "./TabPanel";
import ResearchDataArea from "./ResearchDataArea";

const ResearchItem = memo(({ research, isLastData }) => {
  const dispatch = useDispatch();
  const itemRef = useRef(null);

  const handleTabChange = (newValue) => {
    dispatch(
      setResearchSelectedTab({
        researchId: research._id,
        selectedTab: newValue,
      })
    );
    // Scroll to the research item when its tab is clicked
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
        <HeaderTitle
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
});

ResearchItem.displayName = "ResearchItem";

export default ResearchItem;
