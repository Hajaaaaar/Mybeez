package com.Mybeez.TeamB.TeamB.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidMessageContentException extends RuntimeException {
    public InvalidMessageContentException(String message) {
        super(message);
    }
}