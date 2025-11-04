import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <div
      className="group/native-select relative w-fit has-[select:disabled]:opacity-50"
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        className={cn(
          "border-gray-200 placeholder:text-gray-500 selection:bg-gray-900 selection:text-gray-50 dark:bg-gray-200/30 dark:hover:bg-gray-200/50 h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed dark:border-gray-800 dark:placeholder:text-gray-400 dark:selection:bg-gray-50 dark:selection:text-gray-900 dark:dark:bg-gray-800/30 dark:dark:hover:bg-gray-800/50",
          "focus-visible:border-gray-950 focus-visible:ring-gray-950/50 focus-visible:ring-[3px] dark:focus-visible:border-gray-300 dark:focus-visible:ring-gray-300/50",
          "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 dark:aria-invalid:ring-red-900/20 dark:dark:aria-invalid:ring-red-900/40 dark:aria-invalid:border-red-900",
          className
        )}
        {...props}
      />
      <ChevronDownIcon
        className="text-gray-500 pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 opacity-50 select-none dark:text-gray-400"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({ ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn(className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
