"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const CartesianGrid = React.forwardRef<
  typeof RechartsPrimitive.CartesianGrid,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.CartesianGrid>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.CartesianGrid ref={ref} className={cn("stroke-border stroke-dashed", className)} {...props} />
))
CartesianGrid.displayName = "CartesianGrid"

const ChartTooltip = React.forwardRef<
  typeof RechartsPrimitive.Tooltip,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ active, payload, className, content, formatter, ...props }, ref) => {
  if (active && payload && payload.length) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-md dark:border-gray-800 dark:bg-gray-950",
          className,
        )}
        {...props}
      >
        {content ? (
          content({ active, payload, label: payload[0].name })
        ) : (
          <div>
            {payload.map((item, index) => (
              <div
                key={item.dataKey}
                className={cn("flex items-center justify-between gap-x-4", {
                  "text-gray-500": item.dataKey === "remainder",
                })}
              >
                {item.name && <span className="text-gray-500 dark:text-gray-400">{item.name}</span>}
                {formatter ? (
                  formatter(item.value, item.name, item, index)
                ) : (
                  <span className="font-medium text-gray-950 dark:text-gray-50">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  typeof RechartsPrimitive.Tooltip,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    nameKey?: string
  }
>(({ hideLabel = false, hideIndicator = false, nameKey, payload, formatter, ...props }, ref) => {
  return (
    <ChartTooltip
      ref={ref}
      content={({ active, payload: activePayload }) => {
        if (active && activePayload && activePayload.length) {
          const item = activePayload[0]
          return (
            <div
              className={cn(
                "rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-md dark:border-gray-800 dark:bg-gray-950",
              )}
            >
              {!hideLabel && item.name && <div className="text-gray-500 dark:text-gray-400">{item.name}</div>}
              {activePayload.map((item, index) => (
                <div
                  key={item.dataKey}
                  className={cn("flex items-center justify-between gap-x-4", {
                    "text-gray-500": item.dataKey === "remainder",
                  })}
                >
                  {!hideIndicator && (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                  )}
                  {item.name && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {nameKey ? item.payload[nameKey] : item.name}
                    </span>
                  )}
                  {formatter ? (
                    formatter(item.value, item.name, item, index)
                  ) : (
                    <span className="font-medium text-gray-950 dark:text-gray-50">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          )
        }

        return null
      }}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    config: Record<string, { label?: string; color?: string }>
    children: React.ReactElement
  }
>(({ config, className, children, ...props }, ref) => {
  const id = React.useId()
  if (!children || !children.props || !children.props.data) {
    return null
  }

  return (
    <div ref={ref} className={cn("h-[200px] w-full", className)} {...props}>
      {React.cloneElement(children, {
        id,
        width: "100%",
        height: "100%",
        data: children.props.data,
        style: {
          fontSize: "12px",
          fontFamily: "var(--font-sans)",
          ...children.props.style,
        },
        ...children.props,
      })}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

export { ChartContainer, ChartTooltip, ChartTooltipContent, CartesianGrid }
