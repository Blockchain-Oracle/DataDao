import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useTaskFilterStore } from "@/stores/task-filter-store";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TaskFilters() {
  const {
    status,
    sortBy,
    rewardRange,
    dateRange,
    setStatus,
    setSortBy,
    setRewardRange,
    setDateRange,
    resetFilters,
  } = useTaskFilterStore();

  const activeFiltersCount = [
    status !== "all",
    rewardRange[0] > 0 || rewardRange[1] < 1000,
    dateRange[0] || dateRange[1],
  ].filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Tasks</SheetTitle>
          <SheetDescription>
            Apply filters to find specific tasks
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="reward-high">Highest Reward</SelectItem>
                <SelectItem value="reward-low">Lowest Reward</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Reward Range (Tokens)</Label>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={rewardRange}
              onValueChange={setRewardRange}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{rewardRange[0]} tokens</span>
              <span>{rewardRange[1]} tokens</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid gap-2">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange[0] || undefined,
                  to: dateRange[1] || undefined,
                }}
                onSelect={(range) => {
                  setDateRange([range?.from || null, range?.to || null]);
                }}
                className="rounded-md border"
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={resetFilters}>
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
