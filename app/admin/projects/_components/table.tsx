import { flexRender } from '@tanstack/react-table'
import { Button, Skeleton } from '@/components/ui'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProjectsPageContext } from '../providers'

export function ProjectsTable() {
  const {
    projects,
    isLoading,
    table,
    pagination,
  } = useProjectsPageContext()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="p-6">
        <p>Проекты не найдены</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length
              ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )
              : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      <Pagination className="justify-end m-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                pagination.prev()}
              aria-disabled={pagination.isFirstPage}
              tabIndex={pagination.isFirstPage ? -1 : undefined}
              className={pagination.isFirstPage ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>

          {(() => {
            const maxVisiblePages = 5
            const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2))
            const endPage = Math.min(pagination.pageCount, startPage + maxVisiblePages - 1)

            return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
              const pageNumber = startPage + i
              return (
                <PaginationItem key={pageNumber}>
                  <Button
                    variant={pagination.page === pageNumber ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => pagination.setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                </PaginationItem>
              )
            })
          })()}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                pagination.next()}
              aria-disabled={!(pagination.page < pagination.pageCount)}
              tabIndex={!(pagination.page < pagination.pageCount) ? -1 : undefined}
              className={
                !(pagination.page < pagination.pageCount) ? 'pointer-events-none opacity-50' : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}
