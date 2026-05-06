package com.logistics.shipment_tracker.util;

import org.apache.commons.text.StringEscapeUtils;
import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {

    public String sanitize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        String noTags = trimmed.replaceAll("<", "").replaceAll(">", "");
        return StringEscapeUtils.escapeHtml4(noTags);
    }
}
