package com.fabins.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Turns exceptions into consistent JSON error responses for every endpoint.
 *
 * <h2>Why RFC 9457 Problem Details</h2>
 * Responses use Spring's {@link ProblemDetail}, which implements the
 * {@code application/problem+json} standard. Every error therefore has the same
 * predictable shape — {@code type}, {@code title}, {@code status},
 * {@code detail}, {@code instance} — instead of each endpoint inventing its own.
 * Clients can write one error handler rather than one per call.
 *
 * <h2>What is safe to expose</h2>
 * Messages returned here are written for the caller. Server faults are logged
 * with their stack trace but answered with a generic message: an exception's
 * text can reveal table names, file paths, and library versions, none of which
 * a client should see.
 *
 * <p><strong>To handle a new exception type</strong>, add a method annotated
 * with {@code @ExceptionHandler(YourException.class)}. Order does not matter;
 * Spring picks the most specific match.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Base for the {@code type} URI that identifies each error category. */
    private static final String PROBLEM_BASE = "https://fabins.dev/problems/";

    /**
     * 400 — one or more fields failed Bean Validation.
     *
     * <p>Adds an {@code errors} object mapping each rejected field to its
     * message, so a client can show the error next to the offending input
     * rather than as one lump of text.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationFailure(MethodArgumentNotValidException exception) {
        // LinkedHashMap keeps field order stable, which keeps responses (and
        // the tests that assert on them) deterministic.
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "One or more fields are invalid. See 'errors' for details.");
        problem.setTitle("Validation failed");
        problem.setType(URI.create(PROBLEM_BASE + "validation-failed"));
        problem.setProperty("errors", fieldErrors);
        problem.setProperty("timestamp", Instant.now());

        return problem;
    }

    /** 404 — the requested resource does not exist. */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Resource not found");
        problem.setType(URI.create(PROBLEM_BASE + "resource-not-found"));
        problem.setProperty("timestamp", Instant.now());

        return problem;
    }

    /**
     * 400 — the body was absent, malformed JSON, or had an unparseable value
     * such as an unknown enum constant.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleUnreadableBody(HttpMessageNotReadableException exception) {
        // The raw message quotes the offending JSON and class names, so it is
        // logged rather than returned.
        log.debug("Unreadable request body", exception);

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Request body is missing or is not valid JSON.");
        problem.setTitle("Malformed request");
        problem.setType(URI.create(PROBLEM_BASE + "malformed-request"));
        problem.setProperty("timestamp", Instant.now());

        return problem;
    }

    /** 400 — a path variable or query parameter had the wrong type. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Parameter '%s' has an invalid value.".formatted(exception.getName()));
        problem.setTitle("Invalid parameter");
        problem.setType(URI.create(PROBLEM_BASE + "invalid-parameter"));
        problem.setProperty("timestamp", Instant.now());

        return problem;
    }

    /**
     * 500 — the catch-all.
     *
     * <p>Logs the full stack trace and returns a deliberately vague message.
     * An unexpected exception means a bug on our side, and its text is for the
     * developers reading the logs, not for the caller.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception exception) {
        log.error("Unhandled exception", exception);

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later.");
        problem.setTitle("Internal server error");
        problem.setType(URI.create(PROBLEM_BASE + "internal-error"));
        problem.setProperty("timestamp", Instant.now());

        return problem;
    }
}
