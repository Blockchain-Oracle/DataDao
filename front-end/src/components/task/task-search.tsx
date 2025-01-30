import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useTaskFilterStore } from "@/stores/task-filter-store";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function TaskSearch() {
  const { search, setSearch } = useTaskFilterStore();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search tasks..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="pl-8 pr-8"
      />
      {localSearch && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 p-0"
          onClick={() => {
            setLocalSearch("");
            setSearch("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
