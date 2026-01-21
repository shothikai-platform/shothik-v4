"use client";

import { memo, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setResearchSelectedTab } from "@/redux/slices/researchCoreSlice";
import HeaderTitle from "./HeaderTitle";
import TabsPanel from "./TabPanel";
import ResearchDataArea from "./ResearchDataArea";

const ResearchItem = memo(({
  research,
  idx,
  isLastData,
  headerHeight,
  setHeaderHeight
}) => {
  const dispatch = useDispatch();
  const itemRef = useRef(null);

  // Consolidated handler for tab changes and switching
  // Both actions require dispatching the update and scrolling to the item
  const handleTabChange = useCallback((newValue) => {
    dispatch(setResearchSelectedTab({
      researchId: research._id,
      selectedTab: newValue,
    }));

    // Scroll logic moved inside the item component
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
