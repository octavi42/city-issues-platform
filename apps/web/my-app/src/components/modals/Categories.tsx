"use client";
import { useState, useEffect } from "react";
import {
  Sheet,
  Scroll,
  VisuallyHidden,
} from "@silk-hq/components";
import { fetchCategories, countIssuesPerCategory } from "@/lib/neo4j-queries";
import { Category } from "@/lib/neo4j-schema";
import { SheetWithDetent } from "@/components/examples/SheetWithDetent/SheetWithDetent";
import "@/components/examples/SheetWithDetent/ExampleSheetWithDetent.css";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

// Interface for category with issue count
interface CategoryWithCount extends Category {
  issueCount?: number;
}

// Number of skeleton items to show while loading
const SKELETON_COUNT = 5;

const CategoriesSheetWrapper = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch categories and their issue counts from the graph database
  useEffect(() => {
    const loadCategoriesWithCounts = async () => {
      try {
        setIsLoading(true);
        // Fetch categories and counts in parallel
        const [fetchedCategories, issueCounts] = await Promise.all([
          fetchCategories(),
          countIssuesPerCategory()
        ]);
        
        console.log("Categories:", fetchedCategories);
        console.log("Issue counts:", issueCounts);
        
        // Merge the data
        const categoriesWithCounts = fetchedCategories.map(category => {
          const countInfo = issueCounts.find(c => c.category_id === category.category_id);
          return {
            ...category,
            issueCount: countInfo ? Number(countInfo.count) : 0
          };
        });
        
        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoriesWithCounts();
  }, []);

  // Filter categories based on search text
  const filteredCategories = categories.filter((category) =>
    `${category.name || ""}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  // Render skeleton loading state
  const renderSkeletons = () => {
    return Array(SKELETON_COUNT).fill(0).map((_, index) => (
      <div 
        key={`skeleton-${index}`}
        className="ExampleSheetWithDetent-contactContainer flex items-center"
      >
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ExampleSheetWithDetent-contactDetails flex items-center">
          <Skeleton className="h-5 w-32 ml-3" />
        </div>
      </div>
    ));
  };

  return (
    <SheetWithDetent
      presentTrigger={
        <Sheet.Trigger>
          <div 
            className="bg-gray-100 rounded-full py-2 px-4 text-sm font-semibold tracking-wide hover:bg-gray-200 transition-colors duration-150"
          >
            <span>View all</span>
          </div>
        </Sheet.Trigger>
      }
      sheetContent={({ setActiveDetent, reachedLastDetent }) => (
        <div className="ExampleSheetWithDetent-root">
          <div className="ExampleSheetWithDetent-header">
            <Sheet.Handle className="ExampleSheetWithDetent-handle" />
            <VisuallyHidden.Root asChild>
              <Sheet.Title className="ExampleSheetWithDetent-title">
                Categories
              </Sheet.Title>
            </VisuallyHidden.Root>
            <input
              className="ExampleSheetWithDetent-input"
              type="text"
              placeholder="Search for a category"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setActiveDetent(2)}
            />
          </div>
          <Scroll.Root asChild>
            <Scroll.View
              scrollGestureTrap={{ yEnd: true }}
              scrollGesture={!reachedLastDetent ? false : "auto"}
              safeArea="layout-viewport"
              onScrollStart={{
                dismissKeyboard: true,
              }}
            >
              <Scroll.Content className="ExampleSheetWithDetent-scrollContent">
                {isLoading ? (
                  renderSkeletons()
                ) : filteredCategories.length === 0 ? (
                  <div className="flex justify-center p-4">
                    <span>No categories found</span>
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <Sheet.Trigger
                      key={category.category_id}
                      action="dismiss"
                      onClick={() => {
                        router.push(`/categories/${category.category_id}`, { scroll: false });
                      }}
                    >
                    <div
                      className="ExampleSheetWithDetent-contactContainer flex items-center cursor-pointer hover:bg-gray-50"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-800 mr-3">
                        {typeof category.issueCount === 'number' ? category.issueCount : '0'}
                      </div>
                      <div className="ExampleSheetWithDetent-contactDetails flex items-center">
                        <div className="ExampleSheetWithDetent-contactFullname">
                          {category.name || "Unnamed Category"}
                        </div>
                      </div>
                    </div>
                    </Sheet.Trigger>
                  ))
                )}
              </Scroll.Content>
            </Scroll.View>
          </Scroll.Root>
        </div>
      )}
    />
  );
};

export { CategoriesSheetWrapper };
