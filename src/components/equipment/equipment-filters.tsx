"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { THAI_PROVINCES } from "@/constants/provinces";

interface Category {
  id: string;
  slug: string;
  name: string;
  nameTh: string;
}

interface EquipmentFiltersProps {
  categories: Category[];
  basePath?: string;
}

const priceRanges = [
  { label: "ทุกราคา", min: "", max: "" },
  { label: "ต่ำกว่า 1,000 บาท", min: "", max: "1000" },
  { label: "1,000 - 3,000 บาท", min: "1000", max: "3000" },
  { label: "3,000 - 5,000 บาท", min: "3000", max: "5000" },
  { label: "มากกว่า 5,000 บาท", min: "5000", max: "" },
];

export function EquipmentFilters({ categories, basePath = "/equipment" }: EquipmentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete("page"); // Reset to page 1 on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${basePath}?${createQueryString({ search })}`);
  };

  const handleCategoryChange = (slug: string, checked: boolean) => {
    if (checked) {
      router.push(`${basePath}?${createQueryString({ category: slug })}`);
    } else {
      router.push(`${basePath}?${createQueryString({ category: null })}`);
    }
  };

  const handleProvinceChange = (value: string) => {
    router.push(
      `${basePath}?${createQueryString({ province: value === "all" ? null : value })}`
    );
  };

  const handlePriceChange = (min: string, max: string) => {
    router.push(`${basePath}?${createQueryString({ minPrice: min, maxPrice: max })}`);
  };

  const clearAllFilters = () => {
    setSearch("");
    router.push(basePath);
  };

  const hasFilters =
    searchParams.has("category") ||
    searchParams.has("province") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("search");

  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ค้นหาอุปกรณ์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </form>

      {/* Categories */}
      <div>
        <Label className="text-sm font-medium mb-3 block">หมวดหมู่</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={category.slug}
                checked={searchParams.get("category") === category.slug}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.slug, checked as boolean)
                }
              />
              <label
                htmlFor={category.slug}
                className="text-sm cursor-pointer flex-1"
              >
                {category.nameTh}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Province */}
      <div>
        <Label className="text-sm font-medium mb-3 block">จังหวัด</Label>
        <Select
          value={searchParams.get("province") || "all"}
          onValueChange={handleProvinceChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกจังหวัด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกจังหวัด</SelectItem>
            {THAI_PROVINCES.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">ช่วงราคา/เดือน</Label>
        <div className="space-y-2">
          {priceRanges.map((range) => {
            const isSelected =
              (searchParams.get("minPrice") || "") === range.min &&
              (searchParams.get("maxPrice") || "") === range.max;
            return (
              <div key={range.label} className="flex items-center gap-2">
                <Checkbox
                  id={range.label}
                  checked={isSelected}
                  onCheckedChange={() =>
                    handlePriceChange(range.min, range.max)
                  }
                />
                <label
                  htmlFor={range.label}
                  className="text-sm cursor-pointer flex-1"
                >
                  {range.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearAllFilters}
        >
          <X className="mr-2 h-4 w-4" />
          ล้างตัวกรอง
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <Card className="hidden lg:block sticky top-20">
        <CardHeader>
          <CardTitle className="text-lg">ตัวกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          {renderFilterContent()}
        </CardContent>
      </Card>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden w-full">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            ตัวกรอง
            {hasFilters && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                มีตัวกรอง
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>ตัวกรอง</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {renderFilterContent()}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
