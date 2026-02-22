'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MonthYearPickerProps {
  initialDate?: string
  onSelect: (dateString: string) => void
  className?: string
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

type DateValue = { month: string; year: number } | 'Present' | null

export const MonthYearPicker = ({
  initialDate,
  onSelect,
  className,
}: MonthYearPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'start' | 'end'>('start')

  // Initialize state based on initialDate parsing if needed, but for simplicity we start empty or parse simple
  const [startDate, setStartDate] = useState<DateValue>(null)
  const [endDate, setEndDate] = useState<DateValue>(null)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isOpen && initialDate) {
      // Simple parser logic (Start - End)
      const parts = initialDate.split(' - ')
      if (parts.length === 2) {
        // Parse Start
        const startParts = parts[0].split(' ')
        if (startParts.length === 2) {
          setStartDate({ month: startParts[0], year: parseInt(startParts[1]) })
        }

        // Parse End
        if (parts[1] === 'Present') {
          setEndDate('Present')
        } else {
          const endParts = parts[1].split(' ')
          if (endParts.length === 2) {
            setEndDate({ month: endParts[0], year: parseInt(endParts[1]) })
            // Set view year to end year initially if it exists
            setViewYear(parseInt(endParts[1]))
          }
        }
      } else {
        // Maybe just a single date or "Present"
        if (initialDate === 'Present') {
          setStartDate(null)
          setEndDate('Present')
        } else {
          const singleParts = initialDate.split(' ')
          if (singleParts.length === 2) {
            setStartDate({
              month: singleParts[0],
              year: parseInt(singleParts[1]),
            })
          }
        }
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, initialDate])

  const handleMonthClick = (month: string) => {
    if (mode === 'start') {
      setStartDate({ month, year: viewYear })
      setMode('end') // Auto-advance to end date
    } else {
      setEndDate({ month, year: viewYear })
    }
  }

  const handlePresentClick = () => {
    setEndDate('Present')
  }

  const handleApply = () => {
    let result = ''

    if (startDate && typeof startDate !== 'string') {
      result += `${startDate.month} ${startDate.year}`
    }

    if (endDate) {
      if (result) result += ' - '
      if (endDate === 'Present') {
        result += 'Present'
      } else {
        result += `${endDate.month} ${endDate.year}`
      }
    }

    onSelect(result)
    setIsOpen(false)
  }

  const renderValue = (val: DateValue) => {
    if (!val) return <span className="text-gray-400 italic">Select</span>
    if (val === 'Present') return 'Present'
    return `${val.month} ${val.year}`
  }

  return (
    <div className={cn('no-print relative inline-block', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
        title="Pick Date Range"
      >
        <Calendar size={14} />
      </button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in absolute top-full right-0 z-[150] mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl duration-150">
          {/* Mode Tabs */}
          <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setMode('start')}
              className={cn(
                'flex-1 rounded-md py-1 text-xs font-bold transition-all',
                mode === 'start'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              Start: {renderValue(startDate)}
            </button>
            <button
              onClick={() => setMode('end')}
              className={cn(
                'flex-1 rounded-md py-1 text-xs font-bold transition-all',
                mode === 'end'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              End: {renderValue(endDate)}
            </button>
          </div>

          {/* Year Navigation */}
          <div className="mb-4 flex items-center justify-between px-2">
            <button
              onClick={() => setViewYear((prev) => prev - 1)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-gray-900">{viewYear}</span>
            <button
              onClick={() => setViewYear((prev) => prev + 1)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Months Grid */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {MONTHS.map((month) => {
              const isSelected =
                (mode === 'start' &&
                  startDate !== 'Present' &&
                  startDate?.month === month &&
                  startDate?.year === viewYear) ||
                (mode === 'end' &&
                  endDate !== 'Present' &&
                  endDate?.month === month &&
                  endDate?.year === viewYear)

              return (
                <button
                  key={month}
                  onClick={() => handleMonthClick(month)}
                  className={cn(
                    'rounded-lg border border-transparent py-2 text-xs font-medium transition-colors',
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600',
                  )}
                >
                  {month}
                </button>
              )
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
            {mode === 'end' && (
              <button
                onClick={handlePresentClick}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-bold transition-colors',
                  endDate === 'Present'
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                )}
              >
                {endDate === 'Present' && <Check size={12} />} Currently work
                here
              </button>
            )}

            <div className="mt-1 flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg py-2 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!startDate}
                className="flex-1 rounded-lg bg-gray-900 py-2 text-xs font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
