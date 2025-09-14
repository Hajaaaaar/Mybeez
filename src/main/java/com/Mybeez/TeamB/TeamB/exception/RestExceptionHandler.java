package com.Mybeez.TeamB.TeamB.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice

public class RestExceptionHandler extends ResponseEntityExceptionHandler {


    // This method will automatically catch errors from the @Valid annotation.
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }


    // This will continue to handle your custom exception.
    @ExceptionHandler(value = { InvalidMessageContentException.class })
    protected ResponseEntity<Object> handleInvalidMessageContent(InvalidMessageContentException ex, WebRequest request) {
        Map<String, String> body = Map.of("error", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }


    /**
     * Handles errors related to encryption or decryption, returning a generic
     * server error to avoid leaking security details
     */
    @ExceptionHandler(value = { EncryptionException.class })
    protected ResponseEntity<Object> handleEncryptionFailure(EncryptionException ex, WebRequest request) {
        // Log the detailed error for developers to see
        System.err.println("A critical encryption/decryption error occurred: " + ex.getMessage());

        // Return a generic error to the user
        Map<String, String> body = Map.of("error", "A server error occurred while processing your request.");
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

