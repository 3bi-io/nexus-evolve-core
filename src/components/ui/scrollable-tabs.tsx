import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useResponsive, useHaptics } from "@/hooks/useResponsive";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TabItem {
  value: string;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ScrollableTabsProps {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  /** Optional max width for desktop view */
  maxWidth?: string;
}

/**
 * Mobile-friendly scrollable tabs component.
 * - On mobile: horizontal scrolling with touch-friendly targets
 * - On desktop: standard grid layout
 */
export function ScrollableTabs({
  tabs,
  value,
  onValueChange,
  children,
  className,
  maxWidth = "max-w-4xl",
}: ScrollableTabsProps) {
  const { isMobile } = useResponsive();
  const { light } = useHaptics();

  const handleTabChange = (newValue: string) => {
    light();
    onValueChange(newValue);
  };

  return (
    <Tabs value={value} onValueChange={handleTabChange} className={cn("space-y-6", className)}>
      {isMobile ? (
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max gap-1 p-1 bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className="flex items-center gap-2 px-4 py-3 min-w-[100px] whitespace-nowrap data-[state=active]:bg-background"
              >
                {tab.icon}
                <span className="text-sm font-medium">
                  {tab.shortLabel || tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      ) : (
        <TabsList className={cn("grid w-full", maxWidth)} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className="flex items-center gap-2"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      {children}
    </Tabs>
  );
}

// Re-export TabsContent for convenience
export { TabsContent } from "@/components/ui/tabs";
