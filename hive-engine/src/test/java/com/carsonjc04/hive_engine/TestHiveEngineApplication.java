package com.carsonjc04.hive_engine;

import org.springframework.boot.SpringApplication;

public class TestHiveEngineApplication {

	public static void main(String[] args) {
		SpringApplication.from(HiveEngineApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
