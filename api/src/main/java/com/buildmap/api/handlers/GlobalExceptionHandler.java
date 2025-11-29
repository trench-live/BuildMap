package com.buildmap.api.handlers;

import com.buildmap.api.exceptions.*;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Error messages
    private static final String TELEGRAM_ID_CONSTRAINT = "users.telegram_id";
    private static final String DATABASE_OPERATION_FAILED = "Database operation failed";
    private static final String TELEGRAM_ID_EXISTS = "User with this Telegram ID already exists";
    private static final String VALIDATION_FAILED = "Validation failed";
    private static final String INVALID_REQUEST_FORMAT = "Invalid request format";
    private static final String INVALID_ENUM_VALUE = "Invalid enum value";
    private static final String VALIDATION_ERROR = "Validation error";
    private static final String INVALID_ROLE = "Invalid role";
    private static final String USER_NOT_FOUND = "User not found";
    private static final String MAPPING_AREA_NOT_FOUND = "Mapping area not found";
    private static final String FLOOR_NOT_FOUND = "Floor not found";
    private static final String FULCRUM_NOT_FOUND = "Fulcrum not found";
    private static final String CONFLICT = "Conflict";
    private static final String DATABASE_ERROR = "Database error";
    private static final String INTERNAL_ERROR = "Internal error";
    private static final String UNEXPECTED_ERROR = "An unexpected error occurred";
    private static final String BUSINESS_RULE_VIOLATION = "Business rule violation";
    private static final String INVALID_TELEGRAM_DATA = "Invalid Telegram data";

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex) {

        InvalidFormatException invalidFormatException =
                ExceptionHelper.findCause(ex, InvalidFormatException.class);

        if (isEnumFormatException(invalidFormatException)) {
            return handleEnumFormatException(invalidFormatException);
        }

        return buildResponse(HttpStatus.BAD_REQUEST, INVALID_REQUEST_FORMAT);
    }

    private boolean isEnumFormatException(InvalidFormatException ex) {
        return ex != null && ExceptionHelper.isEnumType(ex.getTargetType());
    }

    private ResponseEntity<ApiError> handleEnumFormatException(InvalidFormatException ex) {
        Object invalidValue = ex.getValue() != null ? ex.getValue() : "unknown";
        String errorMessage = ExceptionHelper.formatEnumErrorMessage(
                ex.getTargetType(), invalidValue);

        return buildResponse(HttpStatus.BAD_REQUEST, INVALID_ENUM_VALUE, errorMessage);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        String errorMessage = ex.getBindingResult().getAllErrors().stream()
                .map(this::getErrorMessage)
                .collect(Collectors.joining("; "));

        return buildResponse(HttpStatus.BAD_REQUEST, VALIDATION_FAILED, errorMessage);
    }

    private String getErrorMessage(Object error) {
        if (error instanceof FieldError fieldError) {
            return fieldError.getField() + ": " + fieldError.getDefaultMessage();
        }
        return error.toString();
    }

    // Business rule violations - 400 Bad Request
    @ExceptionHandler({
            ValidationException.class,
            FloorAlreadyExistsException.class,
            FulcrumAlreadyExistsException.class,
            ConnectionAlreadyExistsException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<ApiError> handleBusinessRuleViolations(RuntimeException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, BUSINESS_RULE_VIOLATION, ex.getMessage());
    }

    @ExceptionHandler(InvalidRoleException.class)
    public ResponseEntity<ApiError> handleInvalidRoleException(InvalidRoleException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, INVALID_ROLE, ex.getMessage());
    }

    @ExceptionHandler(InvalidTelegramDataException.class)
    public ResponseEntity<ApiError> handleInvalidTelegramDataException(InvalidTelegramDataException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, INVALID_TELEGRAM_DATA, ex.getMessage());
    }

    // Not Found exceptions - 404 Not Found
    @ExceptionHandler({
            UserNotFoundException.class,
            MappingAreaNotFoundException.class,
            FloorNotFoundException.class,
            FulcrumNotFoundException.class
    })
    public ResponseEntity<ApiError> handleNotFoundException(RuntimeException ex) {
        String errorType = getNotFoundErrorType(ex);
        return buildResponse(HttpStatus.NOT_FOUND, errorType, ex.getMessage());
    }

    private String getNotFoundErrorType(RuntimeException ex) {
        if (ex instanceof UserNotFoundException) return USER_NOT_FOUND;
        if (ex instanceof MappingAreaNotFoundException) return MAPPING_AREA_NOT_FOUND;
        if (ex instanceof FloorNotFoundException) return FLOOR_NOT_FOUND;
        if (ex instanceof FulcrumNotFoundException) return FULCRUM_NOT_FOUND;
        return "Not Found";
    }

    // Conflict exceptions - 409 Conflict
    @ExceptionHandler(TelegramIdExistsException.class)
    public ResponseEntity<ApiError> handleTelegramIdExistsException(TelegramIdExistsException ex) {
        return buildResponse(HttpStatus.CONFLICT, CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(JpaSystemException.class)
    public ResponseEntity<ApiError> handleJpaSystemException(JpaSystemException ex) {
        String message = isTelegramIdConstraintViolation(ex)
                ? TELEGRAM_ID_EXISTS
                : DATABASE_OPERATION_FAILED;

        return buildResponse(HttpStatus.CONFLICT, DATABASE_ERROR, message);
    }

    private boolean isTelegramIdConstraintViolation(JpaSystemException ex) {
        return ex.getMessage() != null &&
                ex.getMessage().contains(TELEGRAM_ID_CONSTRAINT);
    }

    // Generic exception handler
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneralException(Exception ex) {
        ex.printStackTrace();
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_ERROR, UNEXPECTED_ERROR);
    }

    private ResponseEntity<ApiError> buildResponse(HttpStatus status, String error) {
        return buildResponse(status, error, error);
    }

    private ResponseEntity<ApiError> buildResponse(HttpStatus status, String error, String message) {
        return ResponseEntity.status(status)
                .body(ApiError.of(status, error, message));
    }
}