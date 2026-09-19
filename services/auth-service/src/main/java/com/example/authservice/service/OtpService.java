package com.example.authservice.service;

import com.example.authservice.entity.OtpCode;
import com.example.authservice.model.OtpRequest;
import com.example.authservice.repository.OtpCodeRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int LIFETIME_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    private final OtpCodeRepository otpCodeRepository;

    public OtpService(OtpCodeRepository otpCodeRepository) {
        this.otpCodeRepository = otpCodeRepository;
    }

    @Transactional
    public Map<String, Object> requestOtp(OtpRequest request) {
        String owner = request.emailOrUsername();
        if (owner == null || owner.isBlank()) {
            throw new IllegalArgumentException("Identifiant obligatoire");
        }
        String purpose = normalizePurpose(request.purpose());
        otpCodeRepository.deleteByOwnerAndPurpose(owner, purpose);

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        OtpCode otp = new OtpCode(owner, code, purpose, LocalDateTime.now().plusMinutes(LIFETIME_MINUTES));
        otpCodeRepository.save(otp);

        Map<String, Object> out = new HashMap<>();
        out.put("owner", owner);
        out.put("purpose", purpose);
        out.put("code", code);
        out.put("expireEnMinutes", LIFETIME_MINUTES);
        out.put("message", "Code de s\u00e9curit\u00e9 envoy\u00e9 par e-mail (simulation console)");
        System.out.println("[EMUL-EMAIL] " + owner + " code=" + code + " but=" + purpose);
        return out;
    }

    @Transactional
    public boolean verifyOtp(OtpRequest request, String codeSaisi) {
        String owner = request.emailOrUsername();
        String purpose = normalizePurpose(request.purpose());
        OtpCode otp = otpCodeRepository
                .findTopByOwnerAndPurposeAndUsedFalseOrderByIdDesc(owner, purpose)
                .orElseThrow(() -> new NoSuchElementException("Aucun code en attente pour " + owner));
        if (otp.isExpired()) {
            otp.markUsed();
            otpCodeRepository.save(otp);
            throw new IllegalStateException("Code expir\u00e9, demandez une nouvelle \u00e9mission");
        }
        otp.incrementAttempts();
        if (otp.isExhausted()) {
            otp.markUsed();
            otpCodeRepository.save(otp);
            throw new IllegalStateException("Trop de tentatives, demandez une nouvelle \u00e9mission");
        }
        boolean ok = otp.getCode().equals(codeSaisi);
        if (ok) {
            otp.markUsed();
        }
        otpCodeRepository.save(otp);
        return ok;
    }

    private String normalizePurpose(String raw) {
        if (raw == null || raw.isBlank()) {
            return "LOGIN";
        }
        return raw.trim().toUpperCase(java.util.Locale.ROOT);
    }
}
