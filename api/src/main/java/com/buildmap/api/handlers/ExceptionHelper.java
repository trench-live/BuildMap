package com.buildmap.api.handlers;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.stream.Collectors;

public final class ExceptionHelper {

    private static final String ENUM_ERROR_TEMPLATE = "Invalid value for %s: '%s'. Allowed values: %s";
    private static final String GET_VALUE_METHOD = "getValue";

    private ExceptionHelper() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static <T extends Throwable> T findCause(Throwable ex, Class<T> targetType) {
        Throwable cause = ex;
        while (cause != null) {
            if (targetType.isInstance(cause)) {
                return targetType.cast(cause);
            }
            cause = cause.getCause();
        }
        return null;
    }

    public static boolean isEnumType(Class<?> type) {
        return type != null && type.isEnum();
    }

    public static String formatEnumErrorMessage(Class<?> enumType, Object invalidValue) {
        String validValues = getValidEnumValues(enumType);
        return String.format(ENUM_ERROR_TEMPLATE,
                enumType.getSimpleName(), invalidValue, validValues);
    }

    public static String getValidEnumValues(Class<?> enumClass) {
        if (!enumClass.isEnum()) {
            return "Not an enum type";
        }

        return Arrays.stream(enumClass.getEnumConstants())
                .map(value -> "'" + ((Enum<?>) value).name() + "'")
                .collect(Collectors.joining(", "));
    }
}