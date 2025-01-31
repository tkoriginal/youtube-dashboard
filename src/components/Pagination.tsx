import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-xl">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 hover:bg-gray-50"
      >
        Previous
      </button>

      <span className="text-sm text-gray-700">
        Page {Math.min(currentPage, totalPages)} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  )
}