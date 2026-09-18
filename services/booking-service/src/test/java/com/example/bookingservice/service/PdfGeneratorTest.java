package com.example.bookingservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.Test;

class PdfGeneratorTest {

    @Test
    void generatesValidPdfStructure() {
        byte[] pdf = PdfGenerator.simplePdf("Autorisation d'evenement", List.of("Club : CLIC", "Salle : Amphi (Central)"));

        assertThat(pdf).isNotEmpty();
        String content = new String(pdf, StandardCharsets.ISO_8859_1);
        assertThat(content).startsWith("%PDF-1.4");
        assertThat(content).contains("/Type /Catalog");
        assertThat(content).contains("startxref");
        assertThat(content).endsWith("%%EOF\n");
        assertThat(content).contains("Amphi \\(Central\\)");
    }
}
