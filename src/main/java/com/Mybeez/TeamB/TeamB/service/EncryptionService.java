package com.Mybeez.TeamB.TeamB.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.Mybeez.TeamB.TeamB.exception.EncryptionException;


import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM Encryption service with versioned ciphertexts
 * Format: v1:BASE64(IV):BASE64(CIPHERTEXT_WITH_TAG)
 */
@Service
public class EncryptionService {

    private static final String CIPHER_TRANSFORMATION = "AES/GCM/NoPadding";
    private static final String KEY_ALG = "AES";
    private static final int IV_LENGTH_BYTES = 12;      // GCM-recommended IV length
    private static final int TAG_LENGTH_BITS = 128;     // Auth tag size
    private static final String VERSION_PREFIX = "v1";

    // Base64-encoded 32-byte (256-bit) key. Generated with: `openssl rand -base64 32`
    @Value("${message.encryption.key}")
    private String secretKeyBase64;

    private SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void init() {
        if (secretKeyBase64 == null || secretKeyBase64.isBlank()) {
            throw new EncryptionException("Encryption key is missing (message.encryption.key).");
        }
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(secretKeyBase64);
        } catch (IllegalArgumentException e) {
            throw new EncryptionException("Encryption key must be Base64-encoded.", e);
        }
        if (keyBytes.length != 32) {
            throw new EncryptionException("Encryption key must be 256 bits (32 bytes) after Base64 decoding.");
        }
        this.secretKey = new SecretKeySpec(keyBytes, KEY_ALG);
    }

    /**
     * Encrypts plaintext with AES-256-GCM
     * @param plainText UTF-8 plaintext
     * @return versioned ciphertext: v1:BASE64(IV):BASE64(CIPHERTEXT_WITH_TAG)
     */
    public String encrypt(String plainText) {
        if (plainText == null) return null;
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            String ivB64 = Base64.getEncoder().encodeToString(iv);
            String ctB64 = Base64.getEncoder().encodeToString(cipherText);
            return VERSION_PREFIX + ":" + ivB64 + ":" + ctB64;
        } catch (Exception e) {
            throw new EncryptionException("Error encrypting data.", e);
        }
    }

    /**
     * Decrypts versioned ciphertext produced by {@link #encrypt(String)}
     * @param encrypted versioned ciphertext: v1:BASE64(IV):BASE64(CIPHERTEXT_WITH_TAG)
     * @return UTF-8 plaintext
     */
    public String decrypt(String encrypted) {
        if (encrypted == null) return null;
        try {
            String[] parts = encrypted.split(":", 3);
            if (parts.length != 3 || !VERSION_PREFIX.equals(parts[0])) {
                throw new EncryptionException("Unsupported or malformed ciphertext format.");
            }
            byte[] iv = Base64.getDecoder().decode(parts[1]);
            byte[] cipherText = Base64.getDecoder().decode(parts[2]);

            if (iv.length != IV_LENGTH_BYTES) {
                throw new EncryptionException("Invalid IV length for AES-GCM.");
            }

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] plain = cipher.doFinal(cipherText);

            return new String(plain, StandardCharsets.UTF_8);
        } catch (EncryptionException e) {
            throw e; // already sanitized
        } catch (Exception e) {
            // Wrong key, tampered data, or corrupted ciphertext typically land here
            throw new EncryptionException("Error decrypting data.", e);
        }
    }

    // Expose for tests
    SecretKey getSecretKey() {
        return secretKey;
    }
}
