package com.carsonchristensen.hive;

import org.springframework.boot.SpringApplication;

public class TestHiveEngineApplication {

	public static void main(String[] args) {
		SpringApplication.from(HiveEngineApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
