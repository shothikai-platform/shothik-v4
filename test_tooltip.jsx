import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function Test() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-ring">
          <Button disabled>Test</Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>Tooltip</TooltipContent>
    </Tooltip>
  );
}
