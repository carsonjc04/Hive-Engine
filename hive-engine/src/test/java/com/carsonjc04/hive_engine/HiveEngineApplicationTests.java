package com.carsonjc04.hive_engine;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class HiveEngineApplicationTests {

	@Test
	void contextLoads() {
	}

}
