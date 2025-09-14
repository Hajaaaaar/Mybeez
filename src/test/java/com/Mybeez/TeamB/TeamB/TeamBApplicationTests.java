package com.Mybeez.TeamB.TeamB;

import com.Mybeez.TeamB.TeamB.service.EncryptionService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class TeamBApplicationTests {

	@MockBean
	private EncryptionService encryptionService;

	@Test
	void contextLoads() {
	}

}
