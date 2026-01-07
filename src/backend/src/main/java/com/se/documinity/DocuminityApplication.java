package com.se.documinity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DocuminityApplication {
	public static void main(String[] args) {
		SpringApplication.run(DocuminityApplication.class, args);
	}

}
