"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string // format "HH:mm AM/PM"
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function TimePicker({ value, onChange, disabled, className }: TimePickerProps) {
  // Parse initial value "HH:mm AM/PM"
  const initialHour = value ? value.split(":")[0] : "10"
  const initialMinute = value ? value.split(":")[1].split(" ")[0] : "00"
  const initialPeriod = value ? value.split(" ")[1] : "AM"

  const [hour, setHour] = React.useState(initialHour)
  const [minute, setMinute] = React.useState(initialMinute)
  const [period, setPeriod] = React.useState(initialPeriod)

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutes = ["00", "15", "30", "45"]

  React.useEffect(() => {
    if (onChange) {
      onChange(`${hour}:${minute} ${period}`)
    }
  }, [hour, minute, period])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-between bg-white border rounded-md p-1 shadow-sm w-full">
          <div className="flex items-center gap-1 px-2 text-gray-400">
             <Clock className="h-4 w-4" />
          </div>
          
          <div className="flex items-center gap-1 flex-1 justify-center">
            {/* Hour */}
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              disabled={disabled}
              className="bg-transparent text-sm font-semibold outline-none cursor-pointer appearance-none px-2 hover:text-blue-600 transition-colors"
            >
              {hours.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            
            <span className="text-gray-400 font-bold">:</span>
            
            {/* Minute */}
            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              disabled={disabled}
              className="bg-transparent text-sm font-semibold outline-none cursor-pointer appearance-none px-2 hover:text-blue-600 transition-colors"
            >
              {minutes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            
            {/* Period */}
            <div className="flex ml-2 bg-gray-100 rounded p-0.5">
              {["AM", "PM"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  disabled={disabled}
                  className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded transition-all",
                    period === p 
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 italic">
        Current selection: <span className="text-blue-500 font-medium">{hour}:{minute} {period}</span>
      </p>
    </div>
  )
}
