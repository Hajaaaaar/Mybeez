package com.Mybeez.TeamB.TeamB.Unit;

import com.Mybeez.TeamB.TeamB.exception.EncryptionException;
import com.Mybeez.TeamB.TeamB.service.EncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionServiceTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new EncryptionService();
        // Manually set the secret key instead of using an environment variable for testing
        // Use ReflectionTestUtils to set the private 'secretKeyBase64' field
        String testKey = "rPR9NEzwmbIcHXds3EMy2j6jWIL0+/195aieKoTUVn4="; // A valid Base64 32-byte key
        ReflectionTestUtils.setField(encryptionService, "secretKeyBase64", testKey);
        encryptionService.init(); // Manually call the @PostConstruct method
    }

    @Test
    void encrypt_thenDecrypt_shouldReturnOriginalText() {
        // Arrange
        String originalText = "This is a highly secret message.";

        // Act
        String encryptedText = encryptionService.encrypt(originalText);
        String decryptedText = encryptionService.decrypt(encryptedText);

        // Assert
        assertNotNull(encryptedText);
        assertNotEquals(originalText, encryptedText, "Encrypted text should not be the same as the original");
        assertEquals(originalText, decryptedText, "Decrypted text should match the original");
    }

    @Test
    void decrypt_withMalformedCiphertext_shouldThrowEncryptionException() {
        // Arrange
        String malformedText = "v1:this-is-not-valid-base64";

        // Act, Assert
        assertThrows(EncryptionException.class, () -> {
            encryptionService.decrypt(malformedText);
        }, "Should throw EncryptionException for malformed data");
    }

    @Test
    void decrypt_withWrongVersion_shouldThrowEncryptionException() {
        // Arrange
        String wrongVersionText = "v2:some:data";

        // Act, Assert
        assertThrows(EncryptionException.class, () -> {
            encryptionService.decrypt(wrongVersionText);
        }, "Should throw EncryptionException for an unsupported version");
    }
}