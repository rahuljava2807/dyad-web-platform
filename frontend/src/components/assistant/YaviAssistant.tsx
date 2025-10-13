/**
 * Yavi Assistant - Main Container Component
 *
 * The complete AI assistant widget with draggable/resizable functionality.
 * Connects to Yavi.ai namespace for context-aware, domain-specific assistance.
 */

'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Lightbulb } from 'lucide-react'
import { useAssistant, useAssistantUI } from '@/contexts/AssistantContext'
import { AssistantHeader } from './AssistantHeader'
import { ContextDisplay } from './ContextDisplay'
import { SuggestionList } from './SuggestionList'
import { InsightPanel } from './InsightPanel'
import { ConversationInterface } from './ConversationInterface'
import { AssistantFooter } from './AssistantFooter'
import type { TabType } from '@/types/assistant'

export function YaviAssistant() {
  const { toggleMinimized, toggleOpen, setActiveTab, updatePosition, updateSize, dispatch } =
    useAssistant()
  const ui = useAssistantUI()

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Resize state
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const widgetRef = useRef<HTMLDivElement>(null)

  // Handle dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (ui.isMinimized) return

      const rect = widgetRef.current?.getBoundingClientRect()
      if (!rect) return

      setIsDragging(true)
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })

      dispatch({ type: 'UI_STATE_CHANGED', payload: { isDragging: true } })
    },
    [ui.isMinimized, dispatch]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Keep widget within viewport
        const maxX = window.innerWidth - ui.size.width
        const maxY = window.innerHeight - ui.size.height

        updatePosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        })
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y

        const newWidth = Math.max(320, Math.min(resizeStart.width + deltaX, 600))
        const newHeight = Math.max(400, Math.min(resizeStart.height + deltaY, 800))

        updateSize({
          width: newWidth,
          height: newHeight,
        })
      }
    },
    [isDragging, isResizing, dragOffset, resizeStart, updatePosition, updateSize, ui.size]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      dispatch({ type: 'UI_STATE_CHANGED', payload: { isDragging: false } })
    }
    if (isResizing) {
      setIsResizing(false)
      dispatch({ type: 'UI_STATE_CHANGED', payload: { isResizing: false } })
    }
  }, [isDragging, isResizing, dispatch])

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsResizing(true)
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: ui.size.width,
        height: ui.size.height,
      })
      dispatch({ type: 'UI_STATE_CHANGED', payload: { isResizing: true } })
    },
    [ui.size, dispatch]
  )

  // Attach global mouse listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  // Render minimized badge
  if (ui.isMinimized || !ui.isOpen) {
    return (
      <button
        onClick={toggleMinimized}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group z-50"
        aria-label="Open Yavi Assistant"
      >
        <Lightbulb className="w-6 h-6 text-white group-hover:animate-pulse" />
        {ui.notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-bounce">
            {ui.notificationCount}
          </span>
        )}
      </button>
    )
  }

  // Render full widget
  return (
    <div
      ref={widgetRef}
      className="fixed z-50 flex flex-col bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700"
      style={{
        left: ui.position.x,
        top: ui.position.y,
        width: ui.size.width,
        height: ui.size.height,
        cursor: isDragging ? 'move' : isResizing ? 'nwse-resize' : 'default',
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        className="cursor-move"
      >
        <AssistantHeader onMinimize={toggleMinimized} onClose={toggleOpen} />
      </div>

      {/* Context Display */}
      <ContextDisplay />

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-700 bg-slate-900">
        <TabButton
          active={ui.activeTab === 'suggestions'}
          onClick={() => setActiveTab('suggestions')}
          label="Suggestions"
          count={ui.notificationCount}
        />
        <TabButton
          active={ui.activeTab === 'insights'}
          onClick={() => setActiveTab('insights')}
          label="Insights"
        />
        <TabButton
          active={ui.activeTab === 'conversation'}
          onClick={() => setActiveTab('conversation')}
          label="Chat"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {ui.activeTab === 'suggestions' && <SuggestionList />}
        {ui.activeTab === 'insights' && <InsightPanel />}
        {ui.activeTab === 'conversation' && <ConversationInterface />}
      </div>

      {/* Footer */}
      <AssistantFooter />

      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group"
      >
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-slate-600 group-hover:border-blue-400 transition-colors" />
      </div>
    </div>
  )
}

/**
 * Tab Button Component
 */
interface TabButtonProps {
  active: boolean
  onClick: () => void
  label: string
  count?: number
}

function TabButton({ active, onClick, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors relative ${
        active
          ? 'text-white bg-slate-800 border-b-2 border-blue-500'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      {label}
      {count && count > 0 && (
        <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
          {count}
        </span>
      )}
    </button>
  )
}
