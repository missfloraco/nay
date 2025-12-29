<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait Filterable
{
    /**
     * Apply search and filtering to the query.
     */
    public function scopeApplyFilters($query, Request $request)
    {
        $search = $request->query('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                // Get search columns defined in the model, or use defaults
                $searchColumns = property_exists($this, 'searchable') ? $this->searchable : ['name', 'email'];

                foreach ($searchColumns as $column) {
                    $q->orWhere($column, 'LIKE', "%{$search}%");
                }
            });
        }

        // Handle specific column filters (e.g., status=active)
        $filters = $request->query('filters', []);
        if (!empty($filters) && is_array($filters)) {
            foreach ($filters as $column => $value) {
                if ($value !== null && $value !== '') {
                    $query->where($column, $value);
                }
            }
        }

        return $query;
    }

    /**
     * Apply sorting to the query.
     */
    public function scopeApplySort($query, Request $request)
    {
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');

        // Allow child models to define allowed sort columns for security
        $allowedSorts = property_exists($this, 'sortable') ? $this->sortable : ['created_at', 'id', 'name'];

        if (in_array($sortBy, $allowedSorts)) {
            return $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        return $query->latest();
    }

    /**
     * Paginate the results and return standardized response body.
     */
    public function scopePaginateData($query, Request $request)
    {
        $perPage = $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return [
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem(),
                'to' => $paginated->lastItem(),
            ]
        ];
    }
}
