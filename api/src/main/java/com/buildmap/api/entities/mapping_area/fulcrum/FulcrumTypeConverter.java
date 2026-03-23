package com.buildmap.api.entities.mapping_area.fulcrum;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class FulcrumTypeConverter implements AttributeConverter<FulcrumType, String> {

    @Override
    public String convertToDatabaseColumn(FulcrumType attribute) {
        return attribute != null ? attribute.toDatabaseValue() : null;
    }

    @Override
    public FulcrumType convertToEntityAttribute(String dbData) {
        return FulcrumType.fromDatabaseValue(dbData);
    }
}
