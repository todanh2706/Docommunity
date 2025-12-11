package com.se.documinity.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.se.documinity.dto.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import com.se.documinity.dto.ResponseDTO;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult()
                .getAllErrors()
                .getFirst()
                .getDefaultMessage();

        ErrorResponse errorResponse = new ErrorResponse(errorMessage);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        return new ResponseEntity<>(responseDTO, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ResponseDTO> handleUserExists(UserAlreadyExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        return new ResponseEntity<>(responseDTO, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(TagNotFoundException.class)
    public ResponseEntity<ResponseDTO> handleTagNotFound(TagNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        return new ResponseEntity<>(responseDTO, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ResponseDTO> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        return new ResponseEntity<>(responseDTO, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NotAuthorizedException.class)
    public ResponseEntity<ResponseDTO> handleNotAuthorized(NotAuthorizedException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        return new ResponseEntity<>(responseDTO, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<ResponseDTO> handleBadCredentials(
            org.springframework.security.authentication.BadCredentialsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        return new ResponseEntity<>(responseDTO, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(DocumentNotFoundException.class)
    public ResponseEntity<ResponseDTO> handleDocumentNotFound(DocumentNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        return new ResponseEntity<>(responseDTO, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NoContentToRefineException.class)
    public ResponseEntity<ResponseDTO> handleNoContentToRefine(NoContentToRefineException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        return new ResponseEntity<>(responseDTO, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDTO> handleGenericException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(errorResponse);
        responseDTO.setMessage("error");
        responseDTO.setDetail("A generic error occurred");
        return new ResponseEntity<>(responseDTO, HttpStatus.BAD_REQUEST);
    }

}
