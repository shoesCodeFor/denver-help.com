import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFormProps {
  onSearch: (city: string, radius: number) => void;
  isLoading?: boolean;
}

export default function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState<number>(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city, radius);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            data-testid="input-city"
            type="text"
            placeholder="Enter city (e.g., San Francisco)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={radius.toString()}
            onValueChange={(value) => setRadius(parseInt(value))}
          >
            <SelectTrigger data-testid="select-radius" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 miles</SelectItem>
              <SelectItem value="10">10 miles</SelectItem>
              <SelectItem value="25">25 miles</SelectItem>
              <SelectItem value="50">50 miles</SelectItem>
              <SelectItem value="100">100 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          data-testid="button-search"
          type="submit"
          disabled={isLoading || !city.trim()}
          className="h-10"
        >
          <Search className="h-4 w-4 mr-2" />
          Search Jobs
        </Button>
      </div>
    </form>
  );
}
