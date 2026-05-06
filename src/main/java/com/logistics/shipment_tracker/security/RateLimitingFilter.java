package com.logistics.shipment_tracker.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logistics.shipment_tracker.exception.ApiError;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int WINDOW_SECONDS = 60;
    private static final int MAX_REQUESTS = 100;

    private final Map<String, WindowCounter> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String key = request.getRemoteAddr();

        WindowCounter counter = buckets.compute(key, (k, existing) -> {
            long now = System.currentTimeMillis() / 1000;
            if (existing == null || now - existing.windowStart >= WINDOW_SECONDS) {
                return new WindowCounter(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (counter.count.get() > MAX_REQUESTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            ApiError error = new ApiError(
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    "Rate limit exceeded. Try again soon.",
                    request.getRequestURI(),
                    LocalDateTime.now()
            );
            response.getWriter().write(objectMapper.writeValueAsString(error));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private record WindowCounter(long windowStart, AtomicInteger count) {
    }
}
