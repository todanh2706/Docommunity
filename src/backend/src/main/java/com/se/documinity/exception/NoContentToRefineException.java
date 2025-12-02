package com.se.documinity.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public class NoContentToRefineException extends RuntimeException {
    public NoContentToRefineException(String message) {
        super(message);
    }
}