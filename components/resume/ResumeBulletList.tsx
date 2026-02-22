'use client'

import React, { useState, useEffect } from 'react'
import RichTextEditor from '@/components/ui/RichTextEditor'
import { TextNode } from '@/types/resume'
import { emptyTextNodes } from '@/lib/utils'

interface ResumeBulletListProps {
  items: TextNode[][]
  onUpdate: (items: TextNode[][]) => void
  className?: string
  itemClassName?: string
  contentEditableClassName?: string
  renderBullet?: (index: number) => React.ReactNode
}

export const ResumeBulletList = ({
  items = [],
  onUpdate,
  className,
  itemClassName,
  contentEditableClassName,
  renderBullet,
}: ResumeBulletListProps) => {
  const [focusIndex, setFocusIndex] = useState<number | null>(null)

  useEffect(() => {
    if (focusIndex !== null) {
      setTimeout(() => {
        const item = document.querySelector(
          `[data-bullet-index="${focusIndex}"]`,
        )
        if (item) {
          ;(item as HTMLElement).focus()
        }
      }, 50)
    }
  }, [focusIndex])

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    index: number,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newItems = [...items]
      newItems.splice(index + 1, 0, emptyTextNodes())
      onUpdate(newItems)
      setFocusIndex(index + 1)
    }

    if (e.key === 'Backspace') {
      const currentText = items[index].map((n) => n.text).join('')
      if (currentText === '' && index > 0) {
        e.preventDefault()
        const newItems = [...items]
        newItems.splice(index, 1)
        onUpdate(newItems)
        setFocusIndex(index - 1)
      }
    }
  }

  const handleChange = (val: TextNode[], index: number) => {
    const newItems = [...items]
    newItems[index] = val
    onUpdate(newItems)
  }

  return (
    <ul className={className}>
      {items.map((bullet, idx) => (
        <li key={idx} className={itemClassName}>
          {renderBullet && renderBullet(idx)}
          <RichTextEditor
            value={bullet}
            onChange={(val) => handleChange(val, idx)}
            className={contentEditableClassName}
            autoFocus={focusIndex === idx}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            data-bullet-index={idx}
          />
        </li>
      ))}
    </ul>
  )
}
