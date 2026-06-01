"use client"

import { Toaster as HotToaster, type ToasterProps } from "react-hot-toast"

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  return (
    <HotToaster
      toastOptions={{
        // Apply the app font (IBM Plex Sans Thai via --font-sans) to toasts,
        // which render in a portal outside the themed layout tree.
        className: "font-sans text-sm",
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
        },
        ...toastOptions,
      }}
      {...props}
    />
  )
}

export { Toaster }
