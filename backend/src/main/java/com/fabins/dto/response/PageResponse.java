package com.fabins.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * A stable, paginated envelope for list endpoints.
 *
 * <p>Spring Data's own {@code Page} serialises to JSON with a large, unstable
 * shape that includes internal details such as the {@code Pageable} and its
 * sort configuration. Its structure has changed across Spring versions, so
 * returning it directly would let a library upgrade break every client.
 * This record is ours, so its shape only changes when we decide it does.
 *
 * @param content       the items on this page
 * @param page          zero-based page number
 * @param size          requested page size
 * @param totalElements total matching items across all pages
 * @param totalPages    total number of pages
 * @param first         whether this is the first page
 * @param last          whether this is the final page
 * @param <T>           the response type of a single item
 */
@Schema(description = "One page of results")
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {
    /**
     * Wraps a Spring Data page, converting each entity with {@code mapper}.
     *
     * @param page   the page returned by a repository
     * @param mapper converts one entity into its response representation
     */
    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
