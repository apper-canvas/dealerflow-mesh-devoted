import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const BranchSelector = ({ branches, selectedBranch, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (branch) => {
    onChange(branch);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[200px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <ApperIcon name="Building2" size={16} />
          <span>
            {selectedBranch ? selectedBranch.name : "Select Branch"}
          </span>
        </div>
        <ApperIcon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
        />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-20 mt-1 w-full min-w-[280px] bg-white border border-slate-200 rounded-md shadow-lg">
            <div className="py-2 max-h-60 overflow-y-auto">
              {branches.map((branch) => (
                <button
                  key={branch.Id}
                  onClick={() => handleSelect(branch)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors",
                    "flex items-center justify-between",
                    selectedBranch?.Id === branch.Id && "bg-primary-50 text-primary-600"
                  )}
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {branch.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {branch.location}
                    </div>
                  </div>
                  {selectedBranch?.Id === branch.Id && (
                    <ApperIcon name="Check" size={16} className="text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BranchSelector;