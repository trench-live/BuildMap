package com.buildmap.api.services;

import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QrPdfService {

    private static final float POINTS_PER_MM = 72f / 25.4f;

    @Value("${qr.base-url}")
    private String qrBaseUrl;

    public byte[] buildQrPdf(List<Fulcrum> fulcrums, int sizeMm) {
        if (fulcrums == null || fulcrums.isEmpty()) {
            return new byte[0];
        }

        float sizePoints = Math.max(40, sizeMm) * POINTS_PER_MM;
        float margin = 36f;
        float labelHeight = 60f;

        try (PDDocument document = new PDDocument()) {
            PDType0Font font = loadFont(document, "/fonts/arial.ttf");
            PDType0Font fontBold = loadFont(document, "/fonts/arialbd.ttf");
            if (font == null) {
                throw new IllegalStateException("Font resource not found");
            }
            for (Fulcrum fulcrum : fulcrums) {
                PDPage page = new PDPage(PDRectangle.A4);
                document.addPage(page);

                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();
                float maxQrSize = Math.min(pageWidth - 2 * margin, pageHeight - 2 * margin - labelHeight);
                float qrSize = Math.min(sizePoints, maxQrSize);

                float qrX = (pageWidth - qrSize) / 2f;
                float qrY = margin + labelHeight;

                BufferedImage qrImage = buildQrImage(buildQrUrl(fulcrum), Math.round(qrSize * 2));
                PDImageXObject pdImage = LosslessFactory.createFromImage(document, qrImage);

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    contentStream.drawImage(pdImage, qrX, qrY, qrSize, qrSize);

                    float textY = margin + labelHeight - 18;
                    contentStream.beginText();
                    contentStream.setFont(fontBold != null ? fontBold : font, 14);
                    contentStream.newLineAtOffset(margin, textY);
                    contentStream.showText(buildNameLabel(fulcrum));
                    contentStream.endText();

                    contentStream.beginText();
                    contentStream.setFont(font, 12);
                    contentStream.newLineAtOffset(margin, textY - 18);
                    String floorLabel = buildFloorLabel(fulcrum.getFloor());
                    if (floorLabel != null) {
                        contentStream.showText(floorLabel);
                    }
                    contentStream.endText();

                    contentStream.beginText();
                    contentStream.setFont(font, 12);
                    contentStream.newLineAtOffset(margin, textY - 36);
                    contentStream.showText("ID: " + fulcrum.getId());
                    contentStream.endText();
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException | WriterException e) {
            throw new IllegalStateException("Failed to build QR PDF", e);
        }
    }

    private String buildQrUrl(Fulcrum fulcrum) {
        String base = qrBaseUrl != null ? qrBaseUrl.trim() : "";
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/navigation?fulcrum=" + fulcrum.getId();
    }

    private BufferedImage buildQrImage(String content, int sizePx) throws WriterException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1);
        BitMatrix matrix = new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, sizePx, sizePx, hints);
        return MatrixToImageWriter.toBufferedImage(matrix);
    }

    private String buildNameLabel(Fulcrum fulcrum) {
        String name = fulcrum.getName();
        if (name == null || name.isBlank()) {
            return "Fulcrum " + fulcrum.getId();
        }
        return name;
    }

    private String buildFloorLabel(Floor floor) {
        if (floor == null) return null;
        if (floor.getName() != null && !floor.getName().isBlank()) {
            return "Floor: " + floor.getName();
        }
        if (floor.getLevel() != null) {
            return "Floor: L" + floor.getLevel();
        }
        return null;
    }

    private PDType0Font loadFont(PDDocument document, String resourcePath) {
        try {
            if (getClass().getResourceAsStream(resourcePath) == null) {
                return null;
            }
            return PDType0Font.load(document, getClass().getResourceAsStream(resourcePath), true);
        } catch (IOException e) {
            return null;
        }
    }
}
