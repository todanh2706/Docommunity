package com.se.documinity.dto;

import lombok.Data;

@Data
public class ResponseDTO {
    private Object data;
    private String message;
    private String detail;
}
