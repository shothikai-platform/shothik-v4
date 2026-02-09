"use client";

import React, { memo, forwardRef } from "react";
import HeaderTitle from "./HeaderTitle";
import TabsPanel from "./TabPanel";
import ResearchDataArea from "./ResearchDataArea";

const ResearchItem = memo(
  forwardRef(function ResearchItem(
    { research, isLastData, onTabChange },
    ref
  ) {
    return (
      <div ref={ref}>
        <div className="bg-background sticky top-0 z-10">
          <HeaderTitle query={research.query} researchItem={research} />
          <TabsPanel
            selectedTab={research.selectedTab}
            sources={research.sources}
            images={research.images}
            onTabChange={(newValue) => onTabChange(research._id, newValue)}
          />
        </div>

        {/* data area */}
        <ResearchDataArea
          selectedTab={research.selectedTab}
          research={research}
          isLastData={isLastData}
          onSwitchTab={(newTab) => onTabChange(research._id, newTab)}
        />
      </div>
    );
  })
);

export default ResearchItem;
