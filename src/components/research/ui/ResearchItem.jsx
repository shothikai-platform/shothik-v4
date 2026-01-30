"use client";

import { setResearchSelectedTab } from "@/redux/slices/researchCoreSlice";
import React, { memo, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import HeaderTitle from "./HeaderTitle";
import ResearchDataArea from "./ResearchDataArea";
import TabsPanel from "./TabPanel";

const ResearchItem = memo(({
  research,
  headerHeight,
  setHeaderHeight,
  isLastData,
}) => {
  const dispatch = useDispatch();
  const itemRef = useRef(null);

  const handleTabChange = useCallback((newValue) => {
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
  }, [dispatch, research._id]);

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
});

ResearchItem.displayName = "ResearchItem";

export default ResearchItem;
