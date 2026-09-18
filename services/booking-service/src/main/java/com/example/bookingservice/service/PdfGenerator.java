package com.example.bookingservice.service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Générateur PDF minimaliste (sans dépendance externe) utilisé pour produire
 * le procès-verbal signé et cacheté par le doyen pour les demandes d'événement.
 */
public final class PdfGenerator {

    private PdfGenerator() {
    }

    public static byte[] simplePdf(String title, List<String> lines) {
        StringBuilder content = new StringBuilder();
        content.append("BT\n/F1 18 Tf\n50 800 Td\n(").append(escape(title)).append(") Tj\nET\n");
        content.append("0.85 0.6 0.2 RG\n2 w\n50 785 m 545 785 l S\n");
        content.append("0 0 0 RG\nBT\n/F1 11 Tf\n50 750 Td\n16 TL\n");
        for (String line : lines) {
            content.append("(").append(escape(line)).append(") Tj\nT*\n");
        }
        content.append("ET\n");
        content.append("BT\n/F1 10 Tf\n50 120 Td\n(Le Doyen de la FST Settat) Tj\nET\n");
        content.append("BT\n/F1 10 Tf\n50 100 Td\n(Signe et cachete electroniquement) Tj\nET\n");
        content.append("0.85 0.6 0.2 RG\n1.5 w\n400 95 m 540 95 l 540 145 l 400 145 l S\n");
        content.append("BT\n/F1 12 Tf\n430 115 Td\n(CACHET FST) Tj\nET\n");

        byte[] stream = content.toString().getBytes(StandardCharsets.ISO_8859_1);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int[] offsets = new int[6];
        write(out, "%PDF-1.4\n");

        offsets[1] = out.size();
        write(out, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

        offsets[2] = out.size();
        write(out, "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

        offsets[3] = out.size();
        write(out, "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
                + "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");

        offsets[4] = out.size();
        write(out, "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n");

        offsets[5] = out.size();
        write(out, "5 0 obj\n<< /Length " + stream.length + " >>\nstream\n");
        writeBytes(out, stream);
        write(out, "\nendstream\nendobj\n");

        int xref = out.size();
        write(out, "xref\n0 6\n0000000000 65535 f \n");
        for (int i = 1; i <= 5; i++) {
            write(out, String.format("%010d 00000 n \n", offsets[i]));
        }
        write(out, "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");

        return out.toByteArray();
    }

    private static void write(ByteArrayOutputStream out, String value) {
        writeBytes(out, value.getBytes(StandardCharsets.ISO_8859_1));
    }

    private static void writeBytes(ByteArrayOutputStream out, byte[] bytes) {
        out.write(bytes, 0, bytes.length);
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        String ascii = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return ascii.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }
}
