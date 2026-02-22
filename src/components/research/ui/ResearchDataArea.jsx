"use client";

import React, { memo } from "react";
import ImagesContent from "./ImagesContent";
import ResearchContent from "./ResearchContent";
import SourcesContent from "./SourcesContent";

const ResearchDataArea = memo(({
  selectedTab,
  research,
  isLastData,
  onSwitchTab,
}) => {

  const renderContent = () => {
    switch (selectedTab) {
      case 0: // Research
        return (
          <ResearchContent
            currentResearch={research} // Pass the specific research object
            isLastData={isLastData}
            onSwitchTab={onSwitchTab}
          />
        );
      case 1: // Images
        return <ImagesContent images={research.images} />;
      case 2: // Sources
        return <SourcesContent sources={research.sources} />;
      default:
        return <ResearchContent currentResearch={research} />;
    }
  };

  return <div>{renderContent()}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison function to optimize performance
  // We ignore onSwitchTab because it's a new function on every render from parent
  // but its behavior is stable.
  return (
    prevProps.selectedTab === nextProps.selectedTab &&
    prevProps.isLastData === nextProps.isLastData &&
    prevProps.research === nextProps.research
  );
});

ResearchDataArea.displayName = "ResearchDataArea";

export default ResearchDataArea;
