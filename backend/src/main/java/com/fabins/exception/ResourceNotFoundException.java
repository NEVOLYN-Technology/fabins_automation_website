package com.fabins.exception;

/**
 * Thrown when a request names a resource that does not exist.
 *
 * <p>Translated into a 404 with an RFC 9457 body by
 * {@link GlobalExceptionHandler}. Services throw this instead of returning
 * {@code Optional} or {@code null} to their callers, which keeps the "not
 * found" decision in one place rather than repeated in every controller.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * @param resource human-readable resource name, e.g. {@code "Deployment request"}
     * @param id       the identifier that was not found
     */
    public ResourceNotFoundException(String resource, Object id) {
        super("%s %s was not found".formatted(resource, id));
    }
}
